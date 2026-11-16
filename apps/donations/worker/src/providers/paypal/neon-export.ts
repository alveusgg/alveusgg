import {
  PAYPAL_TENDER_TYPE,
  createDonation,
  findAccountIdByEmail,
  findDonationIdsByCustomField,
  findOrCreateAccount,
  formatDateInTimezone,
} from "@alveusgg/neon-crm-api";
import { type Options, envToOptions } from "@alveusgg/neon-crm-api/env";
import * as Sentry from "@sentry/cloudflare";

/**
 * - off: PayPal donations are not sent to Neon (staff import them by hand)
 * - shadow: only look up what an export would do, without writing to Neon
 * - on: create the Neon donation (and the account, if no account has the email)
 */
export type PaypalNeonExportMode = "off" | "shadow" | "on";

// pending: waiting to be exported (without a payload: only a refund is known)
// shadow-account / shadow-new-account: looked up in shadow mode, the donation
//   would be created on an existing / a new account. Exported once "on".
// exists: Neon already has a donation with this transaction ID
// created: exported by this worker
// refunded: fully refunded before it was exported, so it never was
// expired: not exported in time, the donor details were dropped
type ExportState =
  | "pending"
  | "shadow-account"
  | "shadow-new-account"
  | "exists"
  | "created"
  | "refunded"
  | "expired";

const SHADOW_STATES = ["shadow-account", "shadow-new-account"] as const;

export type PaypalNeonExportInput = {
  txnId: string;
  amount: number; // USD cents
  donatedAt: Date;
  email: string;
  firstName: string;
  lastName: string;
};

type ExportPayload = Omit<PaypalNeonExportInput, "txnId" | "donatedAt"> & {
  donatedAt: string;
};

type ExportRow = {
  txnId: string;
  payload: ExportPayload;
  attempts: number;
};

export type PaypalNeonExportResult = {
  processed: number;
  remaining: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const EXPORTS_PER_RUN = 20;
// More failures in a row than this look like an outage rather than a broken
// donation, so the rest waits for the next run
const MAX_CONSECUTIVE_FAILURES = 3;
// Hourly runs, so this reports a donation that has failed for about a day
const REPORT_AFTER_ATTEMPTS = 24;
// Donor details are only kept this long for an export that hasn't happened
const PAYLOAD_RETENTION_DAYS = 30;
// Without donor details, rows only link the transaction to its Neon donation.
// They're kept past PayPal's 180-day dispute window, for refund reports.
const ROW_RETENTION_DAYS = 400;

export async function createIfNotExistsPaypalNeonExportsTable(sql: SqlStorage) {
  sql.exec(`
    CREATE TABLE IF NOT EXISTS paypalNeonExports (
      txnId TEXT PRIMARY KEY,
      payload TEXT,
      state TEXT NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      lastError TEXT,
      neonDonationId TEXT,
      refundedCents INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);
}

function reportExportIssue(
  kind: string,
  context: Record<string, unknown>,
  error?: unknown,
) {
  Sentry.withScope((scope) => {
    scope.setTag("integration", "neon-crm");
    scope.setTag("error.kind", kind);
    scope.setContext("paypalNeonExport", context);
    if (error) Sentry.captureException(error);
    else Sentry.captureMessage(`PayPal Neon export: ${kind}`, "warning");
  });
}

export function parsePaypalNeonExportMode(env: Env): PaypalNeonExportMode {
  const mode = env.PAYPAL_NEON_EXPORT || "off";
  if (mode !== "off" && mode !== "shadow" && mode !== "on") {
    throw new Error(`Invalid PAYPAL_NEON_EXPORT: ${mode}`);
  }
  // Sandbox workers (preview) use the production Neon org, so sandbox
  // payments must never become Neon donations
  if (mode === "on" && env.SANDBOX === "true") {
    console.warn("PAYPAL_NEON_EXPORT=on is ignored in sandbox, using shadow");
    return "shadow";
  }
  return mode;
}

/**
 * Drops donor details that waited too long for an export, also while the
 * export is off, and forgets old exports.
 */
export function cleanUpPaypalNeonExports(sql: SqlStorage, now = new Date()) {
  const expire = (states: string) =>
    sql
      .exec(
        `UPDATE paypalNeonExports
         SET state = 'expired', payload = NULL, updatedAt = ?
         WHERE payload IS NOT NULL AND createdAt < ? AND state IN (${states})
         RETURNING txnId`,
        now.toISOString(),
        new Date(now.getTime() - PAYLOAD_RETENTION_DAYS * DAY_MS).toISOString(),
      )
      .toArray()
      .map((row) => String(row.txnId));
  // Shadow lookups expiring is expected, a pending export expiring is not
  expire(`'shadow-account', 'shadow-new-account'`);
  const expired = expire(`'pending'`);
  if (expired.length) {
    reportExportIssue("export-expired", {
      count: expired.length,
      txnIds: expired.slice(0, 50),
    });
  }

  sql.exec(
    `DELETE FROM paypalNeonExports WHERE payload IS NULL AND updatedAt < ?`,
    new Date(now.getTime() - ROW_RETENTION_DAYS * DAY_MS).toISOString(),
  );
}

export class PaypalNeonExport {
  private running?: Promise<PaypalNeonExportResult>;

  constructor(
    private sql: SqlStorage,
    private options: Options,
    readonly mode: Exclude<PaypalNeonExportMode, "off">,
    private transactionIdFieldId: string,
  ) {}

  static fromEnv(sql: SqlStorage, env: Env) {
    const mode = parsePaypalNeonExportMode(env);
    if (mode === "off") return undefined;
    if (!env.NEON_TRANSACTION_ID_CUSTOM_FIELD_ID) {
      throw new Error(
        "PAYPAL_NEON_EXPORT needs NEON_TRANSACTION_ID_CUSTOM_FIELD_ID",
      );
    }
    return new PaypalNeonExport(
      sql,
      envToOptions(env),
      mode,
      env.NEON_TRANSACTION_ID_CUSTOM_FIELD_ID,
    );
  }

  /** Queues a completed PayPal donation. Repeated IPNs are ignored. */
  enqueue({ txnId, donatedAt, ...donation }: PaypalNeonExportInput) {
    const now = new Date().toISOString();
    const payload: ExportPayload = {
      ...donation,
      donatedAt: donatedAt.toISOString(),
    };
    // A refund can arrive before the completed IPN and leave a row without
    // a payload, which this fills in
    this.sql.exec(
      `INSERT INTO paypalNeonExports (txnId, payload, state, createdAt, updatedAt)
       VALUES (?, ?, 'pending', ?, ?)
       ON CONFLICT(txnId) DO UPDATE SET payload = excluded.payload
       WHERE paypalNeonExports.state = 'pending'
         AND paypalNeonExports.payload IS NULL`,
      txnId,
      JSON.stringify(payload),
      now,
      now,
    );
  }

  /**
   * Records a refund or reversal. A donation that is fully refunded before
   * its export is never exported. Staff are told about refunds of donations
   * that are in Neon, since the Neon donation has to be updated by hand.
   */
  recordRefund(parentTxnId: string, paymentStatus: string, cents: number) {
    const now = new Date().toISOString();
    this.sql.exec(
      `INSERT INTO paypalNeonExports
         (txnId, payload, state, refundedCents, createdAt, updatedAt)
       VALUES (?, NULL, 'pending', ?, ?, ?)
       ON CONFLICT(txnId) DO UPDATE SET
         refundedCents = refundedCents + excluded.refundedCents,
         updatedAt = excluded.updatedAt`,
      parentTxnId,
      cents,
      now,
      now,
    );
    const row = this.sql
      .exec(
        `SELECT state, payload, neonDonationId, refundedCents
         FROM paypalNeonExports WHERE txnId = ?`,
        parentTxnId,
      )
      .one();

    if (row.state === "created" || row.state === "exists") {
      this.reportRefund(parentTxnId, {
        paymentStatus,
        refundedCents: cents,
        neonDonationId: row.neonDonationId,
      });
      return;
    }

    const payload = row.payload
      ? (JSON.parse(String(row.payload)) as ExportPayload)
      : undefined;
    if (payload && Number(row.refundedCents) >= payload.amount) {
      this.finish(parentTxnId, "refunded");
    }
  }

  /** Exports queued donations. Overlapping calls share one run. */
  run(): Promise<PaypalNeonExportResult> {
    this.running ??= this.runOnce().finally(() => {
      this.running = undefined;
    });
    return this.running;
  }

  /** Counts by state, for deciding when shadow mode can be switched on. */
  summary() {
    const counts = Object.fromEntries(
      this.sql
        .exec(
          `SELECT state, COUNT(*) AS count FROM paypalNeonExports GROUP BY state`,
        )
        .toArray()
        .map((row) => [String(row.state), Number(row.count)]),
    );
    return { mode: this.mode, counts };
  }

  private async runOnce(): Promise<PaypalNeonExportResult> {
    cleanUpPaypalNeonExports(this.sql);

    const rows = this.queuedRows(EXPORTS_PER_RUN);
    let processed = 0;
    let consecutiveFailures = 0;
    for (const row of rows) {
      try {
        await this.export(row);
        processed++;
        consecutiveFailures = 0;
      } catch (error) {
        const attempts = row.attempts + 1;
        this.sql.exec(
          `UPDATE paypalNeonExports
           SET attempts = ?, lastError = ?, updatedAt = ? WHERE txnId = ?`,
          attempts,
          error instanceof Error ? error.message : String(error),
          new Date().toISOString(),
          row.txnId,
        );
        console.error("PayPal Neon export failed", {
          txnId: row.txnId,
          attempts,
          error,
        });
        // Retried until the donor details expire, but reported once
        if (attempts === REPORT_AFTER_ATTEMPTS) {
          reportExportIssue(
            "export-delayed",
            { txnId: row.txnId, attempts },
            error,
          );
        }
        if (++consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) break;
      }
    }

    return { processed, remaining: this.queuedRows().length };
  }

  private queuedRows(limit = -1): ExportRow[] {
    // Shadow lookups are exported for real once the export is switched on
    const states =
      this.mode === "on" ? ["pending", ...SHADOW_STATES] : ["pending"];
    return this.sql
      .exec(
        `SELECT txnId, payload, attempts FROM paypalNeonExports
         WHERE payload IS NOT NULL
           AND state IN (${states.map(() => "?").join(", ")})
         ORDER BY createdAt LIMIT ?`,
        ...states,
        limit,
      )
      .toArray()
      .map((row) => ({
        txnId: String(row.txnId),
        payload: JSON.parse(String(row.payload)) as ExportPayload,
        attempts: Number(row.attempts),
      }));
  }

  private refundedCents(txnId: string) {
    return Number(
      this.sql
        .exec(
          `SELECT refundedCents FROM paypalNeonExports WHERE txnId = ?`,
          txnId,
        )
        .one().refundedCents,
    );
  }

  private async export({ txnId, payload }: ExportRow) {
    // Staff imports and earlier attempts put the transaction ID in this field,
    // so a donation that is already in Neon is never created twice
    const existing = await findDonationIdsByCustomField(
      this.options,
      this.transactionIdFieldId,
      txnId,
    );
    if (!existing.ok) throw new Error(`Neon donation search failed`);
    if (existing.data.length > 0) {
      this.finishInNeon(txnId, "exists", existing.data[0]!);
      return;
    }

    if (this.refundedCents(txnId) >= payload.amount) {
      this.finish(txnId, "refunded");
      return;
    }

    if (this.mode === "shadow") {
      const account = await findAccountIdByEmail(this.options, payload.email);
      if (!account.ok) throw new Error(`Neon account search failed`);
      // Keeps the payload, so the donation is exported once switched on
      this.sql.exec(
        `UPDATE paypalNeonExports SET state = ?, lastError = NULL, updatedAt = ?
         WHERE txnId = ?`,
        account.data === null ? "shadow-new-account" : "shadow-account",
        new Date().toISOString(),
        txnId,
      );
      return;
    }

    const account = await findOrCreateAccount(this.options, {
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
    });
    if (!account.ok) throw new Error(`Neon account lookup failed`);

    const amount = payload.amount / 100;
    const date = formatDateInTimezone(
      new Date(payload.donatedAt),
      this.options.localTimezone,
    );
    const created = await createDonation(this.options, {
      accountId: account.data.id,
      amount,
      date,
      donationCustomFields: [{ id: this.transactionIdFieldId, value: txnId }],
      payments: [
        {
          amount,
          tenderType: PAYPAL_TENDER_TYPE,
          paymentStatus: "Succeeded",
          receivedDate: date,
          note: `PayPal transaction ID: ${txnId}`,
        },
      ],
    });
    if (!created.ok) throw new Error(`Neon donation creation failed`);

    this.finishInNeon(txnId, "created", created.data.id);
  }

  /** Also reports a refund that arrived before or during the export. */
  private finishInNeon(
    txnId: string,
    state: "exists" | "created",
    neonDonationId: string,
  ) {
    this.finish(txnId, state, neonDonationId);
    const refundedCents = this.refundedCents(txnId);
    if (refundedCents > 0) {
      this.reportRefund(txnId, { refundedCents, neonDonationId });
    }
  }

  private finish(txnId: string, state: ExportState, neonDonationId?: string) {
    // Drop the donor details once they're no longer needed
    this.sql.exec(
      `UPDATE paypalNeonExports
       SET state = ?, neonDonationId = ?, payload = NULL, lastError = NULL,
         updatedAt = ?
       WHERE txnId = ?`,
      state,
      neonDonationId ?? null,
      new Date().toISOString(),
      txnId,
    );
  }

  private reportRefund(txnId: string, context: Record<string, unknown>) {
    console.warn("PayPal donation in Neon was refunded or reversed", {
      txnId,
      ...context,
    });
    reportExportIssue("refund-needs-manual-update", { txnId, ...context });
  }
}
