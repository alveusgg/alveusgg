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
import { triggerDiscordChannelWebhook } from "@/server/discord";
import { escapeLinksForDiscord } from "@/utils/escape-links-for-discord";

import type { CreatePushesOptions } from "@/pages/api/notifications/batched-create-notification-pushes";
import type { RetryPushesOptions } from "@/pages/api/notifications/batched-retry-notification-pushes";

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

const exponentialDelays = new Array(pushMaxAttempts).map(
  (_, i) => pushRetryDelay * Math.pow(2, i + 1),
);

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
        OR: exponentialDelays.map((delay, attempts) => ({
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
        },
      ),
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
        },
      ),
    );
  }

  return Promise.allSettled(requests);
}

async function createDiscordNotifications({
  tag,
  id,
  title,
  message,
  expiresAt,
  linkUrl,
}: Notification) {
  let webhookUrls: string[] = [];
  let toEveryone = false;
  switch (tag) {
    case "stream":
      webhookUrls =
        env.DISCORD_CHANNEL_WEBHOOK_URLS_STREAM_NOTIFICATION || webhookUrls;
      toEveryone = env.DISCORD_CHANNEL_WEBHOOK_TO_EVERYONE_STREAM_NOTIFICATION;
      break;
    case "announcements":
      webhookUrls =
        env.DISCORD_CHANNEL_WEBHOOK_URLS_ANNOUNCEMENT || webhookUrls;
      toEveryone = env.DISCORD_CHANNEL_WEBHOOK_TO_EVERYONE_ANNOUNCEMENT;
      break;
    default:
  }

  message = escapeLinksForDiscord(message);

  const tasks = [];
  for (const webhookUrl of webhookUrls) {
    const relativeNotificationUrl = `/notifications/${id}`;
    const link =
      linkUrl ||
      new URL(relativeNotificationUrl, env.NEXT_PUBLIC_BASE_URL).toString();
    const content = `${title}\n${message}\n${link}`;

    tasks.push(
      triggerDiscordChannelWebhook({
        content,
        webhookUrl,
        expiresAt,
        toEveryone,
      }).then(async (webhook) => {
        await prisma.notificationDiscordChannelWebhook.create({
          data: {
            notificationId: id,
            outgoingWebhookId: webhook.id,
          },
        });
        return webhook;
      }),
    );
  }

  return Promise.all(tasks);
}
