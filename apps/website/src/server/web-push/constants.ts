import type { NotificationUrgency } from "@prisma/client";

export const WEB_PUSH_MAX_TTL = 2419200; // 4 weeks

export type WebPushUrgency =
  (typeof webPushUrgencyMap)[keyof typeof webPushUrgencyMap];

const webPushUrgencyMap = {
  VERY_LOW: "very-low", // On power and Wi-Fi (Advertisements)
  LOW: "low", // On either power or Wi-Fi (Topic updates)
  NORMAL: "normal", // On neither power nor Wi-Fi (Chat or Calendar Message)
  HIGH: "high", // Low battery (Incoming phone call or time-sensitive alert)
} as const satisfies Record<NotificationUrgency, string>;

export const getWebPushUrgency = (notificationUrgency: NotificationUrgency) =>
  webPushUrgencyMap[notificationUrgency];

export const isNotificationUrgency = (
  str: string
): str is NotificationUrgency => str in webPushUrgencyMap;
