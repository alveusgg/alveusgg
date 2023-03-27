import {
  NotificationOptionsData,
  notificationPayloadSchema,
} from "../utils/notifications";

declare const self: ServiceWorkerGlobalScope;

const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_BASE_URL;
};

self.addEventListener("install", (event) => {
  console.log("check push support registration", self.registration.pushManager);
});

self.addEventListener("push", async (event) => {
  if (event.data) {
    try {
      const notificationPayload = event.data.json();
      const notification = notificationPayloadSchema.parse(notificationPayload);
      event.waitUntil(
        self.registration.showNotification(
          notification.title,
          notification.options
        )
      );
    } catch (e) {
      console.error("Failed to show notification", e);
    }
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const { notificationId, subscriptionId } = event.notification
    .data as NotificationOptionsData["data"];

  const targetUrl = new URL(`${getBaseUrl()}/api/notifications/redirect`);
  targetUrl.searchParams.set("notification_tag", event.notification.tag);
  targetUrl.searchParams.set("notification_action", event.action || "default");
  targetUrl.searchParams.set("notification_id", notificationId);
  targetUrl.searchParams.set("subscription_id", subscriptionId);

  event.waitUntil(clients.openWindow(targetUrl));
});

/*

import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";

import { type AppRouter } from "../server/trpc/router/_app";

type PushSubscriptionChangeEvent = Event & {
  waitUntil: NotificationEvent["waitUntil"];
  oldSubscription?: PushSubscription;
  newSubscription?: PushSubscription;
};

const trpc = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
    }),
  ],
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

*/
