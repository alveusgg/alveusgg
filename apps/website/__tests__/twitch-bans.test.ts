import { afterEach, beforeEach, expect, test, vi } from "vitest";

import {
  isPresetUserBanned,
  isTwitchUserBanned,
} from "@/server/utils/twitch-bans";

const { db, lookup, redis, optionalRedis } = vi.hoisted(() => ({
  db: {
    account: { findFirst: vi.fn() },
    twitchChannel: { findUnique: vi.fn() },
  },
  lookup: vi.fn(),
  redis: { get: vi.fn(), set: vi.fn() },
  optionalRedis: vi.fn(),
}));
vi.mock("@alveusgg/database", () => ({ prisma: db }));
vi.mock("@/server/apis/twitch", () => ({ getUserBanFromBroadcaster: lookup }));
vi.mock("@/server/utils/redis", () => ({ getRedisOptional: optionalRedis }));

const key = "twitch:chat-ban:v1:636587384:123";
const stored = new Map<string, unknown>();
const broadcaster = {
  provider: "twitch",
  providerAccountId: "636587384",
  access_token: "private-broadcaster-token",
  scope: "channel:read:subscriptions moderation:read",
};
beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-16T10:00:00Z"));
  stored.clear();
  optionalRedis.mockReturnValue(redis);
  redis.get.mockImplementation(async (key: string) => stored.get(key) ?? null);
  redis.set.mockImplementation(async (key: string, value: unknown) => {
    stored.set(key, value);
  });
  db.account.findFirst.mockResolvedValue({ providerAccountId: "123" });
  db.twitchChannel.findUnique.mockResolvedValue({
    broadcasterAccount: broadcaster,
  });
  lookup.mockResolvedValue(null);
});
afterEach(() => vi.useRealTimers());

test.each([null, { expiresAt: null }])(
  "successful results are shared in Redis for five minutes without sliding expiry: %j",
  async (ban) => {
    lookup.mockResolvedValue(ban);
    const checkedAt = Date.now();
    expect(await isPresetUserBanned("site-user")).toBe(ban !== null);
    expect(db.account.findFirst).toHaveBeenCalledWith({
      where: { userId: "site-user", provider: "twitch" },
      select: { providerAccountId: true },
    });
    expect(lookup).toHaveBeenCalledWith(
      "private-broadcaster-token",
      "636587384",
      "123",
      expect.any(AbortSignal),
    );
    expect(redis.set).toHaveBeenCalledWith(
      key,
      { banned: ban !== null, checkedAt, validUntil: checkedAt + 300_000 },
      { expiry: 300 },
    );
    vi.setSystemTime(checkedAt + 299_999);
    expect(await isTwitchUserBanned("123")).toBe(ban !== null);
    expect(lookup).toHaveBeenCalledTimes(1);
    expect(redis.set).toHaveBeenCalledTimes(1);
    // Deliberately leave the expired value in Redis: the embedded deadline is
    // authoritative even if Redis TTL expiration or a delayed write misbehaves.
    vi.setSystemTime(checkedAt + 300_000);
    lookup.mockResolvedValue(ban === null ? { expiresAt: null } : null);
    expect(await isTwitchUserBanned("123")).toBe(ban === null);
    expect(lookup).toHaveBeenCalledTimes(2);
  },
);

test("a timeout is never cached beyond its expiration", async () => {
  lookup.mockResolvedValue({
    expiresAt: new Date(Date.now() + 30_000).toISOString(),
  });
  expect(await isTwitchUserBanned("123")).toBe(true);
  expect(redis.set).toHaveBeenCalledWith(
    key,
    expect.objectContaining({ banned: true, validUntil: Date.now() + 30_000 }),
    { expiry: 30 },
  );
  vi.setSystemTime(Date.now() + 30_000);
  lookup.mockResolvedValue(null);
  expect(await isTwitchUserBanned("123")).toBe(false);
  expect(lookup).toHaveBeenCalledTimes(2);
});

test("expired timeout responses cannot establish unbanned status or populate the cache", async () => {
  lookup.mockResolvedValue({
    expiresAt: new Date(Date.now() - 1).toISOString(),
  });
  await expect(isTwitchUserBanned("123")).rejects.toThrow(
    "expired chat timeout",
  );
  expect(redis.set).not.toHaveBeenCalled();
});

test("simultaneous local misses share one bounded Twitch lookup", async () => {
  expect(
    await Promise.all([isTwitchUserBanned("123"), isTwitchUserBanned("123")]),
  ).toEqual([false, false]);
  expect(lookup).toHaveBeenCalledTimes(1);
});

test("cache entries cannot leak between Twitch users", async () => {
  await isTwitchUserBanned("123");
  lookup.mockResolvedValue({ expiresAt: null });
  expect(await isTwitchUserBanned("456")).toBe(true);
  expect(redis.set).toHaveBeenLastCalledWith(
    "twitch:chat-ban:v1:636587384:456",
    expect.objectContaining({ banned: true }),
    { expiry: 300 },
  );
});

test.each([
  null,
  { ...broadcaster, provider: "other" },
  { ...broadcaster, providerAccountId: "another-channel" },
  { ...broadcaster, access_token: null },
  { ...broadcaster, scope: "channel:read:subscriptions" },
])(
  "missing or mismatched broadcaster credentials fail closed: %j",
  async (account) => {
    db.twitchChannel.findUnique.mockResolvedValue({
      broadcasterAccount: account,
    });
    await expect(isTwitchUserBanned("123")).rejects.toThrow(
      "moderation credentials",
    );
    expect(lookup).not.toHaveBeenCalled();
    expect(redis.set).not.toHaveBeenCalled();
  },
);

test("a site identity without a Twitch account fails closed", async () => {
  db.account.findFirst.mockResolvedValue(null);
  await expect(isPresetUserBanned("site-user")).rejects.toThrow(
    "No Twitch identity",
  );
  expect(lookup).not.toHaveBeenCalled();
});

test("Twitch failures are never cached or replaced with stale unbanned status", async () => {
  await isTwitchUserBanned("123");
  vi.setSystemTime(Date.now() + 300_000);
  lookup.mockRejectedValueOnce(new Error("Twitch unavailable"));
  await expect(isTwitchUserBanned("123")).rejects.toThrow("Twitch unavailable");
  expect(redis.set).toHaveBeenCalledTimes(1);
  lookup.mockResolvedValue({ expiresAt: null });
  expect(await isTwitchUserBanned("123")).toBe(true);
});

test.each([
  false,
  { banned: false },
  {
    banned: "false",
    checkedAt: Date.parse("2026-10-16T10:00:00Z"),
    validUntil: Date.parse("2026-10-16T10:05:00Z"),
  },
  {
    banned: false,
    checkedAt: Date.parse("2026-10-16T10:00:01Z"),
    validUntil: Date.parse("2026-10-16T10:05:01Z"),
  },
  {
    banned: false,
    checkedAt: Date.parse("2026-10-16T10:00:00Z"),
    validUntil: Date.parse("2026-10-16T11:00:00Z"),
  },
])(
  "invalid cached authorization data is reverified with Twitch: %j",
  async (cached) => {
    stored.set(key, cached);
    lookup.mockResolvedValue({ expiresAt: null });
    expect(await isTwitchUserBanned("123")).toBe(true);
    expect(lookup).toHaveBeenCalledTimes(1);
  },
);

test("an absent Redis configuration falls back to verified Twitch responses", async () => {
  optionalRedis.mockReturnValue(undefined);
  expect(await isTwitchUserBanned("123")).toBe(false);
  expect(redis.get).not.toHaveBeenCalled();
  expect(redis.set).not.toHaveBeenCalled();
});

test("Redis read and write failures do not discard a successful Twitch verification", async () => {
  redis.get.mockRejectedValue(new Error("Redis unavailable"));
  redis.set.mockRejectedValue(new Error("Redis unavailable"));
  expect(await isTwitchUserBanned("123")).toBe(false);
  lookup.mockRejectedValue(new Error("Twitch also unavailable"));
  await expect(isTwitchUserBanned("123")).rejects.toThrow(
    "Twitch also unavailable",
  );
});

test("a stalled Redis read has a bounded fallback to Twitch", async () => {
  redis.get.mockImplementation(() => new Promise(() => {}));
  const pending = isTwitchUserBanned("123");
  await vi.advanceTimersByTimeAsync(500);
  expect(await pending).toBe(false);
  expect(lookup).toHaveBeenCalledTimes(1);
});
