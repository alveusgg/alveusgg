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
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <td
      className={classes(
        "flex min-h-8 flex-col gap-1 border border-alveus-green-900 p-1 md:min-h-24",
        className,
      )}
    >
      {children}
    </td>
  );
}

export function Schedule() {
  const [today, setToday] = useState<Date>();
  useEffect(() => {
    const now = new Date();
    setToday(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
  }, []);
  const startOfMonth = useMemo(
    () => today && new Date(today.getFullYear(), today.getMonth(), 1),
    [today],
  );
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

  if (events.isLoading || !today || !startOfMonth || !daysInMonth)
    return <p>Loading schedule...</p>;
  if (!events.data) return <p>No schedule is available currently.</p>;

  const startDay = 1; // 1 = Monday, 0 = Sunday
  const startOffset = (7 + startOfMonth.getDay() - startDay) % 7;
  const weeks = Math.ceil((startOffset + daysInMonth) / 7);

  return (
    <>
      <div className="flex items-baseline justify-between">
        <p className="text-5xl font-medium">
          {startOfMonth.toLocaleDateString("en-US", { month: "long" })}
        </p>
        <p className="text-2xl font-medium">{startOfMonth.getFullYear()}</p>
      </div>

      <table className="mt-2 grid grid-cols-1 overflow-hidden rounded-md border border-alveus-green-900 bg-alveus-green-100 shadow-lg md:mt-8 md:grid-cols-7">
        <thead className="contents">
          <tr className="contents">
            {/* Render the days of the week for desktop */}
            {Array.from({ length: 7 }, (_, i) => (
              <th
                key={i}
                className="hidden border border-alveus-green-900 bg-alveus-green-900 px-2 py-1 text-center font-bold uppercase text-alveus-tan md:block"
              >
                {days[(i + startDay) % 7]}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="contents">
          {Array.from({ length: weeks }, (_, week) => (
            <tr key={week} className="contents">
              {Array.from({ length: 7 }, (_, i) => {
                const date = i + 1 + week * 7 - startOffset;

                // Render empty cells for days outside of the month
                if (date < 1 || date > daysInMonth)
                  return (
                    <Day
                      key={date}
                      className="hidden bg-alveus-green-200 md:block"
                    />
                  );

                const fullDate = new Date(
                  startOfMonth.getFullYear(),
                  startOfMonth.getMonth(),
                  date,
                );
                const day = fullDate.getDay();
                const events =
                  byDay[fullDate.toISOString().split("T")[0] as string] || [];

                return (
                  <Day
                    key={date}
                    className={classes(
                      // On mobile, we'll position absolute the date + day of week
                      "relative pr-10 md:pr-1",
                      // On mobile, make the weekends have a darker background
                      (day === 0 || day === 6) &&
                        "bg-alveus-green-400 md:bg-transparent",
                    )}
                  >
                    <p
                      className={classes(
                        "absolute right-1 top-1 mb-auto flex justify-end gap-1 font-mono text-sm leading-none md:relative",
                        fullDate.getTime() < today.getTime() && "opacity-50",
                      )}
                    >
                      {date.toLocaleString("en-US", {
                        minimumIntegerDigits: 2,
                      })}

                      {/* Render the day of the week for mobile */}
                      <span className="md:hidden">
                        {days[fullDate.getDay()]?.slice(0, 1)}
                      </span>
                    </p>

                    {events.map((event) => (
                      <Link
                        key={event.id}
                        className={classes(
                          getColor(event.link),
                          "mb-auto block font-medium leading-none transition-colors text-stroke text-stroke-black text-stroke-4 paint-sfm",
                          fullDate.getTime() < today.getTime() && "opacity-50",
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
                  </Day>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}