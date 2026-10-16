import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  authorizePresetAction,
  authorizeSubscriberControl,
  canManagePresets,
  presetAccess,
} from "@/server/presets/access";
import {
  authorizeChatPresetAction,
  chatActorSchema,
  ownedChatOperation,
  requireChatbotPresetKey,
  resolveChatActor,
} from "@/server/presets/chat";
import { setSubscriberPolicy } from "@/server/presets/policy";
import {
  cameraSchema,
  captureSchema,
  userCommandSchema,
} from "@/server/presets/schema";
import {
  commandPreset,
  commitPresetCapture,
  completePresetOperation,
  findPresetOperationForUser,
  getPresetOperation,
  pendingPresetOperations,
  preparePresetCapture,
  presetCatalog,
  presetLayout,
} from "@/server/presets/service";

import { resolveControlCamera } from "@/data/tech/camera-identifiers";

import {
  protectedProcedure,
  publicProcedure,
  router,
  sharedKeyProcedure,
} from "../trpc";

const chatbotPresetProcedure = publicProcedure.use(({ ctx, next }) => {
  requireChatbotPresetKey(ctx.req.headers.authorization);
  return next();
});

export const presetsRouter = router({
  chatCommand: chatbotPresetProcedure
    .input(
      z.strictObject({ command: userCommandSchema, actor: chatActorSchema }),
    )
    .mutation(async ({ ctx, input }) => {
      const camera = resolveControlCamera(input.command.camera);
      if (!camera)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Unknown control camera",
        });
      const actor = await resolveChatActor(input.actor);
      const existing = await ownedChatOperation(input.command.id, actor);
      const authorization = existing
        ? undefined
        : await authorizeChatPresetAction(actor, input.command.action, camera);
      try {
        return await commandPreset(
          {
            ...input.command,
            camera,
            actor: {
              id: existing?.actor.id ?? actor.id,
              ...(actor.name ? { name: actor.name } : {}),
            },
            ...(authorization ? { authorization } : {}),
          },
          { cooldownUserId: actor.id },
        );
      } catch (error) {
        if (error instanceof TRPCError && error.code === "TOO_MANY_REQUESTS")
          ctx.res.setHeader("Retry-After", "2");
        throw error;
      }
    }),
  chatOperation: chatbotPresetProcedure
    .input(
      z.strictObject({
        id: z.uuid(),
        actor: chatActorSchema.pick({ twitchUserId: true }),
      }),
    )
    .query(async ({ input }) => {
      const actor = await resolveChatActor(input.actor);
      const operation = await ownedChatOperation(input.id, actor);
      if (!operation)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Preset operation not found",
        });
      return operation;
    }),
  setSubscriberControl: protectedProcedure
    .input(
      z.strictObject({
        camera: cameraSchema.optional(),
        paused: z.boolean(),
        resumeAt: z.iso.datetime().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await authorizeSubscriberControl(ctx.session, input.paused);
      const camera = input.camera
        ? resolveControlCamera(input.camera)
        : undefined;
      if (input.camera && !camera)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Unknown control camera",
        });
      return setSubscriberPolicy({ ...input, camera }, ctx.session.user.id);
    }),
  access: publicProcedure.query(({ ctx }) => presetAccess(ctx.session)),
  userCommand: protectedProcedure
    .input(userCommandSchema)
    .mutation(async ({ ctx, input }) => {
      const camera = resolveControlCamera(input.camera);
      if (!camera)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Unknown control camera",
        });
      const existing = await findPresetOperationForUser(
        input.id,
        ctx.session.user.id,
      );
      const authorization = existing
        ? undefined
        : await authorizePresetAction(ctx.session, input.action, camera);
      try {
        return await commandPreset(
          {
            ...input,
            camera,
            ...(authorization ? { authorization } : {}),
            actor: {
              id: ctx.session.user.id,
              ...(ctx.session.user.name ? { name: ctx.session.user.name } : {}),
            },
          },
          { cooldownUserId: ctx.session.user.id },
        );
      } catch (error) {
        if (error instanceof TRPCError && error.code === "TOO_MANY_REQUESTS")
          ctx.res.setHeader("Retry-After", "2");
        throw error;
      }
    }),
  userOperation: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .query(async ({ ctx, input }) => {
      const operation = await findPresetOperationForUser(
        input.id,
        ctx.session.user.id,
        canManagePresets(ctx.session),
      );
      if (!operation)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Preset operation not found",
        });
      return operation;
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
