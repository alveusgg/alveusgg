import { prisma } from "@alveusgg/database";

import { env } from "@/env";

export async function getRecentNotificationsForTags({
  tags,
  take,
  cursor,
  search,
}: {
  tags: string[];
  take: number;
  cursor?: string;
  search?: string;
}) {
  // VODs are only stored for 60 days, so we have no reason to ever allow access to older notifications
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  const trimmedSearch = search?.trim();

  const items = await prisma.notification.findMany({
    where: {
      tag: { in: tags },
      canceledAt: null,
      createdAt: { gte: sixtyDaysAgo },
      ...(trimmedSearch
        ? {
            OR: [
              { title: { contains: trimmedSearch } },
              { message: { contains: trimmedSearch } },
            ],
          }
        : {}),
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: take + 1,
    cursor: cursor ? { id: cursor } : undefined,
  });

  let nextCursor: typeof cursor | undefined = undefined;
  if (items.length > take) {
    const nextItem = items.pop();
    nextCursor = nextItem?.id || undefined;
  }

  return { items, nextCursor };
}

export async function getActiveAnnouncements() {
  const now = new Date();

  return prisma.notification.findMany({
    where: {
      tag: "announcements",
      canceledAt: null,
      OR: [
        { expiresAt: { gt: now } },
        { scheduledStartAt: { gt: now } },
        { scheduledEndAt: { gt: now } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function getNotificationById(notificationId: string) {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  return notification?.canceledAt === null ? notification : null;
}

export async function getRecentNotifications({
  limit = 10,
  cursor,
}: {
  limit?: number;
  cursor?: string;
}) {
  const items = await prisma.notification.findMany({
    where: { canceledAt: null },
    orderBy: { createdAt: "desc" },
    take: limit + 1, // get an extra item at the end which we'll use as next cursor
    cursor: cursor ? { id: cursor } : undefined,
  });

  let nextCursor: typeof cursor | undefined = undefined;
  if (items.length > limit) {
    const nextItem = items.pop();
    nextCursor = nextItem?.id || undefined;
  }

  return { items, nextCursor };
}

export async function cancelNotification(notificationId: string) {
  const now = new Date();
  await prisma.notification.update({
    where: { id: notificationId },
    data: { canceledAt: now },
  });

  await prisma.notificationPush.updateMany({
    where: {
      notificationId: notificationId,
      processingStatus: { not: "DONE" },
    },
    data: {
      processingStatus: "DONE",
      expiresAt: now,
    },
  });

  return;
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

export async function cleanupExpiredNotificationPushes() {
  const now = new Date();
  await prisma.notificationPush.updateMany({
    data: { processingStatus: "DONE" },
    where: {
      processingStatus: "PENDING",
      OR: [
        { subscription: { deletedAt: { not: null } } },
        { expiresAt: { lte: now } },
        { attempts: { gt: env.PUSH_MAX_ATTEMPTS } },
      ],
    },
  });
}
