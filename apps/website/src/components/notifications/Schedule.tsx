import { type ReactNode, useEffect, useMemo, useState } from "react";

import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/trpc/router/_app";

import { trpc } from "@/utils/trpc";
import { classes } from "@/utils/classes";

import Link from "@/components/content/Link";
import IconArrowRight from "@/icons/IconArrowRight";

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
  children?: ReactNode;
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
  const [month, setMonth] = useState<[number, number]>();
  useEffect(() => {
    const now = new Date();
    setToday(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
    setMonth([now.getFullYear(), now.getMonth()]);
  }, []);
  const currentMonth = useMemo(
    () => month && new Date(month[0], month[1], 1),
    [month],
  );
  const nextMonth = useMemo(
    () => month && new Date(month[0], month[1] + 1, 1),
    [month],
  );
  const daysInMonth = useMemo(
    () =>
      currentMonth &&
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        0,
      ).getDate(),
    [currentMonth],
  );

  const events = trpc.calendarEvents.getCalendarEvents.useQuery(
    { start: currentMonth, end: nextMonth },
    { enabled: currentMonth !== undefined && nextMonth !== undefined },
  );

  const byDay = useMemo(
    () =>
      events.data?.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
        const date = `${event.startAt.getFullYear()}-${event.startAt.getMonth()}-${event.startAt.getDate()}`;
        return { ...acc, [date]: [...(acc[date] || []), event] };
      }, {}) || {},
    [events.data],
  );

  if (events.isLoading || !today || !currentMonth || !daysInMonth)
    return <p>Loading schedule...</p>;
  if (!events.data) return <p>No schedule is available currently.</p>;

  const startDay = 1; // 1 = Monday, 0 = Sunday
  const startOffset = (7 + currentMonth.getDay() - startDay) % 7;
  const weeks = Math.ceil((startOffset + daysInMonth) / 7);

  return (
    <div className="mt-2 flex flex-col gap-2 md:mt-6 md:gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <p className="text-5xl font-medium">
            {currentMonth.toLocaleDateString("en-US", { month: "long" })}
          </p>
          <p className="text-2xl font-medium">{currentMonth.getFullYear()}</p>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={() =>
              setMonth(
                (prev) =>
                  prev &&
                  (prev[1] > 0 ? [prev[0], prev[1] - 1] : [prev[0] - 1, 11]),
              )
            }
            className="transition-colors hover:text-alveus-green-400"
          >
            <IconArrowRight className="h-6 w-6 rotate-180 transform" />
          </button>
          <button
            type="button"
            onClick={() =>
              setMonth(
                (prev) =>
                  prev &&
                  (prev[1] < 11 ? [prev[0], prev[1] + 1] : [prev[0] + 1, 0]),
              )
            }
            className="transition-colors hover:text-alveus-green-400"
          >
            <IconArrowRight className="h-6 w-6" />
          </button>
        </div>
      </div>

      <table className="grid grid-cols-1 overflow-hidden rounded-md border border-alveus-green-900 bg-alveus-green-100 shadow-lg md:grid-cols-7">
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
                  currentMonth.getFullYear(),
                  currentMonth.getMonth(),
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
                      {date.toLocaleString(undefined, {
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
                          {event.startAt.toLocaleTimeString(undefined, {
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
    </div>
  );
}
