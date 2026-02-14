import { z } from "zod";

import { getCalendarEvents } from "@/server/db/calendar-events";
import { publicProcedure, router } from "@/server/trpc/trpc";

export const calendarEventsRouter = router({
  getCalendarEvents: publicProcedure
    .input(
      z
        .object({
          start: z.date().optional(),
          end: z.date().optional(),
          hasTime: z.boolean().optional(),
        })
        .optional(),
    )
    .query(({ input }) => getCalendarEvents(input)),
});
