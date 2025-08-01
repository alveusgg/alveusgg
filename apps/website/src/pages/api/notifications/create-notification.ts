import { waitUntil } from "@vercel/functions";
import { z } from "zod";

import { createNotification, sendNotification } from "@/server/notifications";
import { createTokenProtectedApiHandler } from "@/server/utils/api";

export const config = {
  maxDuration: 60, // 60 Seconds is the maximum duration allowed in Hobby Plan
};

// TODO: move API data schema into a shared package for website and chatbot
const dateSchema = z.string().pipe(z.coerce.date());

const notificationSchema = z.object({
  tag: z.string(),
  text: z.string().optional(),
  title: z.string().optional(),
  linkUrl: z.url().optional(),
  imageUrl: z.url().optional(),
  vodUrl: z.url().optional(),
  scheduledStartAt: dateSchema.optional(),
  scheduledEndAt: dateSchema.optional(),
  isPush: z.boolean().optional(),
  isDiscord: z.boolean().optional(),
});

export default createTokenProtectedApiHandler(
  notificationSchema,
  async (options) => {
    try {
      const notification = await createNotification(options);
      waitUntil(sendNotification(notification));
      return true;
    } catch (e) {
      console.error("Failed to create notification", e);
      return false;
    }
  },
);
