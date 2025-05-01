import { env } from "@/env";

import { type Notification, prisma } from "@/server/db/client";
import { triggerDiscordChannelWebhook } from "@/server/outgoing-webhooks";
import { callEndpoint } from "@/server/utils/queue";

import type { NotificationCategory } from "@/data/notifications";
import {
  defaultTag,
  defaultTitle,
  notificationCategories,
} from "@/data/notifications";

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

const exponentialDelays = Array(env.PUSH_MAX_ATTEMPTS)
  .fill(0)
  .map((_, i) => env.PUSH_RETRY_DELAY_MS * Math.pow(2, i + 1));

function getNotificationExpiration(
  data: CreateNotificationData,
  tagConfig: NotificationCategory,
) {
  if (data.scheduledEndAt) {
    return new Date(
      data.scheduledEndAt.getTime() + tagConfig.ttl_after_event * 1000,
    );
  } else {
    const now = new Date();
    return new Date(now.getTime() + tagConfig.ttl * 1000);
  }
}

export async function createNotification(data: CreateNotificationData) {
  const tagConfig = notificationCategories.find((cat) => cat.tag === data.tag);
  if (tagConfig === undefined) {
    throw Error("Notification tag unknown!");
  }

  const expiresAt = getNotificationExpiration(data, tagConfig);
  return prisma.notification.create({
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
}

export async function sendNotification(notification: Notification) {
  await Promise.allSettled([
    notification.isPush && sendNotificationPushes(notification),
    notification.isDiscord && sendDiscordNotifications(notification),
  ]);
}

export async function copyNotification(notificationId: string) {
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
  const retryConditions = exponentialDelays.map((delay, attempts) => ({
    attempts: attempts,
    failedAt: { lte: new Date(now.getTime() - delay) },
  }));

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
        OR: retryConditions,
      },
      take: env.PUSH_BATCH_SIZE,
      skip: env.PUSH_BATCH_SIZE * i++,
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

async function sendNotificationPushes(notification: Notification) {
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
      take: env.PUSH_BATCH_SIZE,
      skip: env.PUSH_BATCH_SIZE * i++,
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

    // Delay between batches to avoid rate limiting
    await new Promise((resolve) =>
      setTimeout(resolve, env.PUSH_BATCH_DELAY_MS),
    );
  }

  await Promise.allSettled(requests);
}

async function sendDiscordNotifications({
  tag,
  id,
  title,
  message,
  expiresAt,
  linkUrl,
  imageUrl,
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
    tasks.push(
      triggerDiscordChannelWebhook({
        contentTitle: title ?? undefined,
        contentMessage: message,
        contentLink: linkUrl ?? undefined,
        imageUrl: imageUrl ?? undefined,
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

  await Promise.allSettled(tasks);
}
