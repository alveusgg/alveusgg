import { createManagerProxy } from "@conservation-stream/mtx-manager";
import { Hono } from "hono";
import { accountWithRoles } from "../middleware/alveus";
import type { MTX } from "../services/mtx/setup";

const streams = new Hono<{ Bindings: Env }>()
  .use(accountWithRoles("ptzControl"))
  .get("/:path", async (c) => {
    const path = c.req.param("path");
    if (!path) throw new Error("Path is required");
    const stub = c.env.MTX_MANAGER.getByName("singleton");
    const proxy = createManagerProxy<MTX>(stub.dispatch);
    const signed = await proxy.dynamic.getPlaybackDetailsForPath(path);
    return c.json(signed);
  })
  .post("/:path/bitrate", async (c) => {
    const path = c.req.param("path");
    if (!path) throw new Error("Path is required");
    const body = await c.req.json();
    const bitrate = body.bitrate;
    if (!bitrate) throw new Error("Bitrate is required");

    const stub = c.env.MTX_MANAGER.getByName("singleton");
    const proxy = createManagerProxy<MTX>(stub.dispatch);
    await proxy.dynamic.updateBitrateForPath(path, bitrate);

    return c.json({ success: true });
  });

export default streams;
