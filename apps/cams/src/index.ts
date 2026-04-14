import { Hono } from "hono";
import { cors } from "hono/cors";
import control from "./routes/control";
import recording from "./routes/recording";
import streams from "./routes/streams";
import { forwardWithoutRoutePrefix } from "./utils/path";

export { ControlManager } from "./routes/control";
export { MTXManager } from "./services/mtx/manager";

const app = new Hono<{ Bindings: Env }>()
  .use("*", cors())
  .route("/api/clips", recording)
  .route("/api/control", control)
  .route("/api/streams", streams)
  .all("/api/mtx/*", async (c) => {
    const stub = c.env.MTX_MANAGER.getByName("singleton");
    const request = forwardWithoutRoutePrefix(c);
    return stub.fetch(request);
  });

export default app;
