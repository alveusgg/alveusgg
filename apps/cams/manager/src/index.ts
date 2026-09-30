import { exports } from "cloudflare:workers";
import { Hono } from "hono";
import { requireRole } from "./utils/auth.ts";
import { forwardWithoutRoutePrefix } from "./utils/url.ts";
export { CamControllerDurableObject } from "./cams/controller.ts";

const app = new Hono<{ Bindings: Env }>().all(
  "/direct/*",
  requireRole("ptzControl"),
  (c) => {
    const controller = exports.CamControllerDurableObject.getByName("default");
    const request = forwardWithoutRoutePrefix(c);
    return controller.dangerouslyForwardFetch(request);
  },
);

export default app satisfies ExportedHandler<Env>;
