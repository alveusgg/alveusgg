import type { Context } from "hono";
import * as Sentry from "@sentry/cloudflare";

export const createSharedKeyMiddleware = (sharedKey: string) => {
  return async (ctx: Context, next: () => Promise<void>) => {
    const header = ctx.req.header("authorization");
    const [type, key] = header?.split(" ") ?? [];
    if (type !== "ApiKey" || key !== sharedKey) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }
    return next();
  };
};

export const setSentryTagsMiddleware = (
  ctx: Context,
  next: () => Promise<void>,
) => {
  Sentry.setTags({
    requestId: crypto.randomUUID(),
    userAgent: ctx.req.header("user-agent"),
    ray: ctx.req.header("cf-ray"),
    country: ctx.req.raw.cf?.country as string | undefined,
    colo: ctx.req.raw.cf?.colo as string | undefined,
  });

  return next();
};
