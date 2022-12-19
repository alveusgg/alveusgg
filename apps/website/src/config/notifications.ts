import { z } from "zod";
import { notEmpty } from "../utils/helpers";

export type NotificationsConfig = z.infer<typeof notificationsConfigSchema>;

const notificationsConfigSchema = z.object({
  categories: z.array(
    z.object({
      tag: z.string(),
      label: z.string(),
    })
  ),
});

const config: NotificationsConfig = {
  categories: [
    {
      tag: "stream",
      label: "Stream notifications",
    },
    {
      tag: "vod",
      label: "Video releases",
    },
    {
      tag: "announcements",
      label: "Other announcements",
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
