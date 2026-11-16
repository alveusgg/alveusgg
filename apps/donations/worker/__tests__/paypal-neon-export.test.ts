import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as Sentry from "@sentry/cloudflare";
import type * as NeonApi from "@alveusgg/neon-crm-api";
import {
  createDonation,
  findDonationIdByCustomField,
  findOrCreateAccount,
} from "@alveusgg/neon-crm-api";
import {
  cleanUpPaypalNeonExports,
  createIfNotExistsPaypalNeonExportsTable,
  isPaypalNeonExportEnabled,
  PaypalNeonExport,
} from "../src/providers/paypal/neon-export";
import { createSqlStorage } from "./fixtures/sql-storage";

vi.mock("@alveusgg/neon-crm-api", async (importOriginal) => ({
  ...(await importOriginal<typeof NeonApi>()),
  createDonation: vi.fn(),
  findDonationIdByCustomField: vi.fn(),
  findOrCreateAccount: vi.fn(),
}));

vi.mock("@sentry/cloudflare", () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  withScope: (
    callback: (scope: { setTag: () => void; setContext: () => void }) => void,
  ) => callback({ setTag: vi.fn(), setContext: vi.fn() }),
}));

const env = {
  SANDBOX: "false",
  PAYPAL_NEON_EXPORT: "on",
  NEON_CRM_BASE_URL: "https://api.example.com/",
  NEON_CRM_ORG_ID: "example",
  NEON_CRM_API_KEY: "example",
  NEON_CRM_LOCAL_TIMEZONE: "America/Chicago",
  NEON_TRANSACTION_ID_CUSTOM_FIELD_ID: "92",
} as Env;

const donation = {
  txnId: "9AB12345CD678901E",
  amount: 2500,
  // Late evening in Chicago, already the next day in UTC
  donatedAt: new Date("2026-10-17T03:30:00Z"),
  email: "ada@example.com",
  firstName: "Ada",
  lastName: "Lovelace",
};
const otherTxnId = "1AB12345CD678901E";

const refundReports = () =>
  vi
    .mocked(Sentry.captureMessage)
    .mock.calls.filter(
      ([message]) =>
        message === "PayPal Neon export: refund-needs-manual-update",
    );

async function setup() {
  const sql = createSqlStorage();
  await createIfNotExistsPaypalNeonExportsTable(sql);
  const make = () => PaypalNeonExport.fromEnv(sql, env)!;
  const rows = () =>
    sql.exec(`SELECT * FROM paypalNeonExports ORDER BY createdAt`).toArray();
  return { sql, exporter: make(), make, rows };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "info").mockImplementation(() => {});
  vi.mocked(findDonationIdByCustomField).mockResolvedValue({
    ok: true,
    data: null,
  });
  vi.mocked(findOrCreateAccount).mockResolvedValue({
    ok: true,
    data: { id: "123", created: false },
  });
  vi.mocked(createDonation).mockResolvedValue({
    ok: true,
    data: { id: "456" },
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("exporting PayPal donations to Neon", () => {
  it("never writes from a sandbox worker", () => {
    expect(isPaypalNeonExportEnabled({ ...env, SANDBOX: "true" })).toBe(false);
  });

  it("creates the donation with its transaction ID and drops the donor details", async () => {
    const { exporter, rows } = await setup();

    exporter.enqueue(donation);
    // A repeated IPN for the same transaction is ignored
    exporter.enqueue({ ...donation, amount: 9900 });

    await expect(exporter.run()).resolves.toEqual({
      processed: 1,
      remaining: 0,
    });
    expect(findDonationIdByCustomField).toHaveBeenCalledWith(
      expect.anything(),
      "92",
      donation.txnId,
    );
    expect(findOrCreateAccount).toHaveBeenCalledWith(expect.anything(), {
      email: "ada@example.com",
      firstName: "Ada",
      lastName: "Lovelace",
    });
    expect(createDonation).toHaveBeenCalledWith(expect.anything(), {
      accountId: "123",
      amount: 25,
      date: "2026-10-16",
      donationCustomFields: [{ id: "92", value: donation.txnId }],
      payments: [
        {
          amount: 25,
          tenderType: 17,
          paymentStatus: "Succeeded",
          receivedDate: "2026-10-16",
          note: `PayPal transaction ID: ${donation.txnId}`,
        },
      ],
    });
    expect(rows()).toEqual([]);
  });

  it("creates a donation once when runs overlap", async () => {
    const { exporter, make } = await setup();
    exporter.enqueue(donation);

    // The alarm and the hourly cron reach the same Durable Object
    await Promise.all([exporter.run(), exporter.run()]);
    await make().run();

    expect(createDonation).toHaveBeenCalledOnce();
  });

  it("doesn't create a donation that Neon already has", async () => {
    vi.mocked(findDonationIdByCustomField).mockResolvedValue({
      ok: true,
      data: "789",
    });
    const { exporter, rows } = await setup();

    exporter.enqueue(donation);
    await exporter.run();

    expect(findOrCreateAccount).not.toHaveBeenCalled();
    expect(createDonation).not.toHaveBeenCalled();
    expect(rows()).toEqual([]);
  });

  it("keeps failed exports for the next run and stops during an outage", async () => {
    vi.mocked(findDonationIdByCustomField).mockResolvedValue({
      ok: false,
      errorType: "request",
      error: new Error("Neon is down"),
    } as never);
    const { exporter, rows } = await setup();

    exporter.enqueue(donation);
    for (const txnId of [otherTxnId, "2AB12345CD678901E", "3AB"]) {
      exporter.enqueue({ ...donation, txnId });
    }

    await expect(exporter.run()).resolves.toEqual({
      processed: 0,
      remaining: 4,
    });
    expect(findDonationIdByCustomField).toHaveBeenCalledTimes(3);
    expect(rows().map((row) => row.attempts)).toEqual([1, 1, 1, 0]);
  });

  it("moves on when one donation can't be exported", async () => {
    vi.mocked(findDonationIdByCustomField)
      .mockResolvedValueOnce({
        ok: false,
        errorType: "request",
        error: new Error("Invalid email"),
      } as never)
      .mockResolvedValue({ ok: true, data: "789" });
    const { exporter, rows } = await setup();

    exporter.enqueue(donation);
    exporter.enqueue({ ...donation, txnId: otherTxnId });

    await expect(exporter.run()).resolves.toEqual({
      processed: 1,
      remaining: 1,
    });
    expect(rows()).toEqual([
      expect.objectContaining({ txnId: donation.txnId }),
    ]);
  });

  it("drops donations that waited too long, even while the export is off", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-01T00:00:00Z"));
    const { sql, exporter, rows } = await setup();
    exporter.enqueue(donation);

    cleanUpPaypalNeonExports(sql, new Date("2026-11-15T00:00:00Z"));

    expect(rows()).toEqual([]);
    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      "PayPal Neon export: export-expired",
      "warning",
    );
  });
});

describe("refunds", () => {
  it("doesn't export a donation that was fully refunded first", async () => {
    const { exporter } = await setup();

    exporter.enqueue(donation);
    exporter.recordRefund(donation.txnId, "Refunded", 2500);
    await exporter.run();

    expect(createDonation).not.toHaveBeenCalled();
    expect(refundReports()).toHaveLength(0);
  });

  it("tells staff about partial refunds and refunds of exported donations", async () => {
    const { exporter } = await setup();

    exporter.enqueue(donation);
    exporter.recordRefund(donation.txnId, "Partially_Refunded", 1000);
    await exporter.run();
    exporter.recordRefund(donation.txnId, "Refunded", 1500);

    expect(createDonation).toHaveBeenCalledOnce();
    expect(refundReports()).toHaveLength(2);
  });

  it("tells staff about a full refund that arrives during the export", async () => {
    const { exporter } = await setup();
    vi.mocked(createDonation).mockImplementation(async () => {
      exporter.recordRefund(donation.txnId, "Reversed", 2500);
      return { ok: true, data: { id: "456" } };
    });

    exporter.enqueue(donation);
    await exporter.run();

    expect(refundReports()).toHaveLength(1);
  });
});
