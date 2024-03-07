import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/trpc/router/_app";

import { trpc } from "@/utils/trpc";
import { classes } from "@/utils/classes";

type RouterOutput = inferRouterOutputs<AppRouter>;
type CalendarEvent =
  RouterOutput["calendarEvents"]["getCalendarEvents"][number];

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const getColor = (link: string) => {
  const normalized = link.toLowerCase();

  if (normalized.includes("twitch.tv/maya"))
    return "text-white hover:text-gray-300";
  if (normalized.includes("twitch.tv/alveussanctuary"))
    return "text-yellow-600 hover:text-yellow-300";
  if (normalized.includes("youtube.com") || normalized.includes("youtu.be"))
    return "text-red-400 hover:text-red-100";

  return "text-blue-400 hover:text-blue-100";
};

function Day({
  day,
  events = [],
  className,
}: {
  day?: number;
  events?: CalendarEvent[];
  className?: string;
}) {
  return (
    <div
      className={classes(
        "flex min-h-8 flex-col gap-1 border border-alveus-green-900 p-1 md:min-h-24",
        className,
      )}
    >
      {day !== undefined && (
        <p className="mb-auto text-right font-mono text-sm leading-none">
          {day}
        </p>
      )}
      {events.map((event) => (
        <Link
          key={event.id}
          className={classes(
            getColor(event.link),
            "mb-auto block font-medium leading-none transition-colors text-stroke text-stroke-black text-stroke-4 paint-sfm",
          )}
          href={event.link}
        >
          <p>{event.title}</p>
          <p className="text-sm tabular-nums">
            {event.startAt.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              timeZoneName: "short",
            })}
          </p>
        </Link>
      ))}
    </div>
  );
}

export function Schedule() {
  const [startOfMonth, setStartOfMonth] = useState<Date>();
  useEffect(() => {
    setStartOfMonth(new Date(new Date().setDate(1)));
  }, []);
  const daysInMonth = useMemo(
    () =>
      startOfMonth &&
      new Date(
        startOfMonth.getFullYear(),
        startOfMonth.getMonth() + 1,
        0,
      ).getDate(),
    [startOfMonth],
  );

  const events = trpc.calendarEvents.getCalendarEvents.useQuery({
    start: startOfMonth,
  });

  const byDay = useMemo(
    () =>
      events.data?.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
        const date = event.startAt.toISOString().split("T")[0] as string;
        return { ...acc, [date]: [...(acc[date] || []), event] };
      }, {}) || {},
    [events.data],
  );

  if (events.isLoading || !startOfMonth || !daysInMonth)
    return <p>Loading schedule...</p>;
  if (!events.data) return <p>No schedule is available currently.</p>;

  const startDay = 1; // 1 = Monday, 0 = Sunday
  const startOffset = startOfMonth.getDay() - startDay;
  const endOffset = (7 - ((startOffset + daysInMonth) % 7)) % 7;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <p className="text-5xl font-medium">
          {startOfMonth.toLocaleDateString("en-US", { month: "long" })}
        </p>
        <p className="text-2xl font-medium">{startOfMonth.getFullYear()}</p>
      </div>

      {/* Render the days of the week */}
      {/* Separate grid as we don't want these to match the cell height */}
      <div className="mt-8 hidden grid-cols-7 rounded-t-md border border-alveus-green-900 bg-alveus-green-900 text-center font-bold uppercase text-alveus-tan md:grid">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="px-2 py-1">
            {days[(i + startDay) % 7]}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 rounded-b-md border border-alveus-green-900 bg-alveus-green-100 shadow-lg md:auto-rows-fr md:grid-cols-7">
        {/* Render empty cells for days in the previous month */}
        {Array.from({ length: startOffset }, (_, i) => (
          <Day key={i} className="hidden bg-alveus-green-200 md:block" />
        ))}

        {/* Render a cell for each day in this month */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const date = new Date(
            startOfMonth.getFullYear(),
            startOfMonth.getMonth(),
            day,
          );
          const dateString = date.toISOString().split("T")[0] as string;

          return (
            <Fragment key={dateString}>
              {/* If this is the start of the week, we also want the day in here for mobile */}
              {date.getDay() === startDay && (
                <div className="bg-alveus-green-700 px-2 py-1 text-center text-sm font-bold uppercase text-alveus-tan md:hidden">
                  {days[startDay]}
                </div>
              )}

              <Day day={day} events={byDay[dateString] || []} />
            </Fragment>
          );
        })}

        {/* Render empty cells for days in the next month */}
        {Array.from({ length: endOffset }, (_, i) => (
          <Day key={i} className="hidden bg-alveus-green-200 md:block" />
        ))}
      </div>
    </div>
  );
}
