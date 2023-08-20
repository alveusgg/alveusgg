import {
  type NotificationOptionsData,
  notificationPayloadSchema,
} from "../utils/notification-payload";

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
          notification.options,
        ),
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
