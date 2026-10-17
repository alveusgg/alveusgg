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
      complete: true,
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

describe("bounded Neon catch-up", () => {
  function page(ids: string[], totalPages = 1) {
    return {
      ok: true as const,
      data: {
        pagination: {
          currentPage: 0,
          pageSize: 50,
          totalPages,
          totalResults: ids.length,
        },
        searchResults: ids.map((id): Record<string, string> => ({
          "Donation ID": id,
        })),
      },
    };
  }
  function checkpointStore(
    initial: unknown = { lastSyncedAt: "2025-01-01T00:00:00.000Z" },
  ) {
    let state = initial;
    service.config.get.mockImplementation(() => structuredClone(state));
    service.config.set.mockImplementation((_key, value) => {
      state = structuredClone(value);
    });
    return () => state;
  }
  function normalDonation(id: string, originCategory = "API") {
    return DonationResponse.parse({
      ...rawDonation,
      id,
      anonymousType: "No",
      origin: { originCategory },
    });
  }

  it("checkpoints a capped batch and resumes a frozen window after a provider restart", async () => {
    const state = checkpointStore();
    vi.mocked(searchDonations).mockImplementation(async () =>
      page([String(vi.mocked(searchDonations).mock.calls.length)], 20),
    );
    vi.mocked(getDonation).mockImplementation(async (_options, id) => ({
      ok: true,
      data: normalDonation(id),
    }));
    const provider = await NeonDonationProvider.init(service, env);
    await expect(provider.syncRecentDonations()).resolves.toEqual({
      complete: false,
      found: 10,
      imported: 10,
      skipped: 0,
    });
    expect(searchDonations).toHaveBeenCalledTimes(10);
    expect(state()).toEqual({
      lastSyncedAt: "2025-01-01T00:00:00.000Z",
      catchUp: {
        startedAt: "2026-01-02T00:00:00.000Z",
        sinceDate: "2024-12-29",
        untilDate: "2026-01-02",
        lastDonationId: "10",
      },
    });
    expect(vi.mocked(searchDonations).mock.calls[1]?.[1]).toMatchObject({
      searchFields: expect.arrayContaining([
        { field: "Donation ID", operator: "GREATER_THAN", value: "1" },
        {
          field: "Origin Category",
          operator: "NOT_EQUAL",
          value: "Self-Import",
        },
      ]),
      pagination: {
        currentPage: 0,
        sortColumn: "Donation ID",
        sortDirection: "ASC",
      },
    });
    vi.setSystemTime(new Date("2026-01-05T00:00:00Z"));
    vi.mocked(searchDonations).mockResolvedValue(page(["11"]));
    const restarted = await NeonDonationProvider.init(service, env);
    await expect(restarted.syncRecentDonations()).resolves.toMatchObject({
      complete: true,
      imported: 1,
    });
    expect(searchDonations).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({
        searchFields: expect.arrayContaining([
          { field: "Donation ID", operator: "GREATER_THAN", value: "10" },
          {
            field: "Donation Created Date",
            operator: "GREATER_AND_EQUAL",
            value: "2024-12-29",
          },
          {
            field: "Donation Created Date",
            operator: "LESS_THAN",
            value: "2026-01-02",
          },
        ]),
      }),
    );
    // Use the original start watermark, so arrivals while catching up remain in the next lookback.
    expect(state()).toEqual({ lastSyncedAt: "2026-01-02T00:00:00.000Z" });
  });

  it("replays a failed page instead of checkpointing partially imported records", async () => {
    const state = checkpointStore();
    vi.mocked(searchDonations)
      .mockResolvedValueOnce(page(["1"], 3))
      .mockResolvedValue(page(["2", "3"]));
    vi.mocked(getDonation).mockImplementation(async (_options, id) =>
      id === "3"
        ? { ok: false, errorType: "request", error: "temporary failure" }
        : { ok: true, data: normalDonation(id) },
    );
    const provider = await NeonDonationProvider.init(service, env);
    await expect(provider.syncRecentDonations()).rejects.toThrow(
      "Failed to fetch Neon donation",
    );
    expect(state()).toMatchObject({
      lastSyncedAt: "2025-01-01T00:00:00.000Z",
      catchUp: { lastDonationId: "1" },
    });
    vi.mocked(getDonation).mockImplementation(async (_options, id) => ({
      ok: true,
      data: normalDonation(id),
    }));
    service.add.mockResolvedValueOnce(0).mockResolvedValueOnce(1); // existing reservation skips the replayed record
    await expect(provider.syncRecentDonations()).resolves.toEqual({
      complete: true,
      found: 2,
      imported: 1,
      skipped: 1,
    });
    expect(
      vi.mocked(searchDonations).mock.lastCall?.[1].searchFields,
    ).toContainEqual({
      field: "Donation ID",
      operator: "GREATER_THAN",
      value: "1",
    });
    expect(state()).toEqual({ lastSyncedAt: "2026-01-02T00:00:00.000Z" });
  });

  it("excludes Self-Import search rows and detail records", async () => {
    checkpointStore();
    const response = page(["1", "2", "3"]);
    response.data.searchResults[0] = {
      "Donation ID": "1",
      "Origin Category": "Self-Import",
    };
    vi.mocked(searchDonations).mockResolvedValue(response);
    vi.mocked(getDonation).mockImplementation(async (_options, id) => ({
      ok: true,
      data: normalDonation(id, id === "2" ? "Self-Import" : "API"),
    }));
    const provider = await NeonDonationProvider.init(service, env);
    await expect(provider.syncRecentDonations()).resolves.toEqual({
      complete: true,
      found: 3,
      imported: 1,
      skipped: 2,
    });
    expect(getDonation).not.toHaveBeenCalledWith(expect.anything(), "1");
    expect(service.add).toHaveBeenCalledOnce();
    expect(service.add).toHaveBeenCalledWith(
      expect.objectContaining({ providerUniqueId: "example-3" }),
    );
  });

  it.each([{ ids: ["2", "1"] }, { ids: ["1", "1"] }, { ids: ["invalid"] }])(
    "refuses an unsafe cursor page: %j",
    async ({ ids }) => {
      const state = checkpointStore();
      vi.mocked(searchDonations).mockResolvedValue(page(ids));
      const provider = await NeonDonationProvider.init(service, env);
      await expect(provider.syncRecentDonations()).rejects.toThrow(
        "increasing numeric IDs",
      );
      expect(service.add).not.toHaveBeenCalled();
      expect(state()).toEqual({ lastSyncedAt: "2025-01-01T00:00:00.000Z" });
    },
  );

  it("coalesces concurrent invocations and completes an empty window", async () => {
    const state = checkpointStore();
    let resolve!: (value: ReturnType<typeof page>) => void;
    vi.mocked(searchDonations).mockImplementation(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const provider = await NeonDonationProvider.init(service, env);
    const first = provider.syncRecentDonations();
    const second = provider.syncRecentDonations();
    expect(searchDonations).toHaveBeenCalledOnce();
    resolve(page([], 0));
    await expect(first).resolves.toEqual({
      complete: true,
      found: 0,
      imported: 0,
      skipped: 0,
    });
    await expect(second).resolves.toEqual(await first);
    expect(service.config.set).toHaveBeenCalledOnce();
    expect(state()).toEqual({ lastSyncedAt: "2026-01-02T00:00:00.000Z" });
  });
});
