import { z } from "zod";

import { createTokenProtectedApiHandler } from "@/server/utils/api";
import { callEndpoint } from "@/server/utils/queue";
import { prisma } from "@/server/db/client";

import type { SendPushOptions } from "@/pages/api/notifications/send-push";

export type CreatePushesOptions = z.infer<typeof createPushesSchema>;

const createPushesSchema = z.object({
  notificationId: z.string().cuid(),
  expiresAt: z.number(),
  subscriptionIds: z.array(z.string().cuid()),
});

export default createTokenProtectedApiHandler(
  createPushesSchema,
  async (options) => {
    try {
      const notification = await prisma.notification.findUnique({
        where: { id: options.notificationId },
      });

      if (!notification) {
        return false;
      }

      const calls: Array<Promise<Response>> = [];
      options.subscriptionIds.forEach((subscriptionId) => {
        calls.push(
          callEndpoint<SendPushOptions>("/api/notifications/send-push", {
            message: notification.message,
            notificationId: notification.id,
            subscriptionId: subscriptionId,
            expiresAt: options.expiresAt,
            urgency: notification.urgency,
            tag: notification.tag || undefined,
            title: notification.title || undefined,
            imageUrl: notification.imageUrl || undefined,
          })
        );
      });

      await Promise.allSettled(calls);

      return true;
    } catch (e) {
      console.error("Failed to create notification", e);
      return false;
    }
  }
);
