import { randomUUID } from "node:crypto";
import { clearTimeout, setTimeout } from "node:timers";

import { z } from "zod";

import { prisma } from "@alveusgg/database";

import { getUserBanFromBroadcaster } from "@/server/apis/twitch";
import { getAlveusBroadcasterToken } from "@/server/db/twitch-channels";
import { getRedis, getRedisOptional } from "@/server/utils/redis";

import { channels } from "@/data/twitch";

// EventSub invalidates immediately on delivery; this bounds staleness if an
// event is missed. Cache hits never renew the deadline, even if writes lag.
const CACHE_SECONDS = 5 * 60;
// Keep the event fence longer than any lookup cache entry can survive.
const FENCE_SECONDS = CACHE_SECONDS * 2;
const cachedBanSchema = z.strictObject({
  banned: z.boolean(),
  checkedAt: z.number().int().nonnegative(),
  validUntil: z.number().int().nonnegative(),
  revision: z.uuid().nullable(),
});
const fenceSchema = z.strictObject({
  revision: z.uuid(),
  bannedUntil: z.number().int().nonnegative().nullable(),
});
type Fence = z.infer<typeof fenceSchema>;
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

const fenceKey = (twitchUserId: string) =>
  `twitch:chat-ban:fence:${channels.alveus.id}:${twitchUserId}`;

const bannedByEvent = (fence: Fence | null | undefined) =>
  fence?.bannedUntil != null && fence.bannedUntil > Date.now();

function validTwitchUserId(twitchUserId: string) {
  if (!/^[0-9]{1,32}$/.test(twitchUserId))
    throw new Error(
      "A Twitch user identity is required for chat ban verification.",
    );
}

export async function invalidateTwitchBan(
  twitchUserId: string,
  ban?: { endsAt: string | null },
) {
  validTwitchUserId(twitchUserId);
  const now = Date.now();
  // A ban denies straight from the event, as Helix can lag behind EventSub and
  // a lookup must not cache that stale allow. Unbans only invalidate, so an
  // out-of-order or repeated unban can never grant access.
  const fence: Fence = {
    revision: randomUUID(),
    bannedUntil: ban
      ? Math.min(
          now + FENCE_SECONDS * 1000,
          ban.endsAt ? Date.parse(ban.endsAt) : Infinity,
        )
      : null,
  };
  // Do not acknowledge the webhook unless Redis confirms this write.
  await cacheOperation(() =>
    getRedis().set(fenceKey(twitchUserId), fence, { expiry: FENCE_SECONDS }),
  );
}

async function lookupBan(twitchUserId: string) {
  const redis = getRedisOptional();
  const key = `twitch:chat-ban:v2:${channels.alveus.id}:${twitchUserId}`;
  // undefined: Redis could not tell us whether an event arrived.
  const readFence = async () => {
    const raw = redis
      ? await bestEffortCache(() => redis.get(fenceKey(twitchUserId)))
      : undefined;
    return raw === null ? null : fenceSchema.safeParse(raw).data;
  };
  const [fence, rawCache] = await Promise.all([
    readFence(),
    redis ? bestEffortCache(() => redis.get(key)) : undefined,
  ]);
  if (bannedByEvent(fence)) return true;
  const revision = fence === undefined ? undefined : (fence?.revision ?? null);
  const cached = cachedBanSchema.safeParse(rawCache);
  const now = Date.now();
  // Events never write the entry itself, so an event landing between these two
  // reads still leaves a consistent answer from just before it.
  if (
    cached.success &&
    revision !== undefined &&
    cached.data.revision === revision &&
    cached.data.checkedAt <= now &&
    cached.data.validUntil > now &&
    cached.data.validUntil <= cached.data.checkedAt + CACHE_SECONDS * 1000
  )
    return cached.data.banned;

  const token = await getAlveusBroadcasterToken("moderation:read");
  if (!token)
    throw new Error("Alveus chat moderation credentials are unavailable.");

  // Start the cache lifetime before the request, not when Redis accepts a write.
  const checkedAt = Date.now();
  const ban = await getUserBanFromBroadcaster(
    token,
    channels.alveus.id,
    twitchUserId,
    AbortSignal.timeout(5000),
  );
  const expiresAt = ban?.expiresAt ? Date.parse(ban.expiresAt) : null;
  // Twitch can briefly keep listing a timeout after it ends.
  const banned = ban !== null && (expiresAt === null || expiresAt > Date.now());
  const validUntil = Math.min(
    checkedAt + CACHE_SECONDS * 1000,
    banned && expiresAt !== null ? expiresAt : Infinity,
  );
  // An entry written under a revision an event has since replaced is never
  // read back, so this write cannot race an event into restoring access.
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
  // A ban delivered while Twitch answered wins over that possibly stale answer.
  if (bannedByEvent(await readFence())) return true;
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
