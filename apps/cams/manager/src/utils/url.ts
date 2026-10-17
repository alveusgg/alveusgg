import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { routePath } from "hono/route";

// The request headers the control API reads. The controller replaces
// `Authorization` with the API key; everything else (cookies, `cf-*`,
// forwarding headers) stays at the edge.
const FORWARDED_HEADERS = new Set(["accept", "content-type", "x-camera-name"]);

export function forwardWithoutRoutePrefix(context: Context) {
  const route = routePath(context);
  const prefix = route.replace(/\/?\*+$/, "");

  // Slice the raw pathname: `context.req.path` is percent-decoded, and
  // re-encoding it isn't lossless (`%5C` would come back as `/`).
  const url = new URL(context.req.url);
  if (url.pathname !== prefix && !url.pathname.startsWith(`${prefix}/`)) {
    // Hono routes on the decoded path, so this only happens when the prefix
    // itself is percent-encoded (`/%64irect/...`).
    throw new HTTPException(404);
  }
  url.pathname = url.pathname.slice(prefix.length) || "/";

  const request = new Request(url, context.req.raw);
  for (const name of [...request.headers.keys()]) {
    if (!FORWARDED_HEADERS.has(name)) request.headers.delete(name);
  }
  return request;
}
