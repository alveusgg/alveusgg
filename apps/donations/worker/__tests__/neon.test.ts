import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type * as NeonApi from "@alveusgg/neon-crm-api";
import {
  DonationResponse,
  getAccount,
  getDonation,
  searchDonations,
} from "@alveusgg/neon-crm-api";
import { NeonDonationProvider } from "../src/providers/neon/neon";
import type { DonationStorage } from "../src/providers/storage";

vi.mock("@alveusgg/neon-crm-api", async (importOriginal) => ({
  ...(await importOriginal<typeof NeonApi>()),
  getAccount: vi.fn(),
  getDonation: vi.fn(),
  searchDonations: vi.fn(),
}));
vi.mock("@sentry/cloudflare", () => ({
  captureException: vi.fn(),
  withScope: (
    callback: (scope: { setTag: () => void; setContext: () => void }) => void,
  ) => callback({ setTag: vi.fn(), setContext: vi.fn() }),
}));

const rawDonation = {
  id: "1",
  accountId: "10",
  amount: 123.45,
  campaign: null,
  fund: null,
  timestamps: {
    createdBy: "API",
    createdDateTime: "2026-01-01T12:00:00Z",
    lastModifiedBy: null,
    lastModifiedDateTime: "2026-01-01T12:00:00Z",
  },
  date: "2026-01-01",
  anonymousType: "DonationAmountAnonymous",
  donorCoveredFeeFlag: false,
  status: "Succeeded",
};
const env = {
  NEON_CRM_BASE_URL: "https://api.example.com/",
  NEON_CRM_ORG_ID: "example",
  NEON_CRM_API_KEY: "example",
  NEON_CRM_LOCAL_TIMEZONE: "America/Chicago",
  NEON_CRM_WEBHOOK_USERNAME: "donations",
  NEON_CRM_WEBHOOK_PASSWORD: "example",
} as Env;
const service = {
  add: vi.fn(async () => 1),
  config: { get: vi.fn(), set: vi.fn() },
} satisfies DonationStorage;

beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-01-02T00:00:00Z"));
  vi.spyOn(console, "info").mockImplementation(() => {});
  service.add.mockResolvedValue(1);
  vi.mocked(getAccount).mockResolvedValue({
    ok: true,
    data: { individualAccount: null, companyAccount: null },
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("Neon amount privacy", () => {
  it("skips an amount-anonymous donation, imports the next donation, and advances sync", async () => {
    vi.mocked(searchDonations).mockResolvedValue({
      ok: true,
      data: {
        pagination: {
          currentPage: 0,
          pageSize: 50,
          totalPages: 1,
          totalResults: 2,
        },
        searchResults: [{ "Donation ID": "1" }, { "Donation ID": "2" }],
      },
    });
    vi.mocked(getDonation).mockImplementation(async (_options, id) => ({
      ok: true,
      data: DonationResponse.parse({
        ...rawDonation,
        id,
        anonymousType: id === "1" ? "DonationAmountAnonymous" : "No",
      }),
    }));
    const provider = await NeonDonationProvider.init(service, env);

    await expect(provider.syncRecentDonations()).resolves.toEqual({
      found: 2,
      imported: 1,
      skipped: 1,
    });
    expect(service.add).toHaveBeenCalledTimes(1);
    expect(service.add).toHaveBeenCalledWith(
      expect.objectContaining({ providerUniqueId: "example-2" }),
    );
    expect(getAccount).toHaveBeenCalledTimes(1);
    expect(service.config.set).toHaveBeenCalledWith("neon-sync", {
      lastSyncedAt: "2026-01-02T00:00:00.000Z",
    });
    // Logging must not disclose the private amount or donor information.
    expect(console.info).toHaveBeenCalledWith(
      "Skipping amount-anonymous Neon donation",
      { id: "1" },
    );
  });

  it.each([true, false])(
    "acknowledges a private-amount webhook only after authentication (authenticated=%s)",
    async (authenticated) => {
      const provider = await NeonDonationProvider.init(service, env);
      const response = await provider.handle(
        new Request("https://example.com/neon/live", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authenticated
              ? { Authorization: `Basic ${btoa("donations:example")}` }
              : {}),
          },
          body: JSON.stringify({
            eventTrigger: "createDonation",
            eventTimestamp: "2026-01-01T12:00:00Z",
            organizationId: "example",
            data: rawDonation,
          }),
        }),
      );

      expect(response.status).toBe(authenticated ? 200 : 401);
      expect(service.add).not.toHaveBeenCalled();
      expect(getAccount).not.toHaveBeenCalled();
      expect(service.config.set).not.toHaveBeenCalled();
    },
  );
});
