import * as Sentry from "@sentry/cloudflare";
import { createMiddleware } from "hono/factory";

export const createSharedKeyMiddleware = (sharedKey: string) =>
  createMiddleware(async (ctx, next) => {
    const header = ctx.req.header("authorization");
    const [type, key] = header?.split(" ") ?? [];
    if (type !== "ApiKey" || key !== sharedKey) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }
    await next();
  });

export const setSentryTagsMiddleware = () =>
  createMiddleware(async (ctx, next) => {
    Sentry.setTags({
      requestId: crypto.randomUUID(),
      userAgent: ctx.req.header("user-agent"),
      ray: ctx.req.header("cf-ray"),
      country: ctx.req.raw.cf?.country as string | undefined,
      colo: ctx.req.raw.cf?.colo as string | undefined,
    });

    await next();
  });
