import { beforeEach, describe, expect, it, vi } from "vitest";
import * as Sentry from "@sentry/cloudflare";
import type * as NeonApi from "@alveusgg/neon-crm-api";
import {
  createDonation,
  findAccountIdByEmail,
  findDonationIdsByCustomField,
  findOrCreateAccount,
} from "@alveusgg/neon-crm-api";
import {
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

async function setup(mode: "shadow" | "on") {
  const sql = createSqlStorage();
  await createIfNotExistsPaypalNeonExportsTable(sql);
  const exporter = PaypalNeonExport.fromEnv(sql, {
    ...env,
    PAYPAL_NEON_EXPORT: mode,
  })!;
  const rows = () => sql.exec(`SELECT * FROM paypalNeonExports`).toArray();
  return { exporter, rows };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.mocked(findDonationIdsByCustomField).mockResolvedValue({
    ok: true,
    data: [],
  });
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
    vi.mocked(findOrCreateAccount).mockResolvedValue({
      ok: true,
      data: { id: "123", created: false },
    });
    vi.mocked(createDonation).mockResolvedValue({
      ok: true,
      data: { id: "456" },
    });
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

  it("only looks up the account in shadow mode", async () => {
    vi.mocked(findAccountIdByEmail).mockResolvedValue({
      ok: true,
      data: null,
    });
    const { exporter, rows } = await setup("shadow");

    exporter.enqueue(donation);
    await exporter.run();

    expect(findOrCreateAccount).not.toHaveBeenCalled();
    expect(createDonation).not.toHaveBeenCalled();
    expect(rows()).toEqual([
      expect.objectContaining({ state: "shadow-new-account", payload: null }),
    ]);
    expect(exporter.summary()).toEqual({
      mode: "shadow",
      counts: { "shadow-new-account": 1 },
    });
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

    await expect(exporter.run()).resolves.toEqual({
      processed: 0,
      remaining: 4,
    });
    expect(findDonationIdsByCustomField).toHaveBeenCalledTimes(3);
    expect(rows()[0]).toMatchObject({
      state: "pending",
      attempts: 1,
      lastError: "Neon donation search failed",
    });
    expect(JSON.parse(String(rows()[0]!.payload))).toMatchObject({
      email: "ada@example.com",
    });
  });

  it("tells staff when an exported donation is refunded", async () => {
    vi.mocked(findOrCreateAccount).mockResolvedValue({
      ok: true,
      data: { id: "123", created: true },
    });
    vi.mocked(createDonation).mockResolvedValue({
      ok: true,
      data: { id: "456" },
    });
    const { exporter } = await setup("on");
    exporter.enqueue(donation);
    await exporter.run();

    exporter.flagRefund("0AB12345CD678901E", "Refunded");
    expect(Sentry.captureMessage).not.toHaveBeenCalled();

    exporter.flagRefund(donation.txnId, "Refunded");
    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      "PayPal Neon export: refund-needs-manual-update",
      "warning",
    );
  });
});
