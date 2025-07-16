import { z } from "zod";

import {
  getActiveAnnouncements,
  getRecentNotificationsForTags,
} from "@/server/db/notifications";
import { publicProcedure, router } from "@/server/trpc/trpc";

export const notificationsRouter = router({
  getRecentNotificationsForTags: publicProcedure
    .input(z.object({ tags: z.array(z.string()) }))
    .query(async ({ input }) =>
      getRecentNotificationsForTags({ tags: input.tags, take: 10 }),
    ),

  getActiveAnnouncements: publicProcedure.query(getActiveAnnouncements),
});
