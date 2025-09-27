import { DateTime } from "luxon";
import { z } from "zod";

import ambassadors from "@alveusgg/data/build/ambassadors/core";
import {
  type ActiveAmbassador,
  type ActiveAmbassadorKey,
  isActiveAmbassadorEntry,
} from "@alveusgg/data/build/ambassadors/filters";

import { type CalendarEvent, prisma } from "@alveusgg/database";

import {
  createScheduledGuildEvent,
  editScheduledGuildEvent,
  getScheduledGuildEvents,
  removeScheduledGuildEvent,
} from "@/server/apis/discord";
import {
  type ScheduleSegment,
  createScheduleSegment,
  getScheduleSegments,
  removeScheduleSegment,
} from "@/server/apis/twitch";

import { getFormattedTitle, regularEventsWeekly } from "@/data/calendar-events";
import { type ChannelWithCalendarEvents, channels } from "@/data/twitch";

import { typeSafeObjectEntries } from "@/utils/helpers";
import { getShortBaseUrl } from "@/utils/short-url";
import { camelToKebab } from "@/utils/string-case";
import { DATETIME_ALVEUS_ZONE } from "@/utils/timezone";

export const calendarEventSchema = z.object({
  title: z.string().min(1),
  category: z.string().min(1),
  description: z.string().min(1).nullable(),
  link: z.url(),
  startAt: z.date(),
  hasTime: z.boolean().default(true),
});

export type CalendarEventSchema = z.infer<typeof calendarEventSchema>;

export const existingCalendarEventSchema = calendarEventSchema.and(
  z.object({
    id: z.cuid(),
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
    const events = regularEventsWeekly[date.weekday - 1]?.slice() || [];

    const birthdays =
      ambassadorBirthdays[
        `${date.month.toString().padStart(2, "0")}-${date.day.toString().padStart(2, "0")}`
      ] || [];
    for (const [name, ambassador] of birthdays) {
      events.push({
        title: `${ambassador.name}'s Birthday`,
        description: `Wish ${ambassador.name} a happy birthday!`,
        category: "Alveus Ambassador Birthday",
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
  compare: (
    internal: CalendarEvent,
    external: ExternalEvent,
  ) => null | "partial" | "exact";
  create: (event: CalendarEvent) => Promise<void>;
  edit: (internal: CalendarEvent, external: ExternalEvent) => Promise<void>;
  remove: (event: ExternalEvent) => Promise<void>;
}

async function syncExternalSchedule<ExternalEvent>(
  calendar: ExternalCalendar<ExternalEvent>,
) {
  // Get all the database events that we need to sync
  // Look ahead to the end of the next month, ensuring we cover all regular events when they're generated
  const internalEvents = await getCalendarEvents({
    start: new Date(),
    end: DateTime.now().plus({ months: 2 }).startOf("month").toJSDate(),
    hasTime: true,
  }).then((events) => new Set(events.filter(calendar.filter)));

  // Get all the existing events from the external service
  // We'll use the tuple to track any partial matches
  const externalEvents = await calendar
    .get()
    .then(
      (events) =>
        new Map(
          events.map(
            (event) => [event, []] as [ExternalEvent, CalendarEvent[]],
          ),
        ),
    );

  // Iterate over each internal event to find matches in external events
  for (const internal of internalEvents) {
    for (const [external, partialMatches] of externalEvents) {
      const comparison = calendar.compare(internal, external);

      // If this is an exact match, we don't need to think about this event pair again
      if (comparison === "exact") {
        console.log(
          `Skipping ${calendar.type} external event:`,
          internal,
          external,
        );
        externalEvents.delete(external);
        internalEvents.delete(internal);
        break;
      }

      // If this is a partial match, track it for later
      if (comparison === "partial") {
        partialMatches.push(internal);
      }
    }
  }

  // Walk through each of the remaining external events and their partial matches
  // Start with the least partial matches to give us the best chance of finding a match for each
  const sortedExternalEvents = Array.from(externalEvents.entries()).sort(
    (a, b) => a[1].length - b[1].length,
  );
  for (const [external, partialMatches] of sortedExternalEvents) {
    let match = false;

    for (const internal of partialMatches) {
      // If this internal event has already been synced, skip it
      if (!internalEvents.has(internal)) continue;

      console.log(
        `Editing ${calendar.type} external event:`,
        internal,
        external,
      );
      try {
        await calendar.edit(internal, external);
        internalEvents.delete(internal);
        match = true;
        break;
      } catch (err) {
        console.error(`Failed to edit ${calendar.type} external event:`, err);
      }
    }

    // If there were no matches for this external event, remove it
    if (!match) {
      console.log(`Removing ${calendar.type} external event:`, external);
      try {
        await calendar.remove(external);
      } catch (err) {
        console.error(`Failed to remove ${calendar.type} external event:`, err);
      }
    }
  }

  // Finally, for any internal events that we haven't synced, create them
  for (const internal of internalEvents) {
    console.log(`Creating ${calendar.type} external event:`, internal);
    try {
      await calendar.create(internal);
    } catch (err) {
      console.error(`Failed to create ${calendar.type} external event:`, err);
    }
  }
}

export async function syncTwitchSchedule(channel: ChannelWithCalendarEvents) {
  const { username, calendarEventFilter } = channels[channel];
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
    filter: calendarEventFilter,
    compare: (internal, external) => {
      const title = getFormattedTitle(internal, username);
      const date = internal.startAt.toISOString().replace(/\.\d+Z$/, "Z");
      return external.title === title && external.start_time === date
        ? "exact"
        : null;
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
    edit: () => Promise.resolve(),
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
      const date = internal.startAt.toISOString().replace(/\.\d+Z$/, "+00:00");
      const title = external.name.split(" @ ")[0] || "";

      const titleMatch = title === internal.title;
      const linkMatch = external.entity_metadata.location === internal.link;
      const descriptionMatch = external.description === internal.description;
      const dateMatch = external.scheduled_start_time === date;

      // Handle exact matches, which require no changes to the external event
      if (titleMatch && linkMatch && descriptionMatch && dateMatch) {
        return "exact";
      }

      // If the title matches, but the date or another field doesn't, we'll consider it a partial match
      if (titleMatch) {
        return "partial";
      }

      // If the title is a close match, and one other field matches, we'll consider it a partial match
      // This handles cases where whitespace, capitalization, or punctuation might've changed in the event name
      // TODO: We may want to think about using levenshtein distance or similar for this?
      const titleCloseMatch =
        title.toLowerCase().replace(/[^a-z]/g, "") ===
        internal.title.toLowerCase().replace(/[^a-z]/g, "");
      if (
        titleCloseMatch &&
        (linkMatch || (internal.description && descriptionMatch) || dateMatch)
      ) {
        return "partial";
      }

      return null;
    },
    create: (internal) =>
      createScheduledGuildEvent(guildId, {
        start: internal.startAt,
        end: new Date(internal.startAt.getTime() + 60 * 60 * 1000),
        name: getFormattedTitle(internal),
        location: internal.link,
        description: internal.description,
      }).then(() => new Promise((resolve) => setTimeout(resolve, 60_000 / 5))),
    edit: (internal, external) =>
      editScheduledGuildEvent(guildId, external.id, {
        start: internal.startAt,
        end: new Date(internal.startAt.getTime() + 60 * 60 * 1000),
        name: getFormattedTitle(internal),
        location: internal.link,
        description: internal.description,
      }).then(() => new Promise((resolve) => setTimeout(resolve, 60_000 / 5))),
    remove: (external) =>
      removeScheduledGuildEvent(guildId, external.id).then(
        () => new Promise((resolve) => setTimeout(resolve, 60_000 / 5)),
      ),
  });
}
