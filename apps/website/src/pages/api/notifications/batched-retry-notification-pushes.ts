import { waitUntil } from "@vercel/functions";
import { z } from "zod";

import { type Notification, prisma } from "@alveusgg/database";

import { env } from "@/env";

import { updateNotificationPushStatus } from "@/server/db/notifications";
import { createTokenProtectedApiHandler } from "@/server/utils/api";
import { callEndpoint } from "@/server/utils/queue";

import type { SendPushOptions } from "@/pages/api/notifications/send-push";

export const config = {
  maxDuration: 60, // 60 Seconds is the maximum duration allowed in Hobby Plan
};

export type RetryPushesOptions = z.infer<typeof retryPushesSchema>;

const retryPushesSchema = z.object({
  pushes: z.array(
    z.object({
      attempts: z.number().nullable(),
      notificationId: z.cuid(),
      subscriptionId: z.cuid(),
      expiresAt: z.number(),
    }),
  ),
});

async function getNotificationMapForPushes(
  pushes: RetryPushesOptions["pushes"],
) {
  const notificationIds = [
    ...new Set(pushes.map((push) => push.notificationId)),
  ];
  const notifications = await prisma.notification.findMany({
    where: {
      id: { in: notificationIds },
      canceledAt: null,
      expiresAt: { gt: new Date() },
    },
  });
  return new Map<string, Notification>(
    notifications.map((notification) => [notification.id, notification]),
  );
}

function isPushRetry<T extends { attempts: number | null }>(
  push: T,
): push is T & { attempts: number } {
  return (
    push.attempts !== null &&
    push.attempts > 0 &&
    push.attempts < env.PUSH_MAX_ATTEMPTS
  );
}

export default createTokenProtectedApiHandler(
  retryPushesSchema,
  async (options) => {
    try {
      const tasks: Array<Promise<unknown>> = [];

      const pushRetries = options.pushes.filter(isPushRetry);
      const notificationMap = await getNotificationMapForPushes(pushRetries);

      pushRetries.forEach((push) => {
        const notification = notificationMap.get(push.notificationId);
        if (!notification) {
          tasks.push(
            updateNotificationPushStatus({
              notificationId: push.notificationId,
              subscriptionId: push.subscriptionId,
              processingStatus: "DONE",
              failedAt: new Date(),
            }),
          );
          return;
        }

        tasks.push(
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
          }),
        );
      });

      waitUntil(Promise.allSettled(tasks));

      return true;
    } catch (e) {
      console.error("Failed to create notification", e);
      return false;
    }
  },
);
