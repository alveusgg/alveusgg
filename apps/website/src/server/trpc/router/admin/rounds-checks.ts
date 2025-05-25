import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { env } from "@/env";

import {
  createRoundsCheck,
  editRoundsCheck,
  existingRoundsCheckSchema,
  moveRoundsCheck,
  roundsCheckSchema,
} from "@/server/db/rounds-checks";
import {
  createCheckPermissionMiddleware,
  protectedProcedure,
  router,
} from "@/server/trpc/trpc";
import {
  createFileStorageUpload,
  deleteFileStorageObject,
} from "@/server/utils/file-storage";

import { permissions } from "@/data/permissions";

import { imageMimeTypes } from "@/utils/files";

const uploadPrefix = "rounds-checks/";

const permittedProcedure = protectedProcedure.use(
  createCheckPermissionMiddleware(permissions.manageRoundsChecks),
);

export const adminRoundsChecksRouter = router({
  createRoundsCheck: permittedProcedure
    .input(roundsCheckSchema)
    .mutation(({ input }) => createRoundsCheck(input)),

  editRoundsCheck: permittedProcedure
    .input(existingRoundsCheckSchema)
    .mutation(({ input }) => editRoundsCheck(input)),

  moveRoundsCheck: permittedProcedure
    .input(
      z.object({
        id: z.cuid(),
        direction: z.literal(["up", "down"]),
      }),
    )
    .mutation(async ({ input }) => {
      await moveRoundsCheck(input.id, input.direction);
    }),

  deleteRoundsCheck: permittedProcedure
    .input(z.cuid())
    .mutation(async ({ ctx, input: id }) => {
      const roundsCheck = await ctx.prisma.roundsCheck.findUnique({
        where: { id },
      });
      if (!roundsCheck) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Rounds check not found",
        });
      }

      if (roundsCheck.fileStorageObjectId) {
        await deleteFileStorageObject(roundsCheck.fileStorageObjectId);
      }
      await ctx.prisma.roundsCheck.delete({ where: { id: id } });
    }),

  getRoundsCheck: permittedProcedure
    .input(z.cuid())
    .query(({ ctx, input: id }) =>
      ctx.prisma.roundsCheck.findUnique({ where: { id } }),
    ),

  getRoundsChecks: permittedProcedure.query(({ ctx }) =>
    ctx.prisma.roundsCheck.findMany({ orderBy: { order: "asc" } }),
  ),

  createFileUpload: permittedProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileType: z.literal(imageMimeTypes),
      }),
    )
    .mutation(async ({ input }) => {
      const { uploadUrl, viewUrl, fileStorageObject } =
        await createFileStorageUpload({
          fileName: input.fileName,
          fileType: input.fileType,
          prefix: uploadPrefix,
        });

      if (env.NODE_ENV === "development") {
        /*
         * To enable uploads to DO Spaces in development, we need to proxy the request
         * through the Next.js server. This is because the DO Spaces endpoint is not
         * accessible without ssl, and Next.js does not support ssl in development.
         */

        return {
          viewUrl: String(viewUrl),
          uploadUrl: `/api/file-upload${uploadUrl.pathname}${uploadUrl.search}`,
          fileStorageObjectId: fileStorageObject.id,
        };
      }

      return {
        viewUrl: String(viewUrl),
        uploadUrl: String(uploadUrl),
        fileStorageObjectId: fileStorageObject.id,
      };
    }),
});
