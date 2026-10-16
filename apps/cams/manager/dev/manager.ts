import app from "../src/index.ts";
export { CamControllerDurableObject } from "../src/index.ts";

type MockEnv = Env & { EVENTS: Fetcher };

export default {
  fetch(request: Request, env: MockEnv, ctx: ExecutionContext) {
    const url = new URL(request.url);
    if (url.pathname === "/__mock/health") {
      return Response.json({ mode: "local-mock", rest: 1229, events: 3130 });
    }
    // Development-only probe for the future upstream EVENTS binding. It is not
    // part of the real manager entry point or its public event protocol.
    if (url.pathname === "/__mock/events") {
      const upstream = new URL("http://control-api/");
      if (url.searchParams.get("authenticated") !== "false") {
        upstream.searchParams.set("authorization", "ApiKey mock");
      }
      return env.EVENTS.fetch(upstream, {
        headers: { Upgrade: "websocket", Host: "control-api" },
      });
    }
    return app.fetch(request, env, ctx);
  },
} satisfies ExportedHandler<MockEnv>;
