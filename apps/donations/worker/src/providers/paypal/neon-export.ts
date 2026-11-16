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

// pending: waiting to be exported
// exists: Neon already has a donation with this transaction ID
// shadow-account / shadow-new-account: shadow mode, the donation would be
//   created on an existing / a new account
// created: exported by this worker
// failed: gave up after too many attempts
type ExportState =
  | "pending"
  | "exists"
  | "shadow-account"
  | "shadow-new-account"
  | "created"
  | "failed";

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

export type PaypalNeonExportResult = {
  processed: number;
  remaining: number;
};

const EXPORTS_PER_RUN = 20;
const MAX_ATTEMPTS = 24;
// More failures in a row than this look like an outage rather than a broken
// donation, so the rest waits for the next run
const MAX_CONSECUTIVE_FAILURES = 3;
// Rows only keep IDs once exported, so they can stay a while for dedupe
const RETENTION_DAYS = 90;

export async function createIfNotExistsPaypalNeonExportsTable(sql: SqlStorage) {
  sql.exec(`
    CREATE TABLE IF NOT EXISTS paypalNeonExports (
      txnId TEXT PRIMARY KEY,
      payload TEXT,
      state TEXT NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      lastError TEXT,
      neonDonationId TEXT,
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

export class PaypalNeonExport {
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
    this.sql.exec(
      `INSERT INTO paypalNeonExports (txnId, payload, state, createdAt, updatedAt)
       VALUES (?, ?, 'pending', ?, ?)
       ON CONFLICT(txnId) DO NOTHING`,
      txnId,
      JSON.stringify(payload),
      now,
      now,
    );
  }

  /**
   * Tells staff when a refunded or reversed payment was exported, since the
   * Neon donation has to be updated by hand.
   */
  flagRefund(parentTxnId: string, paymentStatus: string) {
    const row = this.sql
      .exec(
        `SELECT state, neonDonationId FROM paypalNeonExports WHERE txnId = ?`,
        parentTxnId,
      )
      .toArray()[0];
    if (!row || row.state !== "created") return;

    console.warn("Exported PayPal donation was refunded or reversed", {
      neonDonationId: row.neonDonationId,
      paymentStatus,
    });
    reportExportIssue("refund-needs-manual-update", {
      neonDonationId: row.neonDonationId,
      paymentStatus,
    });
  }

  async run(): Promise<PaypalNeonExportResult> {
    this.prune();

    const rows = this.sql
      .exec(
        `SELECT txnId, payload, attempts FROM paypalNeonExports
         WHERE state = 'pending' ORDER BY createdAt LIMIT ?`,
        EXPORTS_PER_RUN,
      )
      .toArray();

    let processed = 0;
    let consecutiveFailures = 0;
    for (const row of rows) {
      const txnId = String(row.txnId);
      const attempts = Number(row.attempts) + 1;
      try {
        const payload = JSON.parse(String(row.payload)) as ExportPayload;
        const { state, neonDonationId } = await this.export(txnId, payload);
        this.finish(txnId, state, neonDonationId);
        processed++;
        consecutiveFailures = 0;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const failed = attempts >= MAX_ATTEMPTS;
        this.sql.exec(
          `UPDATE paypalNeonExports
           SET attempts = ?, lastError = ?, updatedAt = ?,
             state = ?, payload = CASE WHEN ? THEN NULL ELSE payload END
           WHERE txnId = ?`,
          attempts,
          message,
          new Date().toISOString(),
          failed ? "failed" : "pending",
          failed ? 1 : 0,
          txnId,
        );
        console.error("PayPal Neon export failed", { txnId, attempts, error });
        if (failed) {
          reportExportIssue("export-abandoned", { txnId, attempts }, error);
        }
        if (++consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) break;
      }
    }

    const remaining = Number(
      this.sql
        .exec(
          `SELECT COUNT(*) AS count FROM paypalNeonExports WHERE state = 'pending'`,
        )
        .one().count,
    );
    return { processed, remaining };
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

  private async export(
    txnId: string,
    payload: ExportPayload,
  ): Promise<{ state: ExportState; neonDonationId?: string }> {
    // Staff imports and earlier attempts put the transaction ID in this field,
    // so a donation that is already in Neon is never created twice
    const existing = await findDonationIdsByCustomField(
      this.options,
      this.transactionIdFieldId,
      txnId,
    );
    if (!existing.ok) throw new Error(`Neon donation search failed`);
    if (existing.data.length > 0) {
      return { state: "exists", neonDonationId: existing.data[0] };
    }

    if (this.mode === "shadow") {
      const account = await findAccountIdByEmail(this.options, payload.email);
      if (!account.ok) throw new Error(`Neon account search failed`);
      return {
        state: account.data === null ? "shadow-new-account" : "shadow-account",
      };
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

    return { state: "created", neonDonationId: created.data.id };
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

  private prune() {
    const cutoff = new Date(
      Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString();
    this.sql.exec(
      `DELETE FROM paypalNeonExports WHERE state <> 'pending' AND updatedAt < ?`,
      cutoff,
    );
  }
}
