import {
  PAYPAL_TENDER_TYPE,
  createDonation,
  findDonationIdByCustomField,
  findOrCreateAccount,
  formatDateInTimezone,
} from "@alveusgg/neon-crm-api";
import { type Options, envToOptions } from "@alveusgg/neon-crm-api/env";
import * as Sentry from "@sentry/cloudflare";

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
const RETENTION_DAYS = 30;

/** Donations waiting to be exported. Rows are deleted once they're in Neon. */
export async function createIfNotExistsPaypalNeonExportsTable(sql: SqlStorage) {
  sql.exec(`
    CREATE TABLE IF NOT EXISTS paypalNeonExports (
      txnId TEXT PRIMARY KEY,
      payload TEXT NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL
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

/** Whether PayPal donations should be sent to Neon CRM. */
export function isPaypalNeonExportEnabled(env: Env) {
  const mode = env.PAYPAL_NEON_EXPORT || "off";
  if (mode !== "off" && mode !== "on") {
    throw new Error(`Invalid PAYPAL_NEON_EXPORT: ${mode}`);
  }
  // Sandbox workers (preview) use the production Neon org, so sandbox
  // payments must never become Neon donations
  if (mode === "on" && env.SANDBOX === "true") {
    console.warn("PAYPAL_NEON_EXPORT=on is ignored in sandbox");
    return false;
  }
  return mode === "on";
}

/**
 * Drops donations that waited too long for an export, also while the export
 * is off, so donor details aren't kept.
 */
export function cleanUpPaypalNeonExports(sql: SqlStorage, now = new Date()) {
  const expired = sql
    .exec(
      `DELETE FROM paypalNeonExports WHERE createdAt < ? RETURNING txnId`,
      new Date(now.getTime() - RETENTION_DAYS * DAY_MS).toISOString(),
    )
    .toArray()
    .map((row) => String(row.txnId));
  if (expired.length) {
    reportExportIssue("export-expired", {
      count: expired.length,
      txnIds: expired.slice(0, 50),
    });
  }
}

export class PaypalNeonExport {
  private running?: Promise<PaypalNeonExportResult>;

  constructor(
    private sql: SqlStorage,
    private options: Options,
    private transactionIdFieldId: string,
  ) {}

  static fromEnv(sql: SqlStorage, env: Env) {
    if (!isPaypalNeonExportEnabled(env)) return undefined;
    if (!env.NEON_TRANSACTION_ID_CUSTOM_FIELD_ID) {
      throw new Error(
        "PAYPAL_NEON_EXPORT needs NEON_TRANSACTION_ID_CUSTOM_FIELD_ID",
      );
    }
    return new PaypalNeonExport(
      sql,
      envToOptions(env),
      env.NEON_TRANSACTION_ID_CUSTOM_FIELD_ID,
    );
  }

  /** Queues a completed PayPal donation. */
  enqueue({ txnId, donatedAt, ...donation }: PaypalNeonExportInput) {
    const payload: ExportPayload = {
      ...donation,
      donatedAt: donatedAt.toISOString(),
    };
    this.sql.exec(
      `INSERT OR IGNORE INTO paypalNeonExports (txnId, payload, createdAt)
       VALUES (?, ?, ?)`,
      txnId,
      JSON.stringify(payload),
      new Date().toISOString(),
    );
  }

  /**
   * Handles a refund or reversal. A queued donation that is fully refunded is
   * never exported. Any other refund is reported, since staff update the Neon
   * donation by hand.
   */
  recordRefund(parentTxnId: string, paymentStatus: string, cents: number) {
    const queued = this.sql
      .exec(
        `SELECT payload FROM paypalNeonExports WHERE txnId = ?`,
        parentTxnId,
      )
      .toArray()[0];
    const payload = queued
      ? (JSON.parse(String(queued.payload)) as ExportPayload)
      : undefined;
    if (payload && cents >= payload.amount) {
      this.sql.exec(
        `DELETE FROM paypalNeonExports WHERE txnId = ?`,
        parentTxnId,
      );
      console.info("Refunded PayPal donation won't be exported to Neon", {
        txnId: parentTxnId,
      });
      return;
    }

    this.reportRefund(parentTxnId, { paymentStatus, refundedCents: cents });
  }

  /** Exports queued donations. Overlapping calls share one run. */
  run(): Promise<PaypalNeonExportResult> {
    this.running ??= this.runOnce().finally(() => {
      this.running = undefined;
    });
    return this.running;
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
          `UPDATE paypalNeonExports SET attempts = ? WHERE txnId = ?`,
          attempts,
          row.txnId,
        );
        console.error("PayPal Neon export failed", {
          txnId: row.txnId,
          attempts,
          error,
        });
        // Retried until the donation expires, but reported once
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
    return this.sql
      .exec(
        `SELECT txnId, payload, attempts FROM paypalNeonExports
         ORDER BY createdAt LIMIT ?`,
        limit,
      )
      .toArray()
      .map((row) => ({
        txnId: String(row.txnId),
        payload: JSON.parse(String(row.payload)) as ExportPayload,
        attempts: Number(row.attempts),
      }));
  }

  private async export({ txnId, payload }: ExportRow) {
    // Staff imports and earlier attempts put the transaction ID in this field,
    // so a donation that is already in Neon is never created twice
    const existing = await findDonationIdByCustomField(
      this.options,
      this.transactionIdFieldId,
      txnId,
    );
    if (!existing.ok) throw new Error(`Neon donation search failed`);
    if (existing.data !== null) {
      this.finish(txnId, existing.data);
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

    this.finish(txnId, created.data.id);
  }

  private finish(txnId: string, neonDonationId: string) {
    const deleted = this.sql
      .exec(
        `DELETE FROM paypalNeonExports WHERE txnId = ? RETURNING txnId`,
        txnId,
      )
      .toArray();
    // A full refund during the export already removed the row, so the
    // donation that is now in Neon has to be updated by hand
    if (deleted.length === 0) {
      this.reportRefund(txnId, { neonDonationId, duringExport: true });
    }
  }

  private reportRefund(txnId: string, context: Record<string, unknown>) {
    console.warn("PayPal donation was refunded or reversed", {
      txnId,
      ...context,
    });
    reportExportIssue("refund-needs-manual-update", { txnId, ...context });
  }
}
