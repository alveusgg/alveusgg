import { clearTimeout, setTimeout } from "node:timers";

import { z } from "zod";

import { prisma } from "@alveusgg/database";

import { getUserBanFromBroadcaster } from "@/server/apis/twitch";
import { getRedisOptional } from "@/server/utils/redis";

import { channels } from "@/data/twitch";

// A newly imposed ban (or an early unban) can take at most five minutes to
// propagate. Cache hits never renew this deadline, even if Redis writes lag.
const CACHE_SECONDS = 5 * 60;
const cachedBanSchema = z.strictObject({
  banned: z.boolean(),
  checkedAt: z.number().int().nonnegative(),
  validUntil: z.number().int().nonnegative(),
});
const inFlight = new Map<string, Promise<boolean>>();

async function bestEffortCache<T>(operation: () => Promise<T>) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation(),
      new Promise<undefined>((resolve) => {
        timer = setTimeout(() => resolve(undefined), 500);
      }),
    ]);
  } catch {
    // Redis is an optimization. Only a successful Twitch lookup can replace a
    // missing, invalid or expired entry; never interpret an outage as unbanned.
    return undefined;
  } finally {
    clearTimeout(timer);
  }
}

async function lookupBan(twitchUserId: string) {
  const redis = getRedisOptional();
  const key = `twitch:chat-ban:v1:${channels.alveus.id}:${twitchUserId}`;
  const cached = cachedBanSchema.safeParse(
    redis ? await bestEffortCache(() => redis.get(key)) : null,
  );
  const now = Date.now();
  if (
    cached.success &&
    cached.data.checkedAt <= now &&
    cached.data.validUntil > now &&
    cached.data.validUntil <= cached.data.checkedAt + CACHE_SECONDS * 1000
  )
    return cached.data.banned;

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
  if (redis && validUntil > Date.now())
    await bestEffortCache(() =>
      redis.set(
        key,
        { banned, checkedAt, validUntil },
        {
          expiry: Math.max(1, Math.ceil((validUntil - Date.now()) / 1000)),
        },
      ),
    );
  return banned;
}

export async function isTwitchUserBanned(twitchUserId: string) {
  if (!/^[0-9]{1,32}$/.test(twitchUserId))
    throw new Error(
      "A Twitch user identity is required for chat ban verification.",
    );
  const existing = inFlight.get(twitchUserId);
  if (existing) return existing;
  const pending = lookupBan(twitchUserId).finally(() =>
    inFlight.delete(twitchUserId),
  );
  inFlight.set(twitchUserId, pending);
  return pending;
}

export async function isPresetUserBanned(userId: string) {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "twitch" },
    select: { providerAccountId: true },
  });
  if (!account) throw new Error("No Twitch identity found for preset user.");
  return isTwitchUserBanned(account.providerAccountId);
}
