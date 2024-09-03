import { z } from "zod";
import { DateTime } from "luxon";
import { prisma } from "@/server/db/client";
import { DATETIME_ALVEUS_ZONE } from "@/utils/datetime";

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

export async function createRegularCalendarEvents(date: Date) {
  const animalCareChats = {
    title: "Animal Care Chats",
    description:
      "Join animal care staff as they carry out their daily tasks and answer your questions.",
    category: "Alveus Regular Stream",
    link: "https://twitch.tv/AlveusSanctuary",
  };

  const eventsByWeekDay = [
    // Monday
    [animalCareChats],
    // Tuesday
    [animalCareChats],
    // Wednesday
    [
      animalCareChats,
      {
        title: "WAI New Episode",
        description: "Watch the latest Wine About It episode.",
        category: "Maya YouTube Video",
        link: "https://www.youtube.com/@WineAboutItPodcast",
      },
    ],
    // Thursday
    [
      {
        title: "Connor Stream",
        description: "Join Connor as he gets up to his usual antics.",
        category: "Alveus Regular Stream",
        link: "https://twitch.tv/AlveusSanctuary",
      },
      {
        title: "WW New Episode",
        description: "Watch the latest World's Wildest episode.",
        category: "Maya YouTube Video",
        link: "https://www.youtube.com/@worldswildestpodcast",
      },
    ],
    // Friday
    [animalCareChats],
    // Saturday
    [
      {
        title: "Nick Stream",
        description: "Join Nick as he gets work done around the sanctuary.",
        category: "Alveus Regular Stream",
        link: "https://twitch.tv/AlveusSanctuary",
      },
    ],
    // Sunday
    [],
  ] as Omit<CalendarEventSchema, "startAt" | "hasTime">[][];

  // Walk through each day of the next month and create any events
  const nextMonth = DateTime.fromJSDate(date)
    .plus({ months: 1 })
    .setZone(DATETIME_ALVEUS_ZONE)
    .set({ day: 1, hour: 12, minute: 0, second: 0, millisecond: 0 });
  for (let day = 1; day <= (nextMonth.daysInMonth || 0); day++) {
    const date = nextMonth.set({ day });
    const events = eventsByWeekDay[date.weekday - 1];
    for (const event of events || []) {
      await createCalendarEvent({
        ...event,
        startAt: date.toJSDate(),
        hasTime: false,
      });
    }
  }
}
