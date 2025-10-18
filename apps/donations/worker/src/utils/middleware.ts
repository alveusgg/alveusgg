import type { Context } from "hono";

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
