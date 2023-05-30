import { z } from "zod";
import type { Notification } from "@prisma/client";

import { createTokenProtectedApiHandler } from "@/server/utils/api";
import { callEndpoint } from "@/server/utils/queue";
import { prisma } from "@/server/db/client";
import type { SendPushOptions } from "@/pages/api/notifications/send-push";
import { PUSH_MAX_ATTEMPTS } from "@/server/notifications";

export type RetryPushesOptions = z.infer<typeof retryPushesSchema>;

const retryPushesSchema = z.object({
  pushes: z.array(
    z.object({
      attempts: z.number().nullable(),
      notificationId: z.string().cuid(),
      subscriptionId: z.string().cuid(),
      expiresAt: z.number(),
    })
  ),
});

export default createTokenProtectedApiHandler(
  retryPushesSchema,
  async (options) => {
    try {
      const notificationIds = [
        ...new Set(options.pushes.map((push) => push.notificationId)),
      ];
      const notifications = await prisma.notification.findMany({
        where: { id: { in: notificationIds } },
      });

      const notificationMap = new Map<string, Notification>(
        notifications.map((notification) => [notification.id, notification])
      );

      const calls: Array<Promise<Response>> = [];
      options.pushes.forEach((push) => {
        if (
          !push.attempts ||
          push.attempts === 0 ||
          push.attempts >= PUSH_MAX_ATTEMPTS
        )
          return;

        const notification = notificationMap.get(push.notificationId);
        if (!notification) return;

        calls.push(
          callEndpoint<SendPushOptions>("/api/notifications/send-push", {
            attempt: push.attempts + 1,
            message: notification.message,
            notificationId: notification.id,
            subscriptionId: push.subscriptionId,
            expiresAt: push.expiresAt,
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
