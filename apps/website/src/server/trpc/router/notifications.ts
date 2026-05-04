import { z } from "zod";

import {
  getActiveAnnouncements,
  getRecentNotificationsForTags,
} from "@/server/db/notifications";
import { publicProcedure, router } from "@/server/trpc/trpc";

export const notificationsRouter = router({
  getRecentNotificationsForTags: publicProcedure
    .input(
      z.object({
        tags: z.array(z.string()),
        cursor: z.cuid().nullish(),
      }),
    )
    .query(async ({ input }) =>
      getRecentNotificationsForTags({
        tags: input.tags,
        take: 9,
        cursor: input.cursor || undefined,
      }),
    ),

  getActiveAnnouncements: publicProcedure.query(getActiveAnnouncements),
});
