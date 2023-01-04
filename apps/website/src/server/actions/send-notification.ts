import { getNotificationsConfig } from "../../config/notifications";
import { env } from "../../env/server.mjs";

import { prisma } from "../db/client";
import { sendWebPushNotification } from "../../utils/web-push";

export async function sendNotification(data: {
  tag: string;
  text: string;
  url: string;
  heading?: string;
}) {
  const tagConfig = (await getNotificationsConfig()).categories.find(
    (cat) => cat.tag === data.tag
  );
  if (tagConfig === undefined) {
    throw Error("Notification tag unknown!");
  }

  // TODO: Retry (exponential backoff)
  // TODO: Handle rejections/failures -> remove subscription from DB

  // TODO: Save notification and pushes to DB
  // TODO: Batch pushes
  const subscriptions = await prisma.pushSubscription.findMany({
    where: {
      p256dh: { not: { equals: null } },
      auth: { not: { equals: null } },
      tags: {
        some: {
          name: data.tag,
          value: "1",
        },
      },
    },
  });

  for (const subscription of subscriptions) {
    if (!subscription.p256dh || !subscription.auth) {
      continue;
    }

    try {
      const payload = JSON.stringify({
        title: data.heading,
        options: {
          body: data.text,
          dir: "ltr", // TODO: Configurable?
          lang: "en", // TODO: Configurable?
          renotify: true,
          requireInteraction: true,
          silent: false,
          tag: data.tag,
          //data: {},
          // TODO: Configurable:
          icon: `https://alveus.gg/apple-touch-icon.png`,
          image:
            "https://i.ytimg.com/vi/7DvtjAqmWl8/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLBqtYOnWwXm31edNmHBy8cOtsTpDg",
          badge: `https://alveus.gg/notification-badge.png`,
          actions: [
            {
              title: "Go to website",
              action: "live",
              icon: `https://alveus.gg/notification-badge.png`,
            },
          ],
        },
      });
      const res = await sendWebPushNotification(
        {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        },
        payload,
        {
          TTL: tagConfig.ttl, // 30 minutes
          headers: {
            Urgency: tagConfig.urgency,
          },
          vapidDetails: {
            subject: env.WEB_PUSH_VAPID_SUBJECT,
            privateKey: env.WEB_PUSH_VAPID_PRIVATE_KEY,
            publicKey: env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY,
          },
        }
      );
      //console.info(`Sent push (${res.statusCode}) ${subscription.endpoint}`);
    } catch (e) {
      console.error(`Could not send push ${subscription.endpoint}`, e);
    }
  }
}
