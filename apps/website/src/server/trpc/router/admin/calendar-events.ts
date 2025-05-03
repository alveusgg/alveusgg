import { z } from "zod";

import {
  calendarEventSchema,
  createCalendarEvent,
  editCalendarEvent,
} from "@/server/db/calendar-events";
import {
  createCheckPermissionMiddleware,
  protectedProcedure,
  router,
} from "@/server/trpc/trpc";

import { permissions } from "@/data/permissions";

const permittedProcedure = protectedProcedure.use(
  createCheckPermissionMiddleware(permissions.manageCalendarEvents),
);

export const adminCalendarEventsRouter = router({
  createOrEditCalendarEvent: permittedProcedure
    .input(
      z
        .discriminatedUnion("action", [
          z.object({ action: z.literal("create") }),
          z.object({ action: z.literal("edit"), id: z.string().cuid() }),
        ])
        .and(calendarEventSchema),
    )
    .mutation(async ({ input }) => {
      switch (input.action) {
        case "create": {
          const { action: _, ...data } = input;
          await createCalendarEvent(data);
          break;
        }
        case "edit": {
          const { action: _, ...data } = input;
          await editCalendarEvent(data);
          break;
        }
      }
    }),

  deleteCalendarEvent: permittedProcedure
    .input(z.string().cuid())
    .mutation(({ ctx, input: id }) =>
      ctx.prisma.calendarEvent.delete({ where: { id: id } }),
    ),

  getCalendarEvent: permittedProcedure
    .input(z.string().cuid())
    .query(({ ctx, input: id }) =>
      ctx.prisma.calendarEvent.findUnique({ where: { id } }),
    ),
});
