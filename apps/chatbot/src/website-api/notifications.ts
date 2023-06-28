import { z } from "zod";

import { env } from "@/env";
import { fetchApi } from "@/website-api/index";

type NotificationData = z.infer<typeof notificationSchema>;

// TODO: move API data schema into a shared package for website and chatbot
const dateSchema = z.string().pipe(z.coerce.date());

const notificationSchema = z.object({
  tag: z.string(),
  text: z.string().optional(),
  title: z.string().optional(),
  linkUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  scheduledStartAt: dateSchema.optional(),
  scheduledEndAt: dateSchema.optional(),
  isPush: z.boolean().optional(),
  isDiscord: z.boolean().optional(),
});

export async function createNotification(data: NotificationData) {
  const url = new URL("notifications/create-notification", env.API_BASE_URL);
  await fetchApi({
    url,
    method: "POST",
    body: data,
  });
}
