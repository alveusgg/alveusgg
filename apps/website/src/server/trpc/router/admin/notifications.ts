import { z } from "zod";
import {
  createCheckPermissionMiddleware,
  protectedProcedure,
  router,
} from "@/server/trpc/trpc";
import { createNotification } from "@/server/notifications";
import { permissions } from "@/config/permissions";
import { allowedFileTypes } from "@/components/show-and-tell/ShowAndTellEntryForm";
import { createFileStorageUpload } from "@/server/utils/file-storage";
import { env } from "@/env/server.mjs";
import { getRecentNotifications } from "@/server/db/notifications";
import { prisma } from "@/server/db/client";

const uploadPrefix = "notifications/";

const permittedProcedure = protectedProcedure.use(
  createCheckPermissionMiddleware(permissions.manageNotifications)
);

export const adminNotificationsRouter = router({
  sendNotification: permittedProcedure
    .input(
      z.object({
        tag: z.string().min(2).max(100),
        text: z.string().max(200).optional(),
        heading: z.string(),
        url: z.string().url(),
        imageUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ input }) => createNotification(input)),

  getStats: permittedProcedure.query(async () => {
    const [totalNotifications, totalPushes, totalSubscriptions, pendingPushes] =
      await Promise.all([
        prisma.notification.count(),
        prisma.notificationPush.count(),
        prisma.pushSubscription.count({
          where: { deletedAt: null },
        }),
        prisma.notificationPush.count({
          where: { deliveredAt: null },
        }),
      ]);

    return {
      totalNotifications,
      totalPushes,
      totalSubscriptions,
      pendingPushes,
    };
  }),

  getRecentNotifications: permittedProcedure.query(async () =>
    getRecentNotifications({ take: 10 })
  ),

  createFileUpload: permittedProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileType: z.enum(allowedFileTypes),
      })
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
