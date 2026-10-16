import { afterEach, beforeEach, expect, test, vi } from "vitest";

import {
  invalidateTwitchBan,
  isPresetUserBanned,
  isTwitchUserBanned,
} from "@/server/utils/twitch-bans";

const { db, env, lookup, redis, optionalRedis } = vi.hoisted(() => ({
  db: {
    account: { findFirst: vi.fn() },
    twitchChannel: { findUnique: vi.fn() },
  },
  env: { NODE_ENV: "test", DISABLE_ADMIN_AUTH: false },
  lookup: vi.fn(),
  redis: { get: vi.fn(), set: vi.fn() },
  optionalRedis: vi.fn(),
}));
vi.mock("@alveusgg/database", () => ({ prisma: db }));
vi.mock("@/env", () => ({ env }));
vi.mock("@/server/apis/twitch", () => ({ getUserBanFromBroadcaster: lookup }));
vi.mock("@/server/utils/redis", () => ({
  getRedisOptional: optionalRedis,
  getRedis: optionalRedis,
}));

const key = "twitch:chat-ban:v2:636587384:123";
const fenceKey = "twitch:chat-ban:fence:636587384:123";
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
  Object.assign(env, { NODE_ENV: "test", DISABLE_ADMIN_AUTH: false });
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
      {
        banned: ban !== null,
        checkedAt,
        validUntil: checkedAt + 300_000,
        revision: null,
      },
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

test("a timeout Twitch still lists after it ended counts as unbanned", async () => {
  lookup.mockResolvedValue({
    expiresAt: new Date(Date.now() - 1).toISOString(),
  });
  expect(await isTwitchUserBanned("123")).toBe(false);
  expect(redis.set).toHaveBeenCalledWith(
    key,
    expect.objectContaining({
      banned: false,
      validUntil: Date.now() + 300_000,
    }),
    { expiry: 300 },
  );
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
    "twitch:chat-ban:v2:636587384:456",
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
    revision: null,
    checkedAt: Date.parse("2026-10-16T10:00:01Z"),
    validUntil: Date.parse("2026-10-16T10:05:01Z"),
  },
  {
    banned: false,
    revision: null,
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

test("the local DISABLE_ADMIN_AUTH session skips the ban check", async () => {
  Object.assign(env, { NODE_ENV: "development", DISABLE_ADMIN_AUTH: true });
  expect(await isPresetUserBanned("dev-admin")).toBe(false);
  expect(db.account.findFirst).not.toHaveBeenCalled();
  expect(lookup).not.toHaveBeenCalled();
});

test.each([
  { NODE_ENV: "production", DISABLE_ADMIN_AUTH: true },
  { NODE_ENV: "development", DISABLE_ADMIN_AUTH: false },
])(
  "the dev-admin bypass needs local development with auth disabled: %j",
  async (config) => {
    Object.assign(env, config);
    db.account.findFirst.mockResolvedValue(null);
    await expect(isPresetUserBanned("dev-admin")).rejects.toThrow(
      "No Twitch identity",
    );
  },
);

test("chat identities from queued operations do not require a website signup", async () => {
  expect(await isPresetUserBanned("twitch:123")).toBe(false);
  expect(db.account.findFirst).not.toHaveBeenCalled();
});

test("a delivered event invalidates a cached allow immediately and the next check re-fetches Twitch", async () => {
  await isTwitchUserBanned("123");
  await invalidateTwitchBan("123");
  expect(redis.set).toHaveBeenLastCalledWith(
    fenceKey,
    { revision: expect.any(String), bannedUntil: null },
    { expiry: 600 },
  );
  lookup.mockResolvedValue({ expiresAt: null });
  expect(await isTwitchUserBanned("123")).toBe(true);
  expect(lookup).toHaveBeenCalledTimes(2);
});

test("a ban event denies without waiting for Twitch's moderation API to catch up", async () => {
  await isTwitchUserBanned("123");
  await invalidateTwitchBan("123", { endsAt: null });
  expect(stored.get(fenceKey)).toEqual({
    revision: expect.any(String),
    bannedUntil: Date.now() + 600_000,
  });
  // Helix still reports the user as unbanned.
  expect(await isTwitchUserBanned("123")).toBe(true);
  expect(lookup).toHaveBeenCalledTimes(1);
  // After the fence, a fresh Helix answer is authoritative again.
  vi.setSystemTime(Date.now() + 600_000);
  stored.delete(fenceKey);
  lookup.mockResolvedValue({ expiresAt: null });
  expect(await isTwitchUserBanned("123")).toBe(true);
  expect(lookup).toHaveBeenCalledTimes(2);
});

test("a timeout event denies only until the timeout ends", async () => {
  const endsAt = new Date(Date.now() + 60_000).toISOString();
  await invalidateTwitchBan("123", { endsAt });
  expect(stored.get(fenceKey)).toMatchObject({
    bannedUntil: Date.parse(endsAt),
  });
  expect(await isTwitchUserBanned("123")).toBe(true);
  expect(lookup).not.toHaveBeenCalled();
  vi.setSystemTime(Date.parse(endsAt));
  expect(await isTwitchUserBanned("123")).toBe(false);
  expect(lookup).toHaveBeenCalledTimes(1);
});

test("duplicate and out-of-order invalidations never grant access or slide the cache deadline", async () => {
  lookup.mockResolvedValue({ expiresAt: null });
  expect(await isTwitchUserBanned("123")).toBe(true);
  await invalidateTwitchBan("123");
  await invalidateTwitchBan("123");
  expect(await isTwitchUserBanned("123")).toBe(true);
  expect(lookup).toHaveBeenCalledTimes(2);
});

test("a late ban event delivered after its unban fails closed until the fence ends", async () => {
  await invalidateTwitchBan("123");
  await invalidateTwitchBan("123", { endsAt: null });
  expect(await isTwitchUserBanned("123")).toBe(true);
  expect(lookup).not.toHaveBeenCalled();
});

test("an unban invalidates a cached denial and requires fresh proof before restoring access", async () => {
  lookup.mockResolvedValue({ expiresAt: null });
  expect(await isTwitchUserBanned("123")).toBe(true);
  await invalidateTwitchBan("123");
  lookup.mockResolvedValue(null);
  expect(await isTwitchUserBanned("123")).toBe(false);
  expect(lookup).toHaveBeenCalledTimes(2);
});

test("a cache write racing an event is never read back", async () => {
  let invalidate = true;
  redis.set.mockImplementation(async (name: string, value: unknown) => {
    if (name === key && invalidate) {
      invalidate = false;
      await invalidateTwitchBan("123");
    }
    stored.set(name, value);
  });
  expect(await isTwitchUserBanned("123")).toBe(false);
  lookup.mockResolvedValue({ expiresAt: null });
  expect(await isTwitchUserBanned("123")).toBe(true);
  expect(lookup).toHaveBeenCalledTimes(2);
});

test("a ban event arriving during a Twitch lookup overrides its possibly stale answer", async () => {
  let release!: (value: null) => void;
  lookup.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        release = resolve;
      }),
  );
  const pending = isTwitchUserBanned("123");
  await vi.waitFor(() => expect(lookup).toHaveBeenCalledTimes(1));
  await invalidateTwitchBan("123", { endsAt: null });
  release(null);
  expect(await pending).toBe(true);
  // The obsolete allow was written under the replaced revision only.
  expect(stored.get(key)).toMatchObject({ banned: false, revision: null });
  expect(await isTwitchUserBanned("123")).toBe(true);
  expect(lookup).toHaveBeenCalledTimes(1);
});

test("an unban arriving during a Twitch lookup keeps that lookup's answer out of the cache", async () => {
  let release!: (value: { expiresAt: null }) => void;
  lookup.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        release = resolve;
      }),
  );
  const pending = isTwitchUserBanned("123");
  await vi.waitFor(() => expect(lookup).toHaveBeenCalledTimes(1));
  await invalidateTwitchBan("123");
  release({ expiresAt: null });
  expect(await pending).toBe(true);
  lookup.mockResolvedValue(null);
  expect(await isTwitchUserBanned("123")).toBe(false);
  expect(lookup).toHaveBeenCalledTimes(2);
});

test("a ban event racing a cached read applies from the next check", async () => {
  await isTwitchUserBanned("123");
  let invalidate = true;
  redis.get.mockImplementation(async (name: string) => {
    const value = stored.get(name) ?? null;
    if (name === key && invalidate) {
      invalidate = false;
      await invalidateTwitchBan("123", { endsAt: null });
    }
    return value;
  });
  // Both reads saw the state from just before the event.
  expect(await isTwitchUserBanned("123")).toBe(false);
  expect(await isTwitchUserBanned("123")).toBe(true);
  expect(lookup).toHaveBeenCalledTimes(1);
});

test("a transient fence read failure does not turn a verified lookup into a denial", async () => {
  let failures = 1;
  redis.get.mockImplementation(async (name: string) => {
    if (name === fenceKey && failures-- > 0) throw new Error("Redis timeout");
    return stored.get(name) ?? null;
  });
  expect(await isTwitchUserBanned("123")).toBe(false);
  // The fence couldn't be read, so nothing proves the entry is current.
  expect(redis.set).not.toHaveBeenCalled();
});

test("an unreadable fence is never treated as proof of a current cache entry", async () => {
  await isTwitchUserBanned("123");
  stored.set(fenceKey, "not-a-fence");
  lookup.mockResolvedValue({ expiresAt: null });
  expect(await isTwitchUserBanned("123")).toBe(true);
  expect(lookup).toHaveBeenCalledTimes(2);
});

test("a lost invalidation write is retryable rather than acknowledged", async () => {
  redis.set.mockRejectedValue(new Error("Redis unavailable"));
  await expect(invalidateTwitchBan("123")).rejects.toThrow("Redis unavailable");
});
