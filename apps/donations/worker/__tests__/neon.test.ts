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
  remove: vi.fn(async () => ({ donations: 1, pixels: 1 })),
  config: { get: vi.fn(), set: vi.fn() },
} satisfies DonationStorage;

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

beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-01-02T00:00:00Z"));
  vi.spyOn(console, "info").mockImplementation(() => {});
  service.add.mockResolvedValue(1);
  service.remove.mockResolvedValue({ donations: 1, pixels: 1 });
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

describe("Neon webhooks", () => {
  function webhook(eventTrigger = "createDonation", data = {}) {
    return new Request("https://example.com/neon/live", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa("donations:example")}`,
      },
      body: JSON.stringify({
        eventTrigger,
        eventTimestamp: "2026-01-01T12:00:00Z",
        organizationId: "example",
        data: { ...rawDonation, anonymousType: "No", ...data },
      }),
    });
  }
  function details(overrides: Record<string, unknown> = {}) {
    vi.mocked(getDonation).mockResolvedValue({
      ok: true,
      data: DonationResponse.parse({
        ...rawDonation,
        anonymousType: "No",
        origin: { originCategory: "Donation Form" },
        ...overrides,
      }),
    });
  }
  const pending = {
    status: "Pending",
    payments: [{ id: "5", amount: 123.45, paymentStatus: "Pending" }],
  };

  it.each(["Data Entry", "Custom Import", "Batch Donation", "Self-Import"])(
    "acknowledges a %s donation without importing it",
    async (originCategory) => {
      details({ origin: { originCategory, originDetail: "Staff" } });
      const provider = await NeonDonationProvider.init(service, env);
      const response = await provider.handle(webhook());

      expect(response.status).toBe(200);
      expect(service.add).not.toHaveBeenCalled();
    },
  );

  it("imports a settled donation form donation without tracking it", async () => {
    const state = configStore();
    details();
    const provider = await NeonDonationProvider.init(service, env);
    const response = await provider.handle(webhook());

    expect(response.status).toBe(200);
    expect(getDonation).toHaveBeenCalledWith(expect.anything(), "1");
    expect(service.add).toHaveBeenCalledOnce();
    expect(state["neon-payments"]).toBeUndefined();
  });

  it("imports a pending payment right away and tracks it", async () => {
    const state = configStore();
    details(pending);
    const provider = await NeonDonationProvider.init(service, env);
    const response = await provider.handle(webhook());

    expect(response.status).toBe(200);
    expect(service.add).toHaveBeenCalledOnce();
    expect(state["neon-payments"]).toEqual({
      "1": { importedAt: "2026-01-02T00:00:00.000Z" },
    });
  });

  it("skips a donation whose payment already failed", async () => {
    details({ status: "Failed" });
    const provider = await NeonDonationProvider.init(service, env);
    const response = await provider.handle(webhook());

    expect(response.status).toBe(200);
    expect(service.add).not.toHaveBeenCalled();
  });

  it("asks Neon to retry when the donation lookup fails", async () => {
    vi.mocked(getDonation).mockResolvedValue({
      ok: false,
      errorType: "network",
      error: "offline",
    });
    const provider = await NeonDonationProvider.init(service, env);
    const response = await provider.handle(webhook());

    expect(response.status).toBe(500);
    expect(service.add).not.toHaveBeenCalled();
  });

  it("removes a tracked donation once its payment fails", async () => {
    const state = configStore({
      "neon-payments": { "1": { importedAt: "2026-01-01T23:58:00.000Z" } },
    });
    details({ status: "Failed" });
    const provider = await NeonDonationProvider.init(service, env);
    const response = await provider.handle(
      webhook("updateDonation", { id: "1" }),
    );

    expect(response.status).toBe(200);
    expect(service.remove).toHaveBeenCalledWith(
      "neon",
      "example-1",
      "payment failed",
    );
    // Keep watching in case the payment is retried.
    expect(state["neon-payments"]).toEqual({
      "1": {
        importedAt: "2026-01-01T23:58:00.000Z",
        removedAt: "2026-01-02T00:00:00.000Z",
      },
    });
  });

  it("imports a removed donation again once its payment succeeds", async () => {
    const state = configStore({
      "neon-payments": {
        "1": {
          importedAt: "2026-01-01T00:00:00.000Z",
          removedAt: "2026-01-01T00:05:00.000Z",
        },
      },
    });
    details();
    const provider = await NeonDonationProvider.init(service, env);
    const response = await provider.handle(
      webhook("updateDonation", { id: "1" }),
    );

    expect(response.status).toBe(200);
    expect(service.add).toHaveBeenCalledWith(
      expect.objectContaining({ providerUniqueId: "example-1" }),
    );
    expect(state["neon-payments"]).toBeUndefined();
  });

  it("ignores updates to settled donations it is not tracking", async () => {
    configStore();
    details({ date: "2025-01-01" });
    const provider = await NeonDonationProvider.init(service, env);
    const response = await provider.handle(
      webhook("updateDonation", { id: "1" }),
    );

    expect(response.status).toBe(200);
    expect(service.add).not.toHaveBeenCalled();
    expect(service.remove).not.toHaveBeenCalled();
  });

  it("removes a deleted donation", async () => {
    configStore();
    vi.mocked(getDonation).mockResolvedValue({
      ok: false,
      errorType: "request",
      error: "Request failed with status 404",
      status: 404,
    });
    const provider = await NeonDonationProvider.init(service, env);
    const response = await provider.handle(
      webhook("deleteDonation", { id: "1" }),
    );

    expect(response.status).toBe(200);
    expect(service.remove).toHaveBeenCalledWith(
      "neon",
      "example-1",
      "deleted in Neon",
    );
  });

  it("asks Neon to retry when removing a donation fails", async () => {
    configStore();
    details({ status: "Refunded" });
    service.remove.mockRejectedValue(new Error("site unavailable"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const provider = await NeonDonationProvider.init(service, env);
    const response = await provider.handle(
      webhook("updateDonation", { id: "1" }),
    );

    expect(response.status).toBe(500);
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
    const state = configStore({ "neon-sync": initial });
    return () => state["neon-sync"];
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

  it("rechecks tracked payments and stops tracking stale ones", async () => {
    const state = configStore({
      "neon-sync": { lastSyncedAt: "2026-01-01T00:00:00.000Z" },
      "neon-payments": {
        "1": { importedAt: "2026-01-01T00:00:00.000Z" },
        "2": { importedAt: "2026-01-01T00:00:00.000Z" },
        "3": { importedAt: "2025-12-20T00:00:00.000Z" },
        "4": { importedAt: "2026-01-01T00:00:00.000Z" },
        "5": {
          importedAt: "2026-01-01T00:00:00.000Z",
          removedAt: "2026-01-01T00:10:00.000Z",
        },
      },
    });
    vi.mocked(searchDonations).mockResolvedValue(page([]));
    vi.mocked(getDonation).mockImplementation(async (_options, id) => ({
      ok: true,
      data: DonationResponse.parse({
        ...rawDonation,
        id,
        anonymousType: "No",
        status:
          { "1": "Deferred", "2": "Failed", "3": "Pending", "5": "Failed" }[
            id
          ] ?? "Succeeded",
      }),
    }));
    const provider = await NeonDonationProvider.init(service, env);
    await provider.syncRecentDonations();

    expect(service.remove).toHaveBeenCalledOnce();
    expect(service.remove).toHaveBeenCalledWith(
      "neon",
      "example-2",
      "payment failed",
    );
    const checkedAt = "2026-01-02T00:00:00.000Z";
    expect(state["neon-payments"]).toEqual({
      // Not a final status yet, so keep watching it.
      "1": { importedAt: "2026-01-01T00:00:00.000Z", checkedAt },
      "2": {
        importedAt: "2026-01-01T00:00:00.000Z",
        removedAt: "2026-01-02T00:00:00.000Z",
        checkedAt,
      },
      // Already removed, so it is not removed again.
      "5": {
        importedAt: "2026-01-01T00:00:00.000Z",
        removedAt: "2026-01-01T00:10:00.000Z",
        checkedAt,
      },
    });
  });

  it("rotates rechecks so long-pending payments cannot starve newer ones", async () => {
    const payments = Object.fromEntries(
      Array.from({ length: 25 }, (_, index) => [
        String(index + 1),
        {
          importedAt: `2026-01-01T00:${String(index).padStart(2, "0")}:00.000Z`,
        },
      ]),
    );
    configStore({
      "neon-sync": { lastSyncedAt: "2026-01-01T00:00:00.000Z" },
      "neon-payments": payments,
    });
    vi.mocked(searchDonations).mockResolvedValue(page([]));
    vi.mocked(getDonation).mockImplementation(async (_options, id) => ({
      ok: true,
      data: DonationResponse.parse({
        ...rawDonation,
        id,
        anonymousType: "No",
        status: "Deferred",
      }),
    }));
    const provider = await NeonDonationProvider.init(service, env);
    await provider.syncRecentDonations();
    expect(getDonation).toHaveBeenCalledTimes(20);

    vi.mocked(getDonation).mockClear();
    vi.setSystemTime(new Date("2026-01-02T01:00:00Z"));
    await provider.syncRecentDonations();
    const second = vi.mocked(getDonation).mock.calls.map(([, id]) => id);
    // The five that were not checked last time go first.
    expect(second.slice(0, 5)).toEqual(["21", "22", "23", "24", "25"]);
  });

  it("keeps tracking a removed payment until its re-import succeeds", async () => {
    const state = configStore({
      "neon-sync": { lastSyncedAt: "2026-01-01T00:00:00.000Z" },
      "neon-payments": {
        "1": {
          importedAt: "2026-01-01T00:00:00.000Z",
          removedAt: "2026-01-01T00:05:00.000Z",
        },
      },
    });
    vi.mocked(searchDonations).mockResolvedValue(page([]));
    vi.mocked(getDonation).mockResolvedValue({
      ok: true,
      data: normalDonation("1"),
    });
    vi.mocked(getAccount).mockResolvedValueOnce({
      ok: false,
      errorType: "network",
      error: "offline",
    });
    vi.spyOn(console, "error").mockImplementation(() => {});
    const provider = await NeonDonationProvider.init(service, env);
    await provider.syncRecentDonations();

    expect(service.add).not.toHaveBeenCalled();
    expect(state["neon-payments"]).toMatchObject({
      "1": { removedAt: "2026-01-01T00:05:00.000Z" },
    });

    vi.setSystemTime(new Date("2026-01-02T01:00:00Z"));
    await provider.syncRecentDonations();
    expect(service.add).toHaveBeenCalledWith(
      expect.objectContaining({ providerUniqueId: "example-1" }),
    );
    expect(state["neon-payments"]).toBeUndefined();
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
