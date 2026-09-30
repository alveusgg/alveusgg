import { DurableObject, env } from "cloudflare:workers";

export class CamControllerDurableObject extends DurableObject {
  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
  }

  async dangerouslyForwardFetch(request: Request) {
    const headers = new Headers(request.headers);
    headers.set("Authorization", `ApiKey ${env.CONTROL_API_TOKEN}`);
    const forwardedRequest = new Request(request, { headers });

    const start = performance.now();
    const response = await env.CONTROL_API.fetch(forwardedRequest);
    const duration = performance.now() - start;

    const timedResponse = new Response(response.body, response);
    timedResponse.headers.append(
      "Server-Timing",
      `control_api;dur=${duration.toFixed(2)};desc="Control API"`,
    );
    return timedResponse;
  }
}
