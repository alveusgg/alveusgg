import type { Context } from "hono";
import { routePath } from "hono/route";

export function forwardWithoutRoutePrefix(context: Context) {
  const route = routePath(context);
  const prefix = route.replace(/\/?\*+$/, "");
  const suffix = context.req.path.slice(prefix.length) || "/";

  const url = new URL(context.req.raw.url);
  url.pathname = suffix;

  const copied = context.req.raw.clone();

  const init: RequestInit = {
    method: copied.method,
    headers: copied.headers,
    body: copied.body,
  };

  return new Request(url, init);
}
