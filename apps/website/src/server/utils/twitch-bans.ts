import { randomUUID } from "node:crypto";
import { clearTimeout, setTimeout } from "node:timers";

import { z } from "zod";

import { prisma } from "@alveusgg/database";

import { getUserBanFromBroadcaster } from "@/server/apis/twitch";
import { getRedis, getRedisOptional } from "@/server/utils/redis";

import { channels } from "@/data/twitch";

// EventSub invalidates immediately on delivery; this bounds staleness if an
// event is missed. Cache hits never renew the deadline, even if writes lag.
const CACHE_SECONDS = 5 * 60;
const cachedBanSchema = z.strictObject({
  banned: z.boolean(),
  checkedAt: z.number().int().nonnegative(),
  validUntil: z.number().int().nonnegative(),
  revision: z.uuid().nullable(),
});
const inFlight = new Map<string, Promise<boolean>>();

async function cacheOperation<T>(operation: () => Promise<T>) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error("Moderation cache timed out.")),
          500,
        );
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

async function bestEffortCache<T>(operation: () => Promise<T>) {
  try {
    return await cacheOperation(operation);
  } catch {
    // Redis is an optimization. Only a successful Twitch lookup can replace a
    // missing, invalid or expired entry; never interpret an outage as unbanned.
    return undefined;
  }
}

const revisionKey = (twitchUserId: string) =>
  `twitch:chat-ban:revision:${channels.alveus.id}:${twitchUserId}`;

function validTwitchUserId(twitchUserId: string) {
  if (!/^[0-9]{1,32}$/.test(twitchUserId))
    throw new Error(
      "A Twitch user identity is required for chat ban verification.",
    );
}

export async function invalidateTwitchBan(twitchUserId: string) {
  validTwitchUserId(twitchUserId);
  // Events only invalidate; an out-of-order or repeated unban can never grant
  // access. Keep the fence longer than any lookup cache entry can survive.
  // Do not acknowledge the webhook unless Redis confirms this write.
  await cacheOperation(() =>
    getRedis().set(revisionKey(twitchUserId), randomUUID(), {
      expiry: CACHE_SECONDS * 2,
    }),
  );
}

async function lookupBan(twitchUserId: string) {
  const redis = getRedisOptional();
  const key = `twitch:chat-ban:v2:${channels.alveus.id}:${twitchUserId}`;
  const readRevision = async () => {
    const raw = redis
      ? await bestEffortCache(() => redis.get(revisionKey(twitchUserId)))
      : undefined;
    return raw === null ? null : z.uuid().safeParse(raw).data;
  };
  const [revision, rawCache] = await Promise.all([
    readRevision(),
    redis ? bestEffortCache(() => redis.get(key)) : undefined,
  ]);
  const cached = cachedBanSchema.safeParse(rawCache);
  const assertUnchanged = async () => {
    if ((await readRevision()) !== revision)
      throw new Error(
        "Chat moderation changed during verification. Retry the lookup.",
      );
  };
  const now = Date.now();
  if (
    cached.success &&
    revision !== undefined &&
    cached.data.revision === revision &&
    cached.data.checkedAt <= now &&
    cached.data.validUntil > now &&
    cached.data.validUntil <= cached.data.checkedAt + CACHE_SECONDS * 1000
  ) {
    await assertUnchanged();
    return cached.data.banned;
  }

  const channel = await prisma.twitchChannel.findUnique({
    where: { channelId: channels.alveus.id },
    select: {
      broadcasterAccount: {
        select: {
          provider: true,
          providerAccountId: true,
          access_token: true,
          scope: true,
        },
      },
    },
  });
  const account = channel?.broadcasterAccount;
  if (
    account?.provider !== "twitch" ||
    account.providerAccountId !== channels.alveus.id ||
    !account.access_token ||
    !account.scope?.split(" ").includes("moderation:read")
  )
    throw new Error("Alveus chat moderation credentials are unavailable.");

  // Start the cache lifetime before the request, not when Redis accepts a write.
  const checkedAt = Date.now();
  const ban = await getUserBanFromBroadcaster(
    account.access_token,
    channels.alveus.id,
    twitchUserId,
    AbortSignal.timeout(5000),
  );
  const validUntil = Math.min(
    checkedAt + CACHE_SECONDS * 1000,
    ban?.expiresAt ? Date.parse(ban.expiresAt) : Infinity,
  );
  const banned = ban !== null && validUntil > Date.now();
  // An expired timeout isn't proof that the user has not since been banned.
  if (ban && validUntil <= Date.now())
    throw new Error("Twitch returned an expired chat timeout.");
  await assertUnchanged();
  if (redis && revision !== undefined && validUntil > Date.now())
    await bestEffortCache(() =>
      redis.set(
        key,
        { banned, checkedAt, validUntil, revision },
        {
          expiry: Math.max(1, Math.ceil((validUntil - Date.now()) / 1000)),
        },
      ),
    );
  await assertUnchanged();
  return banned;
}

export async function isTwitchUserBanned(twitchUserId: string) {
  validTwitchUserId(twitchUserId);
  const existing = inFlight.get(twitchUserId);
  if (existing) return existing;
  const pending = lookupBan(twitchUserId).finally(() =>
    inFlight.delete(twitchUserId),
  );
  inFlight.set(twitchUserId, pending);
  return pending;
}

export async function isPresetUserBanned(userId: string) {
  const chatIdentity = /^twitch:([0-9]{1,32})$/.exec(userId);
  if (chatIdentity) return isTwitchUserBanned(chatIdentity[1]!);
  const account = await prisma.account.findFirst({
    where: { userId, provider: "twitch" },
    select: { providerAccountId: true },
  });
  if (!account) throw new Error("No Twitch identity found for preset user.");
  return isTwitchUserBanned(account.providerAccountId);
}
