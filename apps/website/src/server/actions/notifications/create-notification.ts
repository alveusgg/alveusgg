import { prisma } from "@/server/db/client";
import { notificationCategories } from "@/config/notifications";
import type { CreatePushesOptions } from "@/pages/api/notifications/batched-create-notification-pushes";
import { callEndpoint } from "@/server/utils/queue";

const PUSH_BATCH_SIZE = 2;

export async function createNotification(data: {
  tag: string;
  text: string;
  url: string;
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
      message: data.text,
      linkUrl: data.url,
      // TODO: Actually allow uploading/choosing an image
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

  // TODO: Do we want to retry?

  await Promise.allSettled(requests);
}
