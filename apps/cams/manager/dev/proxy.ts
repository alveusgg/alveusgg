// Hard-coded destinations: neither request headers nor environment variables can
// select another host/port. Manual redirects also prevent an upstream redirect
// from turning this into a route to the rack.
export function proxy(request: Request, port: 1229 | 3130) {
  const url = new URL(request.url);
  url.protocol = "http:";
  url.hostname = "127.0.0.1";
  url.port = String(port);
  const forwarded = new Request(url, request);
  forwarded.headers.set("Host", url.host);
  return fetch(forwarded, { redirect: "manual" });
}
