import { useEffect, useMemo, useState } from "react";

import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/trpc/router/_app";

import { trpc } from "@/utils/trpc";
import { classes } from "@/utils/classes";

import Link from "@/components/content/Link";

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
    return "bg-gray-200 hover:bg-gray-400";
  if (normalized.includes("twitch.tv/alveussanctuary"))
    return "bg-yellow-400 hover:bg-yellow-600";
  if (normalized.includes("youtube.com") || normalized.includes("youtu.be"))
    return "bg-red-300 hover:bg-red-500";

  return "bg-blue-300 hover:bg-blue-500";
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
        const date = `${event.startAt.getFullYear()}-${event.startAt.getMonth()}-${event.startAt.getDate()}`;
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
      <div className="my-2 flex items-baseline justify-between md:my-6">
        <p className="text-5xl font-medium">
          {startOfMonth.toLocaleDateString("en-US", { month: "long" })}
        </p>
        <p className="text-2xl font-medium">{startOfMonth.getFullYear()}</p>
      </div>

      <table className="my-2 grid grid-cols-1 overflow-hidden rounded-md border border-alveus-green-900 bg-alveus-green-100 shadow-lg md:my-6 md:grid-cols-7">
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
                  byDay[
                    `${fullDate.getFullYear()}-${fullDate.getMonth()}-${fullDate.getDate()}`
                  ] || [];

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
                        "absolute right-1 top-1 mb-auto flex justify-end gap-1 pb-1 font-mono text-sm leading-none md:relative",
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
                          "mb-auto block rounded-sm p-1 leading-none transition-colors",
                          fullDate.getTime() < today.getTime() && "opacity-50",
                        )}
                        href={event.link}
                        custom
                        external
                      >
                        <p className="font-semibold">{event.title}</p>
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

      <p className="italic opacity-50">
        Events and dates/times are subject to change. Enable notifications to
        know when streams go live.
      </p>
    </>
  );
}
