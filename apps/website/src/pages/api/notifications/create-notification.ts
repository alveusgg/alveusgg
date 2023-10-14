import { z } from "zod";
import { createNotification } from "@/server/notifications";
import { createTokenProtectedApiHandler } from "@/server/utils/api";

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

export default createTokenProtectedApiHandler(
  notificationSchema,
  async (options) => {
    try {
      await createNotification(options);
      return true;
    } catch (e) {
      console.error("Failed to create notification", e);
      return false;
    }
  },
);
