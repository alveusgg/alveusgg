import { notificationCategories } from "@/config/notifications";
import { pushBatchSize, pushMaxAttempts, pushRetryDelay } from "@/config/push";

import { prisma } from "@/server/db/client";
import { callEndpoint } from "@/server/utils/queue";

import type { CreatePushesOptions } from "@/pages/api/notifications/batched-create-notification-pushes";
import type { RetryPushesOptions } from "@/pages/api/notifications/batched-retry-notification-pushes";

const exponentialDelays = new Array(pushMaxAttempts + 1)
  .fill(0)
  .map((_, i) => pushRetryDelay * Math.pow(2, i));

export async function createNotification(data: {
  tag: string;
  text?: string;
  linkUrl?: string;
  title?: string;
  imageUrl?: string;
  scheduledStartAt?: Date | null;
  scheduledEndAt?: Date | null;
}) {
  const tagConfig = notificationCategories.find((cat) => cat.tag === data.tag);
  if (tagConfig === undefined) {
    throw Error("Notification tag unknown!");
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + tagConfig.ttl * 1000);
  const notification = await prisma.notification.create({
    data: {
      title: data.title,
      expiresAt: expiresAt,
      message: data.text || "",
      linkUrl: data.linkUrl,
      imageUrl: data.imageUrl || null,
      tag: data.tag,
      urgency: tagConfig.urgency,
      scheduledStartAt: data.scheduledStartAt || null,
      scheduledEndAt: data.scheduledEndAt || null,
    },
  });

  // Get subscriptions in batches and delegate them to separate workers
  const requests = [];
  let i = 0;
  while (true) {
    const subscriptions = await prisma.pushSubscription.findMany({
      select: { id: true },
      where: {
        deletedAt: null,
        p256dh: { not: { equals: null } },
        auth: { not: { equals: null } },
        tags: {
          some: {
            name: data.tag,
            value: "1",
          },
        },
      },
      take: pushBatchSize,
      skip: pushBatchSize * i++,
    });

    if (subscriptions.length === 0) {
      break;
    }

    requests.push(
      callEndpoint<CreatePushesOptions>(
        `/api/notifications/batched-create-notification-pushes`,
        {
          notificationId: notification.id,
          expiresAt: expiresAt.getTime(),
          subscriptionIds: subscriptions.map((s) => s.id),
        }
      )
    );
  }

  await Promise.allSettled(requests);
}

export async function retryPendingNotificationPushes() {
  const requests = [];
  let i = 0;
  const now = new Date();
  while (true) {
    const pendingPushes = await prisma.notificationPush.findMany({
      select: {
        notificationId: true,
        subscriptionId: true,
        expiresAt: true,
        attempts: true,
      },
      where: {
        processingStatus: "PENDING",
        expiresAt: { gte: now },
        OR: exponentialDelays
          .slice(1) // skipping initial one. that should be handled by sendNotification
          .map((delay, attempts) => ({
            attempts: attempts,
            failedAt: { lte: new Date(now.getTime() - delay) },
          })),
      },
      take: pushBatchSize,
      skip: pushBatchSize * i++,
    });

    if (pendingPushes.length === 0) {
      break;
    }

    requests.push(
      callEndpoint<RetryPushesOptions>(
        `/api/notifications/batched-retry-notification-pushes`,
        {
          pushes: pendingPushes.map((push) => ({
            ...push,
            expiresAt: push.expiresAt.getTime(),
          })),
        }
      )
    );
  }

  await Promise.allSettled(requests);
}
