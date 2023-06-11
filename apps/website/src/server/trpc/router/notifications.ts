import { z } from "zod";

import { publicProcedure, router } from "@/server/trpc/trpc";
import {
  getActiveAnnouncements,
  getRecentNotificationsForTags,
} from "@/server/db/notifications";

export const notificationsRouter = router({
  getRecentNotificationsForTags: publicProcedure
    .input(z.object({ tags: z.array(z.string()) }))
    .query(async ({ input }) =>
      getRecentNotificationsForTags({ tags: input.tags, take: 10 })
    ),

  getActiveAnnouncements: publicProcedure.query(getActiveAnnouncements),
});
