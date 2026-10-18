import { daysAgo, daysFromNow } from "./helpers";
import { prisma } from "../index";

type SeedNotification = {
  id: string;
  title: string;
  message: string;
  // Must be one of the categories in apps/website/src/data/notifications.ts
  tag: "stream" | "vod" | "announcements";
  urgency: "VERY_LOW" | "LOW" | "NORMAL" | "HIGH";
  isPush: boolean;
  isDiscord: boolean;
  createdAt: Date;
  expiresAt: Date;
  linkUrl?: string;
  vodUrl?: string;
  canceledAt?: Date;
};

// Only the notification records are seeded: no push subscriptions or Discord
// webhooks, so nothing is ever actually delivered.
const notifications: SeedNotification[] = [
  {
    id: "cseednot01",
    title: "Alveus is live!",
    message: "Example live notification seeded for local development.",
    tag: "stream",
    urgency: "HIGH",
    isPush: true,
    isDiscord: true,
    createdAt: daysAgo(1),
    expiresAt: daysFromNow(1),
    linkUrl: "https://www.twitch.tv/alveussanctuary",
    // Stream notifications with a VoD show up in the chatbot's recent streams
    vodUrl: "https://www.twitch.tv/videos/1000000000",
  },
  {
    id: "cseednot02",
    title: "New merch drop",
    message: "Example announcement seeded for local development.",
    tag: "announcements",
    urgency: "NORMAL",
    isPush: true,
    isDiscord: false,
    createdAt: daysAgo(5),
    expiresAt: daysAgo(2),
  },
  {
    id: "cseednot03",
    title: "New video released",
    message: "Example Discord-only notification seeded for local development.",
    tag: "vod",
    urgency: "LOW",
    isPush: false,
    isDiscord: true,
    createdAt: daysAgo(10),
    expiresAt: daysAgo(8),
  },
  {
    id: "cseednot04",
    title: "Canceled event",
    message: "Example canceled notification seeded for local development.",
    tag: "announcements",
    urgency: "VERY_LOW",
    isPush: false,
    isDiscord: false,
    createdAt: daysAgo(3),
    expiresAt: daysFromNow(4),
    canceledAt: daysAgo(2),
  },
];

export async function seedNotifications() {
  for (const { id, ...data } of notifications) {
    await prisma.notification.upsert({
      where: { id },
      create: { id, ...data },
      update: data,
    });
  }
  console.log(`Seeded ${notifications.length} notifications`);
}
