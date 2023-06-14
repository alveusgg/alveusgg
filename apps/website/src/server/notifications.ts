import type { Notification } from "@prisma/client";

import { env } from "@/env/index.mjs";

import {
  defaultTag,
  defaultTitle,
  notificationCategories,
} from "@/config/notifications";
import { pushBatchSize, pushMaxAttempts, pushRetryDelay } from "@/config/push";

import { prisma } from "@/server/db/client";
import { callEndpoint } from "@/server/utils/queue";

import type { CreatePushesOptions } from "@/pages/api/notifications/batched-create-notification-pushes";
import type { RetryPushesOptions } from "@/pages/api/notifications/batched-retry-notification-pushes";
import { triggerDiscordChannelWebhookToEveryone } from "@/server/discord";

type CreateNotificationData = {
  tag: string;
  text?: string;
  linkUrl?: string;
  title?: string;
  imageUrl?: string;
  scheduledStartAt?: Date | null;
  scheduledEndAt?: Date | null;
  isPush?: boolean;
  isDiscord?: boolean;
};

const exponentialDelays = new Array(pushMaxAttempts + 1)
  .fill(0)
  .map((_, i) => pushRetryDelay * Math.pow(2, i));

export async function createNotification(data: CreateNotificationData) {
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
      isPush: data.isPush || false,
      isDiscord: data.isDiscord || false,
    },
  });

  const tasks = [];

  if (notification.isPush) {
    tasks.push(createPushNotifications(notification));
  }

  if (notification.isDiscord) {
    tasks.push(createDiscordNotifications(notification));
  }

  await Promise.all(tasks);
}

export async function resendNotification(notificationId: string) {
  const oldNotification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!oldNotification) return;

  return createNotification({
    tag: oldNotification.tag || defaultTag,
    title: oldNotification.title || defaultTitle,
    imageUrl: oldNotification.imageUrl || undefined,
    linkUrl: oldNotification.linkUrl || undefined,
    text: oldNotification.message,
    scheduledEndAt: oldNotification.scheduledEndAt,
    scheduledStartAt: oldNotification.scheduledStartAt,
    isPush: oldNotification.isPush,
    isDiscord: oldNotification.isDiscord,
  });
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
          .slice(1) // skipping initial one. that should be handled by createNotification
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

async function createPushNotifications(notification: Notification) {
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
        tags: notification.tag
          ? {
              some: {
                name: notification.tag,
                value: "1",
              },
            }
          : undefined,
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
          expiresAt: notification.expiresAt.getTime(),
          subscriptionIds: subscriptions.map((s) => s.id),
        }
      )
    );
  }

  return Promise.allSettled(requests);
}

async function createDiscordNotifications(notification: Notification) {
  let webhookUrls: string[] = [];
  switch (notification.tag) {
    case "stream":
      webhookUrls =
        env.DISCORD_CHANNEL_WEBHOOK_URLS_STREAM_NOTIFICATION || webhookUrls;
      break;
    case "announcement":
      webhookUrls =
        env.DISCORD_CHANNEL_WEBHOOK_URLS_ANNOUNCEMENT || webhookUrls;
      break;
    default:
  }

  const tasks = [];
  for (const webhookUrl of webhookUrls) {
    const relativeNotificationUrl = `/notifications/${notification.id}`;
    const fullAbsoluteNotificationUrl = new URL(
      relativeNotificationUrl,
      env.NEXT_PUBLIC_BASE_URL
    ).toString();
    const content = `${notification.title}\n${notification.message}\n${fullAbsoluteNotificationUrl}`;

    tasks.push(
      triggerDiscordChannelWebhookToEveryone({ content, webhookUrl }).then(
        async (webhook) => {
          await prisma.notificationDiscordChannelWebhook.create({
            data: {
              notificationId: notification.id,
              outgoingWebhookId: webhook.id,
            },
          });
          return webhook;
        }
      )
    );
  }

  return Promise.all(tasks);
}
