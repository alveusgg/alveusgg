declare const self: ServiceWorkerGlobalScope;

import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { type AppRouter } from "./server/trpc/router/_app";

const getBaseUrl = () => {
  if (typeof window !== "undefined") return ""; // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

const trpc = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
    }),
  ],
});

type PushSubscriptionChangeEvent = Event & {
  waitUntil: NotificationEvent["waitUntil"];
  oldSubscription?: PushSubscription;
  newSubscription?: PushSubscription;
};

self.addEventListener("push", async function (event) {
  console.log("on push");

  let isSent = false;
  if (event.data) {
    try {
      const notification = event.data.json();
      event.waitUntil(
        self.registration.showNotification(
          notification.title,
          notification.options
        )
      );
      isSent = true;
    } catch (e) {}
  }

  if (!isSent) {
    const title = "Alveus.gg";

    event.waitUntil(
      self.registration.showNotification(title, {
        body: "Test notification body",
        data: {
          foo: "bar",
        },
        dir: "ltr",
        lang: "en",
        renotify: true,
        requireInteraction: true,
        silent: false,
        tag: "stream",
        icon: `${getBaseUrl()}/apple-touch-icon.png`,
        image:
          "https://i.ytimg.com/vi/7DvtjAqmWl8/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLBqtYOnWwXm31edNmHBy8cOtsTpDg",
        badge: `${getBaseUrl()}/notification-badge.png`,
        actions: [
          {
            title: "Go to website",
            action: "live",
            icon: `${getBaseUrl()}/notification-badge.png`,
          },
        ],
      })
    );
  }
});

self.addEventListener("notificationclick", function (event) {
  console.log("on notificationclick", event);
  event.notification.close();

  const targetUrl = `${getBaseUrl()}/api/notifications/${
    event.notification.tag
  }/redirect?notification_action=${event.action || "default"}`;

  event.waitUntil(clients.openWindow(targetUrl));
});

self.addEventListener("pushsubscriptionchange", function (_event) {
  console.log("on pushsubscriptionchange");
  const event = _event as PushSubscriptionChangeEvent;

  const newEndpoint = event.newSubscription
    ? event.newSubscription.endpoint
    : undefined;
  if (!newEndpoint) {
    return;
  }

  const oldEndpoint = event.oldSubscription
    ? event.oldSubscription.endpoint
    : undefined;
  const newP256dh = event.newSubscription
    ? event.newSubscription.toJSON().keys?.p256dh
    : undefined;
  const newAuth = event.newSubscription
    ? event.newSubscription.toJSON().keys?.auth
    : undefined;

  if (oldEndpoint && newEndpoint) {
    event.waitUntil(
      trpc.pushSubscription.updateRegistration.mutate({
        endpoint: oldEndpoint,
        newSubscription: {
          endpoint: newEndpoint,
          p256dh: newP256dh,
          auth: newAuth,
        },
      })
    );
  } else if (newEndpoint) {
    event.waitUntil(
      trpc.pushSubscription.register.mutate({
        endpoint: newEndpoint,
        p256dh: newP256dh,
        auth: newAuth,
      })
    );
  }
});
