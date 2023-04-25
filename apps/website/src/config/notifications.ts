import type { NotificationUrgency } from "@prisma/client";

export type NotificationTag = (typeof notificationCategories)[number]["tag"];

export const defaultTitle = "Alveus Update";
export const defaultTag = "announcements" satisfies NotificationTag;

export const defaultTags = {
  stream: "1",
  vod: "1",
  announcements: "1",
} as const satisfies Record<NotificationTag, string>;

type NotificationCategory = {
  tag: string;
  label: string;
  ttl: number;
  urgency: NotificationUrgency;
};

export const notificationCategories = [
  {
    tag: "stream",
    label: "Stream notifications",
    ttl: 30 * 60, // 30 minutes
    urgency: "HIGH",
  },
  {
    tag: "vod",
    label: "Video releases",
    ttl: 5 * 24 * 60 * 60, // 5 days
    urgency: "HIGH",
  },
  {
    tag: "announcements",
    label: "Other announcements",
    ttl: 5 * 24 * 60 * 60, // 5 days
    urgency: "HIGH",
  },
] satisfies NotificationCategory[];

export function getNotificationCategory(tag: string) {
  return notificationCategories.find((c) => c.tag === tag);
}
