import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type * as NeonApi from "@alveusgg/neon-crm-api";
import {
  DonationResponse,
  getAccount,
  getDonation,
  searchDonations,
} from "@alveusgg/neon-crm-api";
import * as Sentry from "@sentry/cloudflare";
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
  captureMessage: vi.fn(),
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
  remove: vi.fn(async () => {}),
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
      retrying: 0,
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

describe("manually entered Neon donations", () => {
  function webhook(data: Record<string, unknown>) {
    return new Request("https://example.com/neon/live", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa("donations:example")}`,
      },
      body: JSON.stringify({
        eventTrigger: "createDonation",
        eventTimestamp: "2026-01-01T12:00:00Z",
        organizationId: "example",
        data: { ...rawDonation, anonymousType: "No", ...data },
      }),
    });
  }

  it.each(["Data Entry", "Custom Import", "Batch Donation", "Self-Import"])(
    "acknowledges a %s webhook without importing it",
    async (originCategory) => {
      const provider = await NeonDonationProvider.init(service, env);
      const response = await provider.handle(
        webhook({ origin: { originCategory, originDetail: "Staff" } }),
      );

      expect(response.status).toBe(200);
      expect(service.add).not.toHaveBeenCalled();
      expect(getDonation).not.toHaveBeenCalled();
    },
  );

  it("imports a donation form webhook", async () => {
    const provider = await NeonDonationProvider.init(service, env);
    const response = await provider.handle(
      webhook({
        origin: { originCategory: "Donation Form", originDetail: null },
      }),
    );

    expect(response.status).toBe(200);
    expect(service.add).toHaveBeenCalledOnce();
    expect(getDonation).not.toHaveBeenCalled();
  });

  it("looks up the origin when the webhook omits it", async () => {
    vi.mocked(getDonation).mockResolvedValue({
      ok: true,
      data: DonationResponse.parse({
        ...rawDonation,
        anonymousType: "No",
        origin: { originCategory: "Data Entry" },
      }),
    });
    const provider = await NeonDonationProvider.init(service, env);
    const response = await provider.handle(webhook({}));

    expect(response.status).toBe(200);
    expect(getDonation).toHaveBeenCalledWith(expect.anything(), "1");
    expect(service.add).not.toHaveBeenCalled();
  });

  it("asks Neon to retry when the origin lookup fails", async () => {
    vi.mocked(getDonation).mockResolvedValue({
      ok: false,
      errorType: "network",
      error: "offline",
    });
    const provider = await NeonDonationProvider.init(service, env);
    const response = await provider.handle(webhook({}));

    expect(response.status).toBe(500);
    expect(service.add).not.toHaveBeenCalled();
  });
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
      retrying: 0,
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

  it("replays a page when several donations fail in a row", async () => {
    const state = checkpointStore();
    vi.mocked(searchDonations)
      .mockResolvedValueOnce(page(["1"], 3))
      .mockResolvedValue(page(["2", "3", "4", "5"]));
    vi.mocked(getDonation).mockImplementation(async (_options, id) =>
      id === "1" || id === "2"
        ? { ok: true, data: normalDonation(id) }
        : {
            ok: false,
            errorType: "request",
            error: "temporary failure",
            status: 503,
          },
    );
    const provider = await NeonDonationProvider.init(service, env);
    await expect(provider.syncRecentDonations()).rejects.toThrow(
      "Failed to fetch Neon donation",
    );
    expect(state()).toEqual({
      lastSyncedAt: "2025-01-01T00:00:00.000Z",
      catchUp: expect.objectContaining({ lastDonationId: "1" }),
    });
    vi.mocked(getDonation).mockImplementation(async (_options, id) => ({
      ok: true,
      data: normalDonation(id),
    }));
    service.add.mockResolvedValueOnce(0); // existing reservation skips the replayed record
    await expect(provider.syncRecentDonations()).resolves.toEqual({
      complete: true,
      found: 4,
      imported: 3,
      skipped: 1,
      retrying: 0,
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

  it("defers a single failing donation so the cursor keeps advancing", async () => {
    const state = checkpointStore();
    vi.mocked(searchDonations).mockResolvedValue(page(["1", "2", "3"]));
    vi.mocked(getDonation).mockImplementation(async (_options, id) =>
      id === "2"
        ? {
            ok: false,
            errorType: "request",
            error: "temporary failure",
            status: 500,
          }
        : { ok: true, data: normalDonation(id) },
    );
    const provider = await NeonDonationProvider.init(service, env);
    await expect(provider.syncRecentDonations()).resolves.toEqual({
      complete: true,
      found: 3,
      imported: 2,
      skipped: 0,
      retrying: 1,
    });
    expect(Sentry.captureException).toHaveBeenCalledOnce();
    expect(state()).toEqual({
      lastSyncedAt: "2026-01-02T00:00:00.000Z",
      failedDonations: {
        "2": { firstFailedAt: "2026-01-02T00:00:00.000Z", attempts: 1 },
      },
    });

    // Retried by the next run, alongside newer donations.
    vi.setSystemTime(new Date("2026-01-02T01:00:00Z"));
    vi.mocked(searchDonations).mockResolvedValue(page(["4"]));
    await expect(provider.syncRecentDonations()).resolves.toMatchObject({
      imported: 1,
      retrying: 1,
    });
    expect(getDonation).toHaveBeenCalledWith(expect.anything(), "2");
    expect(state()).toMatchObject({
      failedDonations: { "2": { attempts: 2 } },
    });

    // Given up and reported once it has failed for a day.
    vi.setSystemTime(new Date("2026-01-03T00:00:00Z"));
    vi.mocked(searchDonations).mockResolvedValue(page([]));
    await expect(provider.syncRecentDonations()).resolves.toMatchObject({
      retrying: 0,
    });
    expect(Sentry.captureException).toHaveBeenCalledTimes(2);
    expect(state()).toEqual({ lastSyncedAt: "2026-01-03T00:00:00.000Z" });
  });

  it("imports a deferred donation once it succeeds", async () => {
    const state = checkpointStore({
      lastSyncedAt: "2026-01-01T00:00:00.000Z",
      failedDonations: {
        "2": { firstFailedAt: "2026-01-01T00:00:00.000Z", attempts: 1 },
      },
    });
    vi.mocked(searchDonations).mockResolvedValue(page([]));
    vi.mocked(getDonation).mockImplementation(async (_options, id) => ({
      ok: true,
      data: normalDonation(id),
    }));
    const provider = await NeonDonationProvider.init(service, env);
    await expect(provider.syncRecentDonations()).resolves.toEqual({
      complete: true,
      found: 0,
      imported: 1,
      skipped: 0,
      retrying: 0,
    });
    expect(state()).toEqual({ lastSyncedAt: "2026-01-02T00:00:00.000Z" });
  });

  it("reports a catch-up that has not finished for hours", async () => {
    checkpointStore({
      lastSyncedAt: "2025-01-01T00:00:00.000Z",
      catchUp: {
        startedAt: "2026-01-01T12:00:00.000Z",
        sinceDate: "2024-12-29",
        untilDate: "2026-01-02",
        lastDonationId: "100",
      },
    });
    vi.mocked(searchDonations).mockImplementation(async () =>
      page([String(100 + vi.mocked(searchDonations).mock.calls.length)], 20),
    );
    vi.mocked(getDonation).mockImplementation(async (_options, id) => ({
      ok: true,
      data: normalDonation(id),
    }));
    const provider = await NeonDonationProvider.init(service, env);
    await expect(provider.syncRecentDonations()).resolves.toMatchObject({
      complete: false,
    });
    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      "Neon donation sync: catch-up-delayed",
      "warning",
    );
  });

  it("skips manually entered donations by their own origin, not the search row", async () => {
    checkpointStore();
    const response = page(["1", "2", "3", "4", "5", "6"]);
    // Search reports a misleading category; the donation record is the source of truth.
    response.data.searchResults[5] = {
      "Donation ID": "6",
      "Origin Category": "Custom Import",
    };
    vi.mocked(searchDonations).mockResolvedValue(response);
    const origins: Record<string, string> = {
      "1": "Self-Import",
      "2": "Data Entry",
      "3": "Custom Import",
      "4": "Batch Donation",
      "5": "API",
      "6": "Donation Form",
    };
    vi.mocked(getDonation).mockImplementation(async (_options, id) => ({
      ok: true,
      data: normalDonation(id, origins[id]),
    }));
    const provider = await NeonDonationProvider.init(service, env);
    await expect(provider.syncRecentDonations()).resolves.toEqual({
      complete: true,
      found: 6,
      imported: 2,
      skipped: 4,
      retrying: 0,
    });
    expect(
      vi.mocked(searchDonations).mock.lastCall?.[1].searchFields,
    ).not.toContainEqual(expect.objectContaining({ field: "Origin Category" }));
    expect(getAccount).toHaveBeenCalledTimes(2);
    expect(service.add).toHaveBeenCalledWith(
      expect.objectContaining({ providerUniqueId: "example-5" }),
    );
    expect(service.add).toHaveBeenCalledWith(
      expect.objectContaining({ providerUniqueId: "example-6" }),
    );
  });

  it("skips deleted donations without deferring them", async () => {
    const state = checkpointStore({
      lastSyncedAt: "2026-01-01T00:00:00.000Z",
      failedDonations: {
        "9": { firstFailedAt: "2026-01-01T00:00:00.000Z", attempts: 1 },
      },
    });
    vi.mocked(searchDonations).mockResolvedValue(page(["1", "2", "3", "4"]));
    vi.mocked(getDonation).mockImplementation(async (_options, id) =>
      id === "4"
        ? { ok: true, data: normalDonation(id) }
        : {
            ok: false,
            errorType: "request",
            error: "Request failed with status 404",
            status: 404,
          },
    );
    const provider = await NeonDonationProvider.init(service, env);
    // Three deleted donations in a row must not look like an outage.
    await expect(provider.syncRecentDonations()).resolves.toEqual({
      complete: true,
      found: 4,
      imported: 1,
      skipped: 4,
      retrying: 0,
    });
    expect(state()).toEqual({ lastSyncedAt: "2026-01-02T00:00:00.000Z" });
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
      retrying: 0,
    });
    await expect(second).resolves.toEqual(await first);
    expect(service.config.set).toHaveBeenCalledOnce();
    expect(state()).toEqual({ lastSyncedAt: "2026-01-02T00:00:00.000Z" });
  });
});

describe("removing failed payments", () => {
  function configStore(initial: Record<string, unknown> = {}) {
    const state: Record<string, unknown> = structuredClone(initial);
    service.config.get.mockImplementation((key: string) =>
      structuredClone(state[key]),
    );
    service.config.set.mockImplementation((key: string, value: unknown) => {
      state[key] = structuredClone(value);
    });
    return state;
  }
  function search(ids: string[], totalPages = 1) {
    return {
      ok: true as const,
      data: {
        pagination: {
          currentPage: 0,
          pageSize: 200,
          totalPages,
          totalResults: ids.length,
        },
        searchResults: ids.map((id) => ({ "Donation ID": id })),
      },
    };
  }
  function failedSearch(byStatus: Record<string, string[][]>) {
    vi.mocked(searchDonations).mockImplementation(async (_options, query) => {
      const pages = byStatus[String(query.searchFields[0]?.value)] ?? [[]];
      const page = query.pagination?.currentPage ?? 0;
      return search(pages[page] ?? [], pages.length);
    });
  }

  it("removes failed, canceled and refunded donations from every page in one call", async () => {
    configStore();
    failedSearch({ Failed: [["7"], ["8"]], Refunded: [["9"]] });
    const provider = await NeonDonationProvider.init(service, env);
    await provider.removeFailedDonations();

    expect(searchDonations).toHaveBeenCalledTimes(4);
    expect(vi.mocked(searchDonations).mock.calls[0]?.[1].searchFields).toEqual([
      { field: "Donation Status", operator: "EQUAL", value: "Failed" },
      {
        field: "Donation Created Date",
        operator: "GREATER_AND_EQUAL",
        value: "2025-12-02",
      },
    ]);
    expect(service.remove).toHaveBeenCalledOnce();
    expect(service.remove).toHaveBeenCalledWith(
      "neon",
      ["example-7", "example-8", "example-9"],
      "payment failed, canceled or refunded",
    );
  });

  it("still cleans up when nothing failed", async () => {
    configStore();
    failedSearch({});
    const provider = await NeonDonationProvider.init(service, env);
    await provider.removeFailedDonations();

    expect(service.remove).toHaveBeenCalledWith(
      "neon",
      [],
      "payment failed, canceled or refunded",
    );
  });

  it("imports a donation that left the failed set because it was paid", async () => {
    const state = configStore({ "neon-failed-payments": ["7", "8"] });
    failedSearch({ Failed: [["7"]] });
    vi.mocked(getDonation).mockResolvedValue({
      ok: true,
      data: DonationResponse.parse({
        ...rawDonation,
        id: "8",
        anonymousType: "No",
        origin: { originCategory: "Donation Form" },
      }),
    });
    const provider = await NeonDonationProvider.init(service, env);
    await provider.removeFailedDonations();

    expect(getDonation).toHaveBeenCalledOnce();
    expect(service.add).toHaveBeenCalledWith(
      expect.objectContaining({ providerUniqueId: "example-8" }),
    );
    expect(state["neon-failed-payments"]).toEqual(["7"]);
  });

  it.each([
    { status: "Pending", date: "2026-01-01", kept: true },
    { status: "Deferred", date: "2026-01-01", kept: true },
    { status: "Pending", date: "2025-11-01", kept: false },
    { status: "Failed", date: "2025-11-01", kept: false },
  ])(
    "keeps checking an unsettled payment within the window: %j",
    async ({ status, date, kept }) => {
      const state = configStore({ "neon-failed-payments": ["8"] });
      failedSearch({});
      vi.mocked(getDonation).mockResolvedValue({
        ok: true,
        data: DonationResponse.parse({
          ...rawDonation,
          id: "8",
          anonymousType: "No",
          status,
          date,
        }),
      });
      const provider = await NeonDonationProvider.init(service, env);
      await provider.removeFailedDonations();

      expect(service.add).not.toHaveBeenCalled();
      expect(state["neon-failed-payments"]).toEqual(kept ? ["8"] : undefined);
    },
  );

  it("stops checking a deleted donation", async () => {
    const state = configStore({ "neon-failed-payments": ["8"] });
    failedSearch({});
    vi.mocked(getDonation).mockResolvedValue({
      ok: false,
      errorType: "request",
      error: "Request failed with status 404",
      status: 404,
    });
    const provider = await NeonDonationProvider.init(service, env);
    await provider.removeFailedDonations();

    expect(state["neon-failed-payments"]).toBeUndefined();
  });

  it("retries a failed import on the next sweep", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const state = configStore({ "neon-failed-payments": ["8"] });
    failedSearch({});
    vi.mocked(getDonation).mockResolvedValue({
      ok: false,
      errorType: "network",
      error: "offline",
    });
    const provider = await NeonDonationProvider.init(service, env);
    await provider.removeFailedDonations();

    expect(service.add).not.toHaveBeenCalled();
    expect(state["neon-failed-payments"]).toEqual(["8"]);
  });

  it("removes what it found but keeps the failed set when a search fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const state = configStore({ "neon-failed-payments": ["5"] });
    vi.mocked(searchDonations)
      .mockResolvedValueOnce({
        ok: false,
        errorType: "request",
        error: "Request failed with status 429",
        status: 429,
      })
      .mockResolvedValue(search(["9"]));
    const provider = await NeonDonationProvider.init(service, env);
    await expect(provider.removeFailedDonations()).resolves.toBeUndefined();

    expect(service.remove).toHaveBeenCalledWith(
      "neon",
      ["example-9", "example-9"],
      "payment failed, canceled or refunded",
    );
    expect(Sentry.captureException).toHaveBeenCalledOnce();
    // Without a complete picture, nothing is treated as paid, but the newly
    // found failure is remembered.
    expect(getDonation).not.toHaveBeenCalled();
    expect(state["neon-failed-payments"]).toEqual(["5", "9"]);
  });

  it("runs one sweep at a time", async () => {
    configStore();
    failedSearch({});
    const provider = await NeonDonationProvider.init(service, env);
    await Promise.all([
      provider.removeFailedDonations(),
      provider.removeFailedDonations(),
    ]);
    expect(searchDonations).toHaveBeenCalledTimes(3);
    expect(service.remove).toHaveBeenCalledOnce();
  });
});
