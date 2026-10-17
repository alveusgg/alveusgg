import { DurableObject, env } from "cloudflare:workers";

// A single instance (`getByName("default")`) that only forwards requests for
// now: it doesn't queue camera commands or store anything yet. Live camera
// state will live here.
export class CamControllerDurableObject extends DurableObject {
  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
  }

  // Callers use `stub.fetch()` rather than calling the RPC method directly: a
  // request body sent over JS RPC fails with "ReadableStream received over RPC
  // disconnected prematurely" once the call returns.
  async fetch(request: Request) {
    return this.dangerouslyForwardFetch(request);
  }

  async dangerouslyForwardFetch(request: Request) {
    // The VPC service only exposes HTTP; the URL also supplies its Host header.
    const url = new URL(request.url);
    url.protocol = "http:";
    url.hostname = "control-api";
    url.port = "";

    const forwardedRequest = new Request(url, request);
    forwardedRequest.headers.set("Host", url.host);
    forwardedRequest.headers.set(
      "Authorization",
      `ApiKey ${env.CONTROL_API_TOKEN}`,
    );

    return await env.CONTROL_API.fetch(forwardedRequest);
  }
}
