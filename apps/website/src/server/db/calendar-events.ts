import { z } from "zod";
import { prisma } from "@/server/db/client";

export const calendarEventSchema = z.object({
  title: z.string().min(1),
  category: z.string().min(1),
  description: z.string().min(1).optional(),
  link: z.string().url(),
  startAt: z.date(),
  hasTime: z.boolean().default(true),
});

export type CalendarEventSchema = z.infer<typeof calendarEventSchema>;

export const existingCalendarEventSchema = calendarEventSchema.and(
  z.object({
    id: z.string().cuid(),
  }),
);

export async function createCalendarEvent(
  input: z.infer<typeof calendarEventSchema>,
) {
  return await prisma.calendarEvent.create({
    data: input,
  });
}

export async function editCalendarEvent(
  input: z.infer<typeof existingCalendarEventSchema>,
) {
  const { id, ...data } = input;
  return await prisma.calendarEvent.update({
    where: { id },
    data,
  });
}

export async function getCalendarEvents({
  start,
  end,
}: { start?: Date; end?: Date } = {}) {
  // If we're not given a start, use the start of the current month
  const startAt = start ?? new Date(new Date().setDate(1));

  // If we're not given an end, use one month from the start
  const endAt =
    end ?? new Date(new Date(startAt).setMonth(startAt.getMonth() + 1));

  return await prisma.calendarEvent.findMany({
    where: {
      startAt: {
        gte: startAt,
        lt: endAt,
      },
    },
    orderBy: { startAt: "asc" },
  });
}
