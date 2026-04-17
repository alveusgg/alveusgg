import { createManagerProxy } from "@conservation-stream/mtx-manager";
import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import { z } from "zod";
import { accountWithRoles } from "../middleware/alveus";
import type { MTX } from "../services/mtx/setup";

const recording = new Hono<{ Bindings: Env }>();

const RecordingClipBodySchema = z.object({
  startDate: z.iso.datetime(),
  duration: z.number().positive(),

  uploadInfo: z.object({
    type: z.literal("s3"),
    signedUrl: z.string(),
  }),
});

export default recording.post(
  "/:path/clip",
  accountWithRoles("ptzControl"),
  sValidator("json", RecordingClipBodySchema),
  async (c) => {
    const path = c.req.param("path");
    if (!path) throw new Error("Path is required");

    const body = c.req.valid("json");

    const stub = c.env.MTX_MANAGER.getByName("singleton");
    const proxy = createManagerProxy<MTX>(stub.dispatch);

    try {
      await proxy.recording.request({
        path,
        uploadInfo: body.uploadInfo,
        startDate: body.startDate,
        duration: body.duration,
      });
      return c.json({ success: true });
    } catch {
      return c.json({ error: "Failed to request recording" }, 500);
    }
  },
);
