import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as Sentry from "@sentry/cloudflare";
import type * as NeonApi from "@alveusgg/neon-crm-api";
import {
  createDonation,
  findAccountIdByEmail,
  findDonationIdsByCustomField,
  findOrCreateAccount,
} from "@alveusgg/neon-crm-api";
import {
  cleanUpPaypalNeonExports,
  createIfNotExistsPaypalNeonExportsTable,
  parsePaypalNeonExportMode,
  PaypalNeonExport,
} from "../src/providers/paypal/neon-export";
import { createSqlStorage } from "./fixtures/sql-storage";

vi.mock("@alveusgg/neon-crm-api", async (importOriginal) => ({
  ...(await importOriginal<typeof NeonApi>()),
  createDonation: vi.fn(),
  findAccountIdByEmail: vi.fn(),
  findDonationIdsByCustomField: vi.fn(),
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

const refundReport = () =>
  vi
    .mocked(Sentry.captureMessage)
    .mock.calls.filter(
      ([message]) =>
        message === "PayPal Neon export: refund-needs-manual-update",
    );

async function setup(mode: "shadow" | "on") {
  const sql = createSqlStorage();
  await createIfNotExistsPaypalNeonExportsTable(sql);
  const make = (mode: "shadow" | "on") =>
    PaypalNeonExport.fromEnv(sql, { ...env, PAYPAL_NEON_EXPORT: mode })!;
  const rows = () =>
    sql.exec(`SELECT * FROM paypalNeonExports ORDER BY createdAt`).toArray();
  return { sql, exporter: make(mode), make, rows };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.mocked(findDonationIdsByCustomField).mockResolvedValue({
    ok: true,
    data: [],
  });
  vi.mocked(findAccountIdByEmail).mockResolvedValue({ ok: true, data: null });
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

describe("PayPal Neon export mode", () => {
  it("never writes from a sandbox worker", () => {
    expect(
      parsePaypalNeonExportMode({
        ...env,
        SANDBOX: "true",
        PAYPAL_NEON_EXPORT: "on",
      }),
    ).toBe("shadow");
  });

  it("is off unless configured", () => {
    expect(PaypalNeonExport.fromEnv(createSqlStorage(), env)).toBeUndefined();
  });
});

describe("exporting PayPal donations to Neon", () => {
  it("creates the donation with its transaction ID and drops the donor details", async () => {
    const { exporter, rows } = await setup("on");

    exporter.enqueue(donation);
    // A repeated IPN for the same transaction is ignored
    exporter.enqueue({ ...donation, amount: 9900 });

    await expect(exporter.run()).resolves.toEqual({
      processed: 1,
      remaining: 0,
    });
    expect(findDonationIdsByCustomField).toHaveBeenCalledWith(
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
    expect(rows()).toEqual([
      expect.objectContaining({
        txnId: donation.txnId,
        state: "created",
        neonDonationId: "456",
        payload: null,
      }),
    ]);
  });

  it("creates a donation once when runs overlap", async () => {
    const { exporter, make } = await setup("on");
    exporter.enqueue(donation);

    // The alarm and the hourly cron reach the same Durable Object
    await Promise.all([exporter.run(), exporter.run()]);
    // A later run over the same storage sees it as done
    await make("on").run();

    expect(createDonation).toHaveBeenCalledOnce();
  });

  it("doesn't create a donation that Neon already has", async () => {
    vi.mocked(findDonationIdsByCustomField).mockResolvedValue({
      ok: true,
      data: ["789"],
    });
    const { exporter, rows } = await setup("on");

    exporter.enqueue(donation);
    await exporter.run();

    expect(findOrCreateAccount).not.toHaveBeenCalled();
    expect(createDonation).not.toHaveBeenCalled();
    expect(rows()).toEqual([
      expect.objectContaining({ state: "exists", neonDonationId: "789" }),
    ]);
  });

  it("keeps failed exports for the next run and stops during an outage", async () => {
    vi.mocked(findDonationIdsByCustomField).mockResolvedValue({
      ok: false,
      errorType: "request",
      error: new Error("Neon is down"),
    } as never);
    const { exporter, rows } = await setup("on");

    exporter.enqueue(donation);
    for (const txnId of ["1AB12345CD678901E", "2AB12345CD678901E", "3AB"]) {
      exporter.enqueue({ ...donation, txnId });
    }

    // Retrying never gives up on a donation, only expiry does
    for (let run = 0; run < 30; run++) {
      await expect(exporter.run()).resolves.toEqual({
        processed: 0,
        remaining: 4,
      });
    }
    expect(findDonationIdsByCustomField).toHaveBeenCalledTimes(90);
    expect(rows()[0]).toMatchObject({
      state: "pending",
      attempts: 30,
      lastError: "Neon donation search failed",
    });
    // Reported once each, after about a day of hourly runs
    expect(Sentry.captureException).toHaveBeenCalledTimes(3);
  });

  it("moves on when one donation can't be exported", async () => {
    vi.mocked(findDonationIdsByCustomField)
      .mockResolvedValueOnce({
        ok: false,
        errorType: "request",
        error: new Error("Invalid email"),
      } as never)
      .mockResolvedValue({ ok: true, data: ["789"] });
    const { exporter, rows } = await setup("on");

    exporter.enqueue(donation);
    exporter.enqueue({ ...donation, txnId: "1AB12345CD678901E" });

    await expect(exporter.run()).resolves.toEqual({
      processed: 1,
      remaining: 1,
    });
    expect(rows().map((row) => row.state)).toEqual(["pending", "exists"]);
  });
});

describe("shadow mode", () => {
  it("only looks up the account, and exports the donation once switched on", async () => {
    const { exporter, make, rows } = await setup("shadow");

    exporter.enqueue(donation);
    await exporter.run();

    expect(findOrCreateAccount).not.toHaveBeenCalled();
    expect(createDonation).not.toHaveBeenCalled();
    expect(rows()).toEqual([
      expect.objectContaining({ state: "shadow-new-account" }),
    ]);
    expect(exporter.summary()).toEqual({
      mode: "shadow",
      counts: { "shadow-new-account": 1 },
    });
    // Shadow mode doesn't look the same donation up again
    await exporter.run();
    expect(findAccountIdByEmail).toHaveBeenCalledOnce();

    await make("on").run();
    expect(createDonation).toHaveBeenCalledOnce();
    expect(rows()).toEqual([
      expect.objectContaining({ state: "created", payload: null }),
    ]);
  });
});

describe("refunds", () => {
  it("doesn't export a donation that was fully refunded first", async () => {
    const { exporter, rows } = await setup("on");

    exporter.enqueue(donation);
    exporter.recordRefund(donation.txnId, "Refunded", 2500);
    await exporter.run();

    expect(createDonation).not.toHaveBeenCalled();
    expect(rows()).toEqual([
      expect.objectContaining({ state: "refunded", payload: null }),
    ]);
  });

  it("remembers a refund that arrives before the completed IPN", async () => {
    const { exporter, rows } = await setup("on");

    exporter.recordRefund(donation.txnId, "Refunded", 2500);
    // Nothing to export without the donation itself
    await exporter.run();
    exporter.enqueue(donation);
    await exporter.run();

    expect(createDonation).not.toHaveBeenCalled();
    expect(rows()).toEqual([expect.objectContaining({ state: "refunded" })]);
  });

  it("exports a partly refunded donation and tells staff", async () => {
    const { exporter } = await setup("on");

    exporter.enqueue(donation);
    exporter.recordRefund(donation.txnId, "Refunded", 1000);
    await exporter.run();

    expect(createDonation).toHaveBeenCalledOnce();
    expect(refundReport()).toHaveLength(1);
  });

  it("tells staff about a refund that arrives during the export", async () => {
    const { exporter } = await setup("on");
    vi.mocked(createDonation).mockImplementation(async () => {
      exporter.recordRefund(donation.txnId, "Reversed", 2500);
      return { ok: true, data: { id: "456" } };
    });

    exporter.enqueue(donation);
    await exporter.run();

    expect(refundReport()).toHaveLength(1);
  });

  it("tells staff about refunds of donations that are in Neon", async () => {
    vi.mocked(findDonationIdsByCustomField)
      .mockResolvedValueOnce({ ok: true, data: [] })
      .mockResolvedValueOnce({ ok: true, data: ["789"] });
    const { exporter } = await setup("on");
    exporter.enqueue(donation);
    // Already in Neon, e.g. from a create whose response was lost
    exporter.enqueue({ ...donation, txnId: "1AB12345CD678901E" });
    await exporter.run();

    exporter.recordRefund(donation.txnId, "Refunded", 2500);
    exporter.recordRefund("1AB12345CD678901E", "Partially_Refunded", 500);

    expect(refundReport()).toHaveLength(2);
  });
});

describe("cleaning up the export queue", () => {
  it("drops donor details that waited too long, even while the export is off", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-01T00:00:00Z"));
    const { sql, exporter, rows } = await setup("shadow");
    exporter.enqueue(donation);
    exporter.enqueue({ ...donation, txnId: "1AB12345CD678901E" });
    // The first becomes a shadow lookup, the second stays pending
    vi.mocked(findDonationIdsByCustomField)
      .mockResolvedValueOnce({ ok: true, data: [] })
      .mockRejectedValue(new Error("down"));
    await exporter.run();
    vi.mocked(Sentry.captureMessage).mockClear();

    cleanUpPaypalNeonExports(sql, new Date("2026-11-15T00:00:00Z"));

    expect(rows()).toEqual([
      expect.objectContaining({ state: "expired", payload: null }),
      expect.objectContaining({ state: "expired", payload: null }),
    ]);
    // Only the export that never happened is reported
    expect(Sentry.captureMessage).toHaveBeenCalledOnce();
    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      "PayPal Neon export: export-expired",
      "warning",
    );
  });

  it("keeps exported donations past the dispute window for refund reports", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const { sql, exporter } = await setup("on");
    exporter.enqueue(donation);
    await exporter.run();

    cleanUpPaypalNeonExports(sql, new Date("2026-07-01T00:00:00Z"));
    exporter.recordRefund(donation.txnId, "Reversed", 2500);

    expect(refundReport()).toHaveLength(1);
  });
});
