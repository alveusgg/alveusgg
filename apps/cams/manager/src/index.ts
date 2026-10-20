import { exports } from "cloudflare:workers";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { z } from "zod";
import { requireRole } from "./utils/auth.ts";
import { forwardWithoutRoutePrefix } from "./utils/url.ts";
export { CamControllerDurableObject } from "./cams/controller.ts";

const app = new Hono<{ Bindings: Env }>()
  // Cross-origin browser access is intentionally disabled.
  .use("*", cors({ origin: [] }))
  .post(
    "/presets/jobs",
    requireRole("ptzControl", { subject: "service:presets" }),
    async (c) => {
      const parsed = z
        .object({ operationId: z.uuid() })
        .safeParse(await c.req.json().catch(() => null));
      if (!parsed.success)
        return c.json({ error: "Invalid operation ID." }, 400);
      const controller =
        exports.CamControllerDurableObject.getByName("default");
      await controller.enqueuePresetJob(parsed.data.operationId);
      return c.json({ accepted: true }, 202);
    },
  )
  .all("/direct/*", requireRole("ptzControl"), (c) => {
    const controller = exports.CamControllerDurableObject.getByName("default");
    const request = forwardWithoutRoutePrefix(c);
    return controller.fetch(request);
  });

export default {
  fetch: app.fetch,
  async scheduled() {
    const controller = exports.CamControllerDurableObject.getByName("default");
    await controller.reconcilePresetJobs();
  },
} satisfies ExportedHandler<Env>;
