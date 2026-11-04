import { type Duration, Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { NextApiRequest } from "next";

import { env } from "@/env";

export async function limit(
  identifier: string,
  tokens: number = 2,
  window: Duration = "5 m",
) {
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    return true;
  }

  const ratelimit = new Ratelimit({
    redis: new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    }),
    limiter: Ratelimit.slidingWindow(tokens, window),
  });

  return (await ratelimit.limit(identifier)).success;
}

/**
 * The client's IP address to rate limit by: the first entry of
 * x-forwarded-for (set by Vercel), or the socket address without a proxy.
 */
export function getClientIp(req: NextApiRequest) {
  const forwardedFor = req.headers["x-forwarded-for"];
  const first = (
    Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor
  )?.split(",")[0];
  return first?.trim() || req.socket.remoteAddress;
}
