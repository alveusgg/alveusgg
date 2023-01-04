import { z } from "zod";
import { notEmpty } from "../utils/helpers";

export type NotificationsConfig = z.infer<typeof notificationsConfigSchema>;

const notificationsConfigSchema = z.object({
  defaultTags: z.record(z.string(), z.string()),
  categories: z.array(
    z.object({
      tag: z.string(),
      label: z.string(),
      ttl: z.number(),
      urgency: z.enum(["high", "normal", "low", "very-low"]),
    })
  ),
});

const config: NotificationsConfig = {
  defaultTags: {
    stream: "1",
    vod: "1",
    announcements: "1",
  },
  categories: [
    {
      tag: "stream",
      label: "Stream notifications",
      ttl: 30 * 60, // 30 minutes
      urgency: "high",
    },
    {
      tag: "vod",
      label: "Video releases",
      ttl: 5 * 24 * 60 * 60, // 5 days
      urgency: "normal",
    },
    {
      tag: "announcements",
      label: "Other announcements",
      ttl: 5 * 24 * 60 * 60, // 5 days
      urgency: "normal",
    },
  ],
};

export async function getNotificationTags() {
  const config = await getNotificationsConfig();
  return config.categories.map(({ tag }) => tag).filter(notEmpty);
}

export async function getNotificationsConfig() {
  return config;
}
