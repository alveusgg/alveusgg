declare const self: ServiceWorkerGlobalScope;

import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";

import { type AppRouter } from "../server/trpc/router/_app";

const getBaseUrl = () => {
  if (process.env.VERCEL_URL) return `https://www.alveus.gg`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
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

self.addEventListener("install", (event) => {
  console.log("check push support registration", self.registration.pushManager);
});

self.addEventListener("push", async function (event) {
  console.log("on push");

  if (event.data) {
    try {
      const notification = event.data.json();
      event.waitUntil(
        self.registration.showNotification(
          notification.title,
          notification.options
        )
      );
    } catch (e) {}
  }
});

self.addEventListener("notificationclick", function (event) {
  console.log("on notificationclick", event);
  event.notification.close();

  const targetUrl = `${getBaseUrl()}/api/notifications/redirect?notification_tag=${
    event.notification.tag
  }&notification_action=${event.action || "default"}&notification_id=${
    event.notification.data.notificationId
  }&subscription_id=${event.notification.data.subscriptionId}`;

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
