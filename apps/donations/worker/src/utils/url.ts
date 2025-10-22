import type { Context } from "hono";
import { routePath } from "hono/route";

export function forwardWithoutRoutePrefix(context: Context) {
  const wildcard = routePath(context, 0);
  const rootRoute = routePath(context, 1);

  const prefix = rootRoute.replace(wildcard, "");
  const suffix = context.req.path.replace(prefix, "");

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
