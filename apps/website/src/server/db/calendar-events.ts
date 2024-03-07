import { z } from "zod";
import { prisma } from "@/server/db/client";

export const calendarEventSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  link: z.string().url(),
  startAt: z.date(),
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
