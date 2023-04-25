import type {
  NotificationPush,
  Notification,
  PushSubscription,
} from "@prisma/client";
import { prisma } from "@/server/db/client";

export type NotificationPushWithNotificationAndSubscription =
  NotificationPush & {
    notification: Notification;
    subscription: PushSubscription;
  };

export async function getRecentNotificationsForTags({
  tags,
  take,
}: {
  tags: string[];
  take: number;
}): Promise<Notification[]> {
  return prisma.notification.findMany({
    where: {
      tag: {
        in: tags,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take,
  });
}

export async function getAndLockNotificationPush() {
  return prisma.$transaction(async (prisma) => {
    const push = await prisma.notificationPush.findFirst({
      where: {
        processingStatus: "PENDING",
      },
      include: {
        notification: true,
        subscription: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    if (push === null) {
      return null;
    }

    await prisma.notificationPush.update({
      where: {
        notificationId_subscriptionId: {
          notificationId: push.notificationId,
          subscriptionId: push.subscriptionId,
        },
      },
      data: {
        processingStatus: "IN_PROGRESS",
        attempts: { increment: 1 },
      },
    });

    return push;
  });
}

export async function updateNotificationPushStatus({
  processingStatus,
  notificationId,
  subscriptionId,
  failedAt,
  deliveredAt,
}: {
  processingStatus: "DONE" | "PENDING";
  notificationId: string;
  subscriptionId: string;
  failedAt?: Date;
  deliveredAt?: Date;
}) {
  return prisma.notificationPush.update({
    where: {
      notificationId_subscriptionId: {
        notificationId: notificationId,
        subscriptionId: subscriptionId,
      },
    },
    data: {
      processingStatus,
      failedAt,
      deliveredAt,
    },
  });
}
