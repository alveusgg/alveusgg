import { z } from "zod";
import {
  createCheckPermissionMiddleware,
  protectedProcedure,
  router,
} from "@/server/trpc/trpc";
import { createNotification } from "@/server/actions/notifications/create-notification";
import { permissions } from "@/config/permissions";
import { allowedFileTypes } from "@/components/show-and-tell/ShowAndTellEntryForm";
import { createFileStorageUpload } from "@/server/utils/file-storage";
import { env } from "@/env/server.mjs";

const uploadPrefix = "notifications/";

const permittedProcedure = protectedProcedure.use(
  createCheckPermissionMiddleware(permissions.manageNotifications)
);

export const adminNotificationsRouter = router({
  sendNotification: permittedProcedure
    .input(
      z.object({
        tag: z.string().min(2).max(100),
        text: z.string().min(2).max(200),
        heading: z.string(),
        url: z.string().url(),
        imageUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ input }) => createNotification(input)),

  getStats: permittedProcedure.query(async ({ ctx }) => {
    const totalNotifications = await ctx.prisma.notification.count();
    const totalPushes = await ctx.prisma.notificationPush.count();
    const pendingPushes = await ctx.prisma.notificationPush.count({
      where: { deliveredAt: null },
    });

    return {
      totalNotifications,
      totalPushes,
      pendingPushes,
    };
  }),

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
