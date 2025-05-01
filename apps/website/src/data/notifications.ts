import { env } from "@/env";

import type { NotificationUrgency } from "@/server/db/client";

type NotificationLinkSuggestion = {
  label: string;
  url: string;
};

export type NotificationTag = (typeof notificationCategories)[number]["tag"];

export const defaultTitle = "Alveus Update";
export const defaultTag = "announcements" satisfies NotificationTag;

export const welcomeTitle = "Welcome!";
export const welcomeMessage = "Your Alveus notifications are set up.";

export const iconUrl = `${env.NEXT_PUBLIC_BASE_URL}/apple-touch-icon.png`;
export const badgeUrl = `${env.NEXT_PUBLIC_BASE_URL}/notification-badge.png`;

export const defaultTags = {
  stream: "1",
  vod: "1",
  announcements: "1",
} as const satisfies Record<NotificationTag, string>;

export type NotificationCategory = {
  tag: string;
  label: string;
  ttl: number;
  ttl_after_event: number;
  urgency: NotificationUrgency;
};

export const notificationCategories = [
  {
    tag: "stream",
    label: "Stream notifications",
    ttl: 30 * 60, // 30 minutes
    ttl_after_event: 30 * 60, // 30 mintutes
    urgency: "HIGH",
  },
  //{
  //  tag: "vod",
  //  label: "Video releases",
  //  ttl: 5 * 24 * 60 * 60, // 5 days
  //  urgency: "HIGH",
  //},
  {
    tag: "announcements",
    label: "Announcements",
    ttl: 5 * 24 * 60 * 60, // 5 days
    ttl_after_event: 2 * 60 * 60, // 2 hours
    urgency: "HIGH",
  },
] satisfies NotificationCategory[];

export function getNotificationCategory(tag: string) {
  return notificationCategories.find((c) => c.tag === tag);
}

export const notificationLinkSuggestions = [
  {
    label: "TTV AlveusSanctuary",
    url: "https://twitch.tv/AlveusSanctuary",
  },
  { label: "TTV Maya", url: "https://twitch.tv/maya" },
  { label: "YT AlveusSanctuary", url: "https://youtube.com/@AlveusSanctuary" },
  { label: "YT Maya", url: "https://youtube.com/@mayahiga" },
  { label: "Website", url: "https://www.alveussanctuary.org/" },
  { label: "X (Twitter)", url: "https://x.com/AlveusSanctuary" },
] satisfies NotificationLinkSuggestion[];

export const notificationLinkDefault = "";

export const notificationChannels = {
  push: {
    label: "Push",
    isDefault: true,
  },
  discord: {
    label: "Discord",
    isDefault: true,
  },
  //website: {
  //  label: "Website",
  //  isDefault: true,
  //},
  //twitter: {
  //  label: "Twitter",
  //  isDefault: true,
  //},
  //instagram: {
  //  label: "Instagram",
  //  isDefault: true,
  //},
} as const;
