import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  cameraSchema,
  captureSchema,
  commandSchema,
} from "@/server/presets/schema";
import {
  commandPreset,
  commitPresetCapture,
  completePresetOperation,
  getPresetOperation,
  pendingPresetOperations,
  preparePresetCapture,
  presetCatalog,
  presetLayout,
} from "@/server/presets/service";

import { resolveControlCamera } from "@/data/tech/camera-identifiers";

import { publicProcedure, router, sharedKeyProcedure } from "../trpc";

export const presetsRouter = router({
  command: sharedKeyProcedure.input(commandSchema).mutation(({ input }) => {
    const camera = resolveControlCamera(input.camera);
    if (!camera)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Unknown control camera",
      });
    return commandPreset({ ...input, camera });
  }),
  operation: sharedKeyProcedure
    .input(z.object({ id: z.uuid() }))
    .query(({ input }) => getPresetOperation(input.id)),
  pending: sharedKeyProcedure
    .input(
      z
        .object({
          after: z
            .object({ createdAt: z.iso.datetime(), id: z.uuid() })
            .optional(),
        })
        .optional(),
    )
    .query(({ input }) => pendingPresetOperations(input?.after)),
  prepareCapture: sharedKeyProcedure
    .input(z.object({ operationId: z.uuid(), capture: captureSchema }))
    .mutation(({ input }) =>
      preparePresetCapture(input.operationId, input.capture),
    ),
  commitCapture: sharedKeyProcedure
    .input(z.object({ operationId: z.uuid(), captureId: z.uuid() }))
    .mutation(({ input }) =>
      commitPresetCapture(input.operationId, input.captureId),
    ),
  complete: sharedKeyProcedure
    .input(
      z.object({
        id: z.uuid(),
        status: z.enum(["completed", "failed"]),
        error: z.string().max(2000).optional(),
        result: z.json().optional(),
      }),
    )
    .mutation(({ input }) => completePresetOperation(input)),
  catalog: publicProcedure
    .input(
      z
        .object({
          camera: z
            .string()
            .regex(/^(?:legacy:)?[a-z0-9_-]{1,100}$/)
            .optional(),
        })
        .optional(),
    )
    .query(({ input }) =>
      presetCatalog(
        input?.camera
          ? (resolveControlCamera(input.camera) ?? input.camera)
          : undefined,
      ),
    ),
  layout: publicProcedure
    .input(z.object({ camera: cameraSchema }))
    .query(({ input }) => presetLayout(input.camera)),
});
