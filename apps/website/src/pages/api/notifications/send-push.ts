import type { NotificationUrgency } from "@prisma/client";
import { z } from "zod";

import { pushTextDir, pushLang, pushMaxAttempts } from "@/data/env/push";
import {
  badgeUrl,
  defaultTag,
  defaultTitle,
  iconUrl,
} from "@/data/notifications";

import type { NotificationPayload } from "@/utils/notification-payload";

import { createTokenProtectedApiHandler } from "@/server/utils/api";
import {
  getWebPushUrgency,
  isNotificationUrgency,
  WEB_PUSH_MAX_TTL,
} from "@/server/web-push/constants";
import { sendWebPushNotification } from "@/server/web-push";
import { prisma } from "@/server/db/client";
import { updateNotificationPushStatus } from "@/server/db/notifications";
import { markPushSubscriptionAsDeleted } from "@/server/db/push-subscriptions";

export type SendPushOptions = z.infer<typeof sendPushSchema>;

const sendPushSchema = z.object({
  attempt: z.number().optional(),
  notificationId: z.string().cuid(),
  subscriptionId: z.string().cuid(),
  expiresAt: z.number(),
  title: z.string().optional(),
  message: z.string(),
  tag: z.string().optional(),
  imageUrl: z.string().optional(),
  urgency: z
    .string()
    .refine((value) => isNotificationUrgency(value), "invalid urgency")
    .transform((value) => value as NotificationUrgency),
});

export default createTokenProtectedApiHandler(
  sendPushSchema,
  async (options) => {
    let delivered = false;
    let expired = false;

    const subscription = await prisma.pushSubscription.findUnique({
      where: { id: options.subscriptionId },
    });

    if (!subscription || subscription.deletedAt !== null) {
      return true;
    }

    const expiresAt = new Date(options.expiresAt);
    const push = await prisma.notificationPush.upsert({
      where: {
        notificationId_subscriptionId: {
          notificationId: options.notificationId,
          subscriptionId: options.subscriptionId,
        },
      },
      create: {
        processingStatus: "IN_PROGRESS",
        attempts: 1,
        notification: { connect: { id: options.notificationId } },
        subscription: { connect: { id: options.subscriptionId } },
        user: subscription.userId
          ? { connect: { id: subscription.userId } }
          : undefined,
        expiresAt,
      },
      update: {
        processingStatus: "IN_PROGRESS",
        attempts: options.attempt || 1,
      },
    });

    const now = new Date();
    try {
      if (
        options.expiresAt < now.getTime() ||
        !subscription.p256dh ||
        !subscription.auth
      ) {
        await updateNotificationPushStatus({
          processingStatus: "DONE",
          notificationId: options.notificationId,
          subscriptionId: options.subscriptionId,
          failedAt: now,
        });
        return true;
      }

      const ttl = Math.min(
        WEB_PUSH_MAX_TTL,
        Math.max(
          0,
          Math.round((push.expiresAt.getTime() - now.getTime()) / 1000),
        ),
      );

      const res = await sendWebPushNotification(
        {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        },
        JSON.stringify({
          title: options.title || defaultTitle,
          options: {
            body: options.message,
            renotify: true,
            requireInteraction: true,
            silent: false,
            tag: options.tag || defaultTag,
            data: {
              notificationId: options.notificationId,
              subscriptionId: options.subscriptionId,
            },
            image: options.imageUrl,
            dir: pushTextDir,
            lang: pushLang,
            icon: iconUrl,
            badge: badgeUrl,
          },
        } satisfies NotificationPayload),
        {
          TTL: ttl,
          headers: {
            Urgency: getWebPushUrgency(options.urgency),
          },
        },
      );

      if (res.statusCode) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          delivered = true;
        } else if (res.statusCode === 410) {
          expired = true;
          // 410 Gone = subscription expired or unsubscribed
          await markPushSubscriptionAsDeleted(options.subscriptionId);
        }
      }
    } catch (e) {
      console.error("Failed to send push notification", e);
    }

    const done = delivered || expired;
    await updateNotificationPushStatus(
      done
        ? {
            processingStatus: "DONE",
            notificationId: options.notificationId,
            subscriptionId: options.subscriptionId,
            deliveredAt: delivered ? now : undefined,
          }
        : {
            processingStatus:
              options.attempt && options.attempt >= pushMaxAttempts
                ? "DONE"
                : "PENDING",
            notificationId: options.notificationId,
            subscriptionId: options.subscriptionId,
            failedAt: now,
          },
    );

    return delivered;
  },
);
