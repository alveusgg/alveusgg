import { notificationCategories } from "@/config/notifications";

import { prisma } from "@/server/db/client";
import { callEndpoint } from "@/server/utils/queue";

import type { CreatePushesOptions } from "@/pages/api/notifications/batched-create-notification-pushes";
import type { RetryPushesOptions } from "@/pages/api/notifications/batched-retry-notification-pushes";

const PUSH_BATCH_SIZE = 2; // TODO: make configurable? env file?
export const PUSH_MAX_ATTEMPTS = 5; // TODO: make configurable? env file?

const RETRY_DELAY = 30_000; // TODO: make configurable? env file?

const exponentialDelays = new Array(PUSH_MAX_ATTEMPTS + 1)
  .fill(0)
  .map((_, i) => RETRY_DELAY * Math.pow(2, i));

export async function createNotification(data: {
  tag: string;
  text?: string;
  url?: string;
  heading?: string;
  imageUrl?: string;
}) {
  const tagConfig = notificationCategories.find((cat) => cat.tag === data.tag);
  if (tagConfig === undefined) {
    throw Error("Notification tag unknown!");
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + tagConfig.ttl * 1000);
  const notification = await prisma.notification.create({
    data: {
      title: data.heading,
      expiresAt: expiresAt,
      message: data.text || "",
      linkUrl: data.url,
      imageUrl: data.imageUrl,
      tag: data.tag,
      urgency: tagConfig.urgency,
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
      take: PUSH_BATCH_SIZE,
      skip: PUSH_BATCH_SIZE * i++,
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
      take: PUSH_BATCH_SIZE,
      skip: PUSH_BATCH_SIZE * i++,
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
