import { z } from "zod";
import { type DateObjectUnits, DateTime } from "luxon";
import type { CalendarEvent } from "@prisma/client";
import ambassadors from "@alveusgg/data/build/ambassadors/core";
import {
  type ActiveAmbassador,
  type ActiveAmbassadorKey,
  isActiveAmbassadorEntry,
} from "@alveusgg/data/build/ambassadors/filters";

import { prisma } from "@/server/db/client";
import {
  createScheduleSegment,
  getScheduleSegments,
  removeScheduleSegment,
  type ScheduleSegment,
} from "@/server/apis/twitch";
import {
  createScheduledGuildEvent,
  getScheduledGuildEvents,
  removeScheduledGuildEvent,
} from "@/server/apis/discord";

import { DATETIME_ALVEUS_ZONE } from "@/utils/datetime";
import { typeSafeObjectEntries } from "@/utils/helpers";
import { getShortBaseUrl } from "@/utils/short-url";
import { camelToKebab } from "@/utils/string-case";

import { getFormattedTitle, twitchChannels } from "@/data/calendar-events";

export const calendarEventSchema = z.object({
  title: z.string().min(1),
  category: z.string().min(1),
  description: z.string().min(1).nullable(),
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

export function createCalendarEvent(
  input: z.infer<typeof calendarEventSchema>,
) {
  return prisma.calendarEvent.create({
    data: input,
  });
}

export function editCalendarEvent(
  input: z.infer<typeof existingCalendarEventSchema>,
) {
  const { id, ...data } = input;
  return prisma.calendarEvent.update({
    where: { id },
    data,
  });
}

export function getCalendarEvents({
  start,
  end,
  hasTime,
}: { start?: Date; end?: Date; hasTime?: boolean } = {}) {
  // If we're not given a start, use the start of the current month
  const startAt = start ?? new Date(new Date().setDate(1));

  // If we're not given an end, use one month from the start
  const endAt =
    end ?? new Date(new Date(startAt).setMonth(startAt.getMonth() + 1));

  return prisma.calendarEvent.findMany({
    where: {
      startAt: {
        gte: startAt,
        lt: endAt,
      },
      hasTime,
    },
    orderBy: { startAt: "asc" },
  });
}

type RegularEvent = Pick<
  CalendarEventSchema,
  "title" | "description" | "category" | "link"
> & {
  startTime?: Pick<DateObjectUnits, "hour" | "minute">;
};

const animalCareChats: RegularEvent = {
  title: "Animal Care Chats",
  description:
    "Join animal care staff as they carry out their daily tasks and answer your questions.",
  category: "Alveus Regular Stream",
  link: "https://twitch.tv/AlveusSanctuary",
  startTime: { hour: 14, minute: 30 },
};

export const eventsByWeekDay = [
  // Monday
  [animalCareChats],
  // Tuesday
  [animalCareChats],
  // Wednesday
  [
    {
      title: "Connor Stream",
      description: "Join Connor as he gets up to his usual antics.",
      category: "Alveus Regular Stream",
      link: "https://twitch.tv/AlveusSanctuary",
      startTime: { hour: 14, minute: 30 },
    },
    {
      title: "WAI New Episode",
      description: "Watch the latest Wine About It episode.",
      category: "Maya YouTube Video",
      link: "https://www.youtube.com/@WineAboutItPodcast",
    },
  ],
  // Thursday
  [
    animalCareChats,
    {
      title: "WW New Episode",
      description: "Watch the latest World's Wildest episode.",
      category: "Maya YouTube Video",
      link: "https://www.youtube.com/@worldswildestpodcast",
    },
  ],
  // Friday
  [
    {
      title: "Show & Tell",
      description:
        "Join Maya as she reviews this week's community submissions for Show and Tell.",
      category: "Alveus Regular Stream",
      link: "https://twitch.tv/AlveusSanctuary",
      startTime: { hour: 14, minute: 30 },
    },
  ],
  // Saturday
  [
    {
      title: "Nick Stream",
      description: "Join Nick as he gets work done around the sanctuary.",
      category: "Alveus Regular Stream",
      link: "https://twitch.tv/AlveusSanctuary",
      startTime: { hour: 14, minute: 30 },
    },
  ],
  // Sunday
  [],
] as RegularEvent[][];

export async function createRegularCalendarEvents(date: Date) {
  // Get all the ambassadors with an exact birth date
  const ambassadorBirthdays = typeSafeObjectEntries(ambassadors)
    .filter(isActiveAmbassadorEntry)
    .reduce(
      (acc, [name, ambassador]) => {
        const key = ambassador.birth
          ?.match(/^(\d{4})-(\d{2})-(\d{2})$/)
          ?.slice(2)
          .join("-");
        if (!key) return acc;

        const entry = [name, ambassador] as (typeof acc)[keyof typeof acc][0];
        return { ...acc, [key]: [...(acc[key] || []), entry] };
      },
      {} as Record<string, [ActiveAmbassadorKey, ActiveAmbassador][]>,
    );

  // Walk through each day of the next month and create any events
  const nextMonth = DateTime.fromJSDate(date)
    .plus({ months: 1 })
    .setZone(DATETIME_ALVEUS_ZONE)
    .set({ day: 1, hour: 12, minute: 0, second: 0, millisecond: 0 });
  for (let day = 1; day <= (nextMonth.daysInMonth || 0); day++) {
    const date = nextMonth.set({ day });
    const events = eventsByWeekDay[date.weekday - 1]?.slice() || [];

    const birthdays =
      ambassadorBirthdays[
        `${date.month.toString().padStart(2, "0")}-${date.day.toString().padStart(2, "0")}`
      ] || [];
    for (const [name, ambassador] of birthdays) {
      events.push({
        title: `${ambassador.name}'s Birthday`,
        description: `Wish ${ambassador.name} a happy birthday!`,
        category: "Alveus Special Stream",
        link: `${getShortBaseUrl()}/${camelToKebab(name)}`,
      });
    }

    for (const event of events) {
      let hasTime = false;
      let eventDate = date;
      if (event.startTime !== undefined) {
        hasTime = true;
        eventDate = eventDate.set(event.startTime);
      }

      await createCalendarEvent({
        title: event.title,
        category: event.category,
        description: event.description,
        link: event.link,
        startAt: eventDate.toJSDate(),
        hasTime: hasTime,
      });
    }
  }
}

async function getTwitchSchedule(
  userAccessToken: string,
  userId: string,
  start: Date,
) {
  let cursor;
  const segments: ScheduleSegment[] = [];

  while (true) {
    const response = await getScheduleSegments(
      userAccessToken,
      userId,
      start,
      cursor,
    );
    if (response === null) break;

    segments.push(...(response.data.segments || []));

    cursor = response.pagination.cursor;
    if (!cursor) break;
  }

  return segments;
}

interface ExternalCalendar<ExternalEvent> {
  type: string;
  get: () => Promise<ExternalEvent[]>;
  filter: (event: CalendarEvent) => boolean;
  compare: (internal: CalendarEvent, external: ExternalEvent) => boolean;
  create: (event: CalendarEvent) => Promise<void>;
  remove: (event: ExternalEvent) => Promise<void>;
}

async function syncExternalSchedule<ExternalEvent>(
  calendar: ExternalCalendar<ExternalEvent>,
) {
  // Get all the database events that we need to sync
  const internalEvents = await getCalendarEvents({
    start: new Date(),
    hasTime: true,
  }).then((events) => events.filter(calendar.filter));

  // Get all the existing events from the external service
  const externalEvents = await calendar.get();

  // Decide which events in the DB need to be created on the external service
  const missingEvents: CalendarEvent[] = [];
  for (const internal of internalEvents) {
    const idx = externalEvents.findIndex((external) =>
      calendar.compare(internal, external),
    );

    // If we have an existing match, remove it from the list
    if (idx !== -1) {
      externalEvents.splice(idx, 1);
      continue;
    }

    // Otherwise, we need to create this event
    missingEvents.push(internal);
  }

  // Remove events from the external service we don't have in the DB
  for (const external of externalEvents) {
    console.log(`Removing ${calendar.type} external event:`, external);
    await calendar.remove(external);
  }

  // Then, create any new events
  // Do this after the removal to reduce the chance of an overlap error
  for (const internal of missingEvents) {
    console.log(`Creating ${calendar.type} external event:`, internal);
    try {
      await calendar.create(internal);
    } catch (err) {
      console.error(`Failed to create ${calendar.type} external event:`, err);
    }
  }
}

export async function syncTwitchSchedule(channel: keyof typeof twitchChannels) {
  const { username, filter } = twitchChannels[channel];
  const twitchChannel = await prisma.twitchChannel.findFirst({
    where: { username },
    select: {
      broadcasterAccount: {
        select: {
          providerAccountId: true,
          access_token: true,
        },
      },
    },
  });
  const { access_token, providerAccountId } =
    twitchChannel?.broadcasterAccount ?? {};
  if (!access_token || !providerAccountId) {
    throw new Error(`No access token found for ${username} Twitch account`);
  }

  await syncExternalSchedule({
    type: "Twitch",
    get: () => getTwitchSchedule(access_token, providerAccountId, new Date()),
    filter,
    compare: (internal, external) => {
      const title = getFormattedTitle(internal, username);
      const date = internal.startAt.toISOString().replace(/\.\d+Z$/, "Z");
      return external.title === title && external.start_time === date;
    },
    create: (internal) =>
      createScheduleSegment(
        access_token,
        providerAccountId,
        internal.startAt,
        DATETIME_ALVEUS_ZONE,
        60,
        getFormattedTitle(internal, username),
      ).then(() => {}),
    remove: (external) =>
      removeScheduleSegment(access_token, providerAccountId, external.id),
  });
}

export async function syncDiscordEvents(guildId: string) {
  await syncExternalSchedule({
    type: "Discord",
    get: () => getScheduledGuildEvents(guildId),
    filter: () => true,
    compare: (internal, external) => {
      const title = getFormattedTitle(internal);
      const date = internal.startAt.toISOString().replace(/\.\d+Z$/, "+00:00");
      return (
        external.name === title &&
        external.entity_metadata.location === internal.link &&
        external.description === internal.description &&
        external.scheduled_start_time === date
      );
    },
    create: (internal) =>
      createScheduledGuildEvent(
        guildId,
        internal.startAt,
        new Date(internal.startAt.getTime() + 60 * 60 * 1000),
        getFormattedTitle(internal),
        internal.link,
        internal.description,
      ).then(() => new Promise((resolve) => setTimeout(resolve, 60_000 / 5))),
    remove: (external) =>
      removeScheduledGuildEvent(guildId, external.id).then(
        () => new Promise((resolve) => setTimeout(resolve, 60_000 / 5)),
      ),
  });
}
