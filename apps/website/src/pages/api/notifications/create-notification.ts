import { z } from "zod";
import { createNotification } from "@/server/actions/create-notification";
import { createTokenProtectedApiHandler } from "@/server/utils/api";

export default createTokenProtectedApiHandler(
  z.object({
    tag: z.string(),
    text: z.string(),
    url: z.string().url(),
  }),
  async (options) => {
    try {
      await createNotification(options);
      return true;
    } catch (e) {
      console.error("Failed to create notification", e);
      return false;
    }
  }
);
