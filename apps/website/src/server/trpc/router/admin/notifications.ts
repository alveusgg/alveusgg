import { TRPCError } from "@trpc/server";
import { waitUntil } from "@vercel/functions";
import { z } from "zod";

import { prisma } from "@alveusgg/database";

import { env } from "@/env";

import {
  cancelNotification,
  getRecentNotifications,
} from "@/server/db/notifications";
import {
  copyNotification,
  createNotification,
  sendNotification,
} from "@/server/notifications";
import {
  createCheckPermissionMiddleware,
  protectedProcedure,
  router,
} from "@/server/trpc/trpc";
import {
  checkAndFixUploadedImageFileStorageObject,
  createFileStorageUpload,
} from "@/server/utils/file-storage";

import { permissions } from "@/data/permissions";

import { inputValueDatetimeLocalToUtc } from "@/utils/datetime-local";
import { imageMimeTypes } from "@/utils/files";

const uploadPrefix = "notifications/";

const permittedProcedure = protectedProcedure.use(
  createCheckPermissionMiddleware(permissions.manageNotifications),
);

const localDatetimeAsDateSchema = z
  .string()
  .regex(/\d\d\d\d-\d\d-\d\dT\d\d:\d\d/)
  .transform((str) => (str ? inputValueDatetimeLocalToUtc(str) : null));

export const adminNotificationsRouter = router({
  createNotification: permittedProcedure
    .input(
      z.object({
        tag: z.string().min(2).max(100),
        text: z.string().max(200).optional(),
        title: z.string(),
        linkUrl: z.union([z.literal(""), z.string().trim().url()]).optional(),
        imageUrl: z.url().optional(),
        vodUrl: z.url().optional(),
        scheduledStartAt: localDatetimeAsDateSchema.optional(),
        scheduledEndAt: localDatetimeAsDateSchema.optional(),
        fileStorageObjectId: z.cuid().optional(),
        isPush: z.boolean().optional(),
        isDiscord: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      // Check if the file storage object is valid
      if (input.fileStorageObjectId) {
        const { error } = await checkAndFixUploadedImageFileStorageObject(
          input.fileStorageObjectId,
        );
        if (error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Error checking file storage object: ${error}`,
          });
        }
      }

      const notification = await createNotification(input);
      waitUntil(sendNotification(notification));
    }),

  getStats: permittedProcedure.query(async () => {
    const [totalNotifications, totalPushes, totalSubscriptions, pendingPushes] =
      await Promise.all([
        prisma.notification.count(),
        prisma.notificationPush.count(),
        prisma.pushSubscription.count({
          where: { deletedAt: null },
        }),
        prisma.notificationPush.count({
          where: { processingStatus: "PENDING" },
        }),
      ]);

    return {
      totalNotifications,
      totalPushes,
      totalSubscriptions,
      pendingPushes,
    };
  }),

  getRecentNotifications: permittedProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).optional(),
        cursor: z.cuid().optional(),
      }),
    )
    .query(async ({ input: { limit, cursor } }) =>
      getRecentNotifications({ limit, cursor }),
    ),

  cancelNotification: permittedProcedure
    .input(z.cuid())
    .mutation(async ({ input }) => cancelNotification(input)),

  resendNotification: permittedProcedure
    .input(z.cuid())
    .mutation(async ({ input }) => {
      const notification = await copyNotification(input);
      if (notification) {
        waitUntil(sendNotification(notification));
        return true;
      }

      return false;
    }),

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
