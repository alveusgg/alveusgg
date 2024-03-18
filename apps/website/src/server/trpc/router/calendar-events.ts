import { z } from "zod";

import { publicProcedure, router } from "@/server/trpc/trpc";
import { getCalendarEvents } from "@/server/db/calendar-events";

export const calendarEventsRouter = router({
  getCalendarEvents: publicProcedure
    .input(
      z
        .object({ start: z.date().optional(), end: z.date().optional() })
        .optional(),
    )
    .query(({ input }) => getCalendarEvents(input)),
});
