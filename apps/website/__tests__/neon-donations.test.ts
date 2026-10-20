import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { syncNeonDonationAccounts } from "@/server/utils/neon-donations";
import { RedisValueAlreadyExistsError } from "@/server/utils/redis";

const { redis, getDonations, updateAccounts } = vi.hoisted(() => ({
  redis: { set: vi.fn() },
  getDonations: vi.fn(),
  updateAccounts: vi.fn(),
}));

vi.mock("@/env", () => ({
  env: {
    NEXT_PUBLIC_BASE_URL: "https://example.com",
    NEON_CRM_ORG_ID: "example",
    NEON_CRM_API_KEY: "api-key",
  },
}));
vi.mock("@/server/db/donations", () => ({
  getNeonDonationsForSync: getDonations,
  updateNeonDonationAccounts: updateAccounts,
}));
vi.mock("@/server/utils/redis", () => ({
  getRedis: () => redis,
  RedisValueAlreadyExistsError: class extends Error {},
}));

const cache = new Map<string, { value: unknown; expiresAt: number }>();
const fetchMock = vi.fn<typeof fetch>();
const key = "neon-donation-sync:https://example.com:example:200";

function accountPage(
  donations: { id: string; accountId: string }[],
  currentPage = 0,
  totalPages = 1,
) {
  return Response.json({
    donations,
    pagination: { currentPage, totalPages, pageSize: 20, totalResults: 40 },
  });
}

function storedDonation(id: string, neonAccountId: string) {
  return {
    id: `local-${id}`,
    providerUniqueId: `example-${id}`,
    providerMetadata: { neonAccountId, neonCampaignId: "2" },
  };
}

function neonDonation(id: string, accountId: string) {
  return Response.json({
    id,
    accountId,
    amount: 100,
    campaign: null,
    fund: null,
    date: "2026-01-01",
    timestamps: {
      createdBy: null,
      lastModifiedBy: null,
      createdDateTime: "2026-01-01T00:00:00Z",
      lastModifiedDateTime: "2026-01-01T00:00:00Z",
    },
  });
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  vi.clearAllMocks();
  cache.clear();
  redis.set.mockImplementation(async (key, value, options) => {
    if (
      options.overwrite === false &&
      (cache.get(key)?.expiresAt ?? 0) > Date.now()
    ) {
      throw new RedisValueAlreadyExistsError(key);
    }
    cache.set(key, { value, expiresAt: Date.now() + options.expiry * 1000 });
  });
  getDonations.mockResolvedValue([]);
  updateAccounts.mockResolvedValue(undefined);
  fetchMock.mockReset().mockImplementation(async () => accountPage([]));
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

test("relinks existing donations by source ID across all pages", async () => {
  fetchMock
    .mockResolvedValueOnce(accountPage([{ id: "1", accountId: "200" }], 0, 2))
    .mockResolvedValueOnce(accountPage([{ id: "2", accountId: "200" }], 1, 2));
  getDonations.mockResolvedValue([
    storedDonation("1", "100"),
    storedDonation("2", "200"),
  ]);

  await syncNeonDonationAccounts("200");

  expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
    "https://api.neoncrm.com/v2/accounts/200/donations?currentPage=0",
    "https://api.neoncrm.com/v2/accounts/200/donations?currentPage=1",
  ]);
  expect(getDonations).toHaveBeenCalledWith("example", "200", [
    "example-1",
    "example-2",
  ]);
  expect(updateAccounts).toHaveBeenCalledExactlyOnceWith([
    { id: "local-1", accountId: "200" },
  ]);
  expect(cache.get(key)?.value).toBe("complete");
});

test("verifies locally linked donations missing from Neon's list", async () => {
  getDonations.mockResolvedValue([
    storedDonation("1", "200"),
    storedDonation("2", "200"),
  ]);
  fetchMock
    .mockResolvedValueOnce(accountPage([]))
    .mockResolvedValueOnce(neonDonation("1", "300"))
    .mockResolvedValueOnce(new Response(null, { status: 404 }));

  await syncNeonDonationAccounts("200");

  expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
    "https://api.neoncrm.com/v2/accounts/200/donations?currentPage=0",
    "https://api.neoncrm.com/v2/donations/1",
    "https://api.neoncrm.com/v2/donations/2",
  ]);
  expect(updateAccounts).toHaveBeenCalledExactlyOnceWith([
    { id: "local-1", accountId: "300" },
    { id: "local-2", accountId: null },
  ]);
});

test.each(["later page", "missing donation"])(
  "does not write or mark complete after a failed %s",
  async (failure) => {
    if (failure === "later page") {
      fetchMock.mockResolvedValueOnce(
        accountPage([{ id: "1", accountId: "200" }], 0, 2),
      );
    } else {
      fetchMock.mockResolvedValueOnce(
        accountPage([{ id: "1", accountId: "200" }]),
      );
      getDonations.mockResolvedValue([
        storedDonation("1", "100"),
        storedDonation("2", "200"),
      ]);
    }
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 500 }));

    await expect(syncNeonDonationAccounts("200")).rejects.toThrow();

    expect(updateAccounts).not.toHaveBeenCalled();
    expect(cache.get(key)?.value).toBe("pending");
    fetchMock.mockResolvedValue(accountPage([]));
    getDonations.mockResolvedValue([]);
    vi.setSystemTime(Date.now() + 60_000);
    await syncNeonDonationAccounts("200");
    expect(cache.get(key)?.value).toBe("complete");
  },
);

test("rejects donations belonging to another account", async () => {
  fetchMock.mockResolvedValue(accountPage([{ id: "1", accountId: "100" }]));

  await expect(syncNeonDonationAccounts("200")).rejects.toThrow(
    "another account",
  );
  expect(getDonations).not.toHaveBeenCalled();
  expect(updateAccounts).not.toHaveBeenCalled();
});

test("rejects a mismatched donation ID when verifying missing ownership", async () => {
  getDonations.mockResolvedValue([storedDonation("1", "200")]);
  fetchMock
    .mockResolvedValueOnce(accountPage([]))
    .mockResolvedValueOnce(neonDonation("2", "300"));

  await expect(syncNeonDonationAccounts("200")).rejects.toThrow(
    "unexpected donation ID",
  );
  expect(updateAccounts).not.toHaveBeenCalled();
});

test("bounds account history requests without applying a partial list", async () => {
  fetchMock.mockResolvedValue(
    accountPage([{ id: "1", accountId: "200" }], 0, 11),
  );

  await expect(syncNeonDonationAccounts("200")).rejects.toThrow("sync limits");
  expect(fetchMock).toHaveBeenCalledOnce();
  expect(updateAccounts).not.toHaveBeenCalled();
  expect(cache.get(key)?.value).toBe("pending");
});

test("avoids duplicate work for overlapping logins and throttles completed syncs per account", async () => {
  await Promise.all([
    syncNeonDonationAccounts("200"),
    syncNeonDonationAccounts("200"),
  ]);
  await syncNeonDonationAccounts("200");
  expect(fetchMock).toHaveBeenCalledOnce();

  await syncNeonDonationAccounts("300");
  expect(fetchMock).toHaveBeenCalledTimes(2);

  vi.setSystemTime(Date.now() + 15 * 60_000);
  await syncNeonDonationAccounts("200");
  expect(fetchMock).toHaveBeenCalledTimes(3);
});
