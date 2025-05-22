import { getCalendarEvents } from "@/server/db/calendar-events";

import { getFormattedTitle } from "@/data/calendar-events";
import { channels } from "@/data/twitch";

import { DATETIME_ALVEUS_ZONE, formatDateTimeRelative } from "@/utils/datetime";

// API for chat bot
// Matches the implementation of src/components/overlay/Event.tsx
export async function GET() {
  try {
    // Get the next event for the Alveus channel within the next 3 days
    const now = new Date();
    const next = new Date(now);
    next.setDate(next.getDate() + 3);
    const upcoming = await getCalendarEvents({
      start: now,
      end: next,
    }).then((events) => events.find(channels.alveus.calendarEventFilter));

    const title =
      upcoming && getFormattedTitle(upcoming, channels.alveus.username, 30);
    const time =
      upcoming &&
      formatDateTimeRelative(
        upcoming.startAt,
        {
          style: "long",
          time: upcoming.hasTime ? "minutes" : undefined,
          timezone: upcoming.hasTime,
        },
        { zone: DATETIME_ALVEUS_ZONE },
      );

    return new Response(title && time ? `Upcoming: ${title} - ${time}` : "", {
      headers: {
        // Response can be cached for 1 minute
        "Cache-Control": "max-age=60, s-maxage=60, must-revalidate",
        "X-Generated-At": new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("Error getting upcoming event", err);
    return new Response("Upcoming event not available", { status: 500 });
  }
}
