import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Transition } from "@headlessui/react";

import { classes } from "@/utils/classes";

import IconArrowRight from "@/icons/IconArrowRight";

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const getEventLinkColor = (link: string): string => {
  const normalized = link.toLowerCase();

  if (normalized.includes("twitch.tv/maya"))
    return "bg-gray-200 hover:bg-gray-400";
  if (normalized.includes("twitch.tv/alveussanctuary"))
    return "bg-yellow-400 hover:bg-yellow-600";
  if (normalized.includes("youtube.com") || normalized.includes("youtu.be"))
    return "bg-red-300 hover:bg-red-500";

  return "bg-blue-300 hover:bg-blue-500";
};

type CalendarTheme = {
  background: string;
  border: string;
  heading: string;
};

const getCalendarTheme = (month?: number): CalendarTheme => {
  // January: Winter
  // if (month === 0) return {}

  // February: Valentine's Day
  // if (month === 1) return {}

  return {
    background: "bg-alveus-green-100 text-alveus-green-900",
    border: "border-alveus-green-900",
    heading: "bg-alveus-green-900 text-alveus-tan",
  };
};

type DayProps = {
  children?: ReactNode;
  className?: string;
};

const Day = ({ children, className }: DayProps) => (
  <td
    className={classes(
      "flex min-h-8 flex-col gap-1 border p-1 md:min-h-24",
      className,
    )}
  >
    {children}
  </td>
);

type CalendarEvent = {
  date: Date;
  children: ReactNode;
};

type Month = number;
type Year = number;

type CalendarProps = {
  events: CalendarEvent[];
  month: Month;
  year: Year;
  loading?: boolean;
  onChange?: ({ year, month }: { year: Year; month: Month }) => void;
  className?: string;
  children?: ReactNode;
};

const Calendar = ({
  events,
  month,
  year,
  loading = false,
  onChange,
  className,
  children,
}: CalendarProps) => {
  const [today, setToday] = useState<Date>();
  useEffect(() => {
    const now = new Date();
    setToday(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
  }, []);
  const currentMonth = useMemo(() => new Date(year, month, 1), [month, year]);
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

  const placeholders = useMemo(() => {
    const delay = [
      "animation-delay-0",
      "animation-delay-200",
      "animation-delay-300",
      "animation-delay-500",
      "animation-delay-700",
    ];
    const height = ["h-5", "h-10"];
    const days = Array.from({ length: daysInMonth }, (_, i) => i);
    return Array.from({ length: 10 }, () => {
      const idx = Math.floor(Math.random() * days.length);
      const day = days.splice(idx, 1)[0] as number;
      return {
        date: new Date(year, month, day + 1),
        children: (
          <Transition
            appear
            show
            // Fade these in with a short delay before starting
            // Delay stops a flash of placeholders if we load quickly
            enter="transition-opacity duration-500 transition-delay-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
          >
            <div
              className={classes(
                "mb-auto block animate-pulse rounded-sm bg-gray-400/50",
                delay[Math.floor(Math.random() * delay.length)],
                height[Math.floor(Math.random() * height.length)],
              )}
            />
          </Transition>
        ),
      };
    });
  }, [daysInMonth, month, year]);

  const byDay = useMemo(
    () =>
      (loading ? [...placeholders] : [...events])
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .reduce<Record<string, CalendarEvent[]>>((acc, event) => {
          const date = `${event.date.getFullYear()}-${event.date.getMonth()}-${event.date.getDate()}`;
          return { ...acc, [date]: [...(acc[date] || []), event] };
        }, {}) || {},
    [loading, placeholders, events],
  );

  const theme = useMemo(() => getCalendarTheme(month), [month]);

  if (!today || !currentMonth || !daysInMonth) return null;

  const startDay = 1; // 1 = Monday, 0 = Sunday
  const startOffset = (7 + currentMonth.getDay() - startDay) % 7;
  const weeks = Math.ceil((startOffset + daysInMonth) / 7);

  return (
    <div className={classes("flex flex-col gap-2 md:gap-6", className)}>
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <p className="text-5xl font-medium">
            {currentMonth.toLocaleDateString("en-US", { month: "long" })}
          </p>
          <p className="text-2xl font-medium">{currentMonth.getFullYear()}</p>
        </div>

        {onChange && (
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() =>
                onChange(
                  month === 0
                    ? { year: year - 1, month: 11 }
                    : { year, month: month - 1 },
                )
              }
              className="transition-colors hover:text-alveus-green-400"
            >
              <IconArrowRight className="h-6 w-6 rotate-180 transform" />
            </button>
            <button
              type="button"
              onClick={() =>
                onChange(
                  month === 11
                    ? { year: year + 1, month: 0 }
                    : { year, month: month + 1 },
                )
              }
              className="transition-colors hover:text-alveus-green-400"
            >
              <IconArrowRight className="h-6 w-6" />
            </button>
          </div>
        )}
      </div>

      <table
        className={classes(
          "grid grid-cols-1 overflow-hidden rounded-md border shadow-lg md:grid-cols-7",
          theme.background,
          theme.border,
        )}
      >
        <thead className="contents">
          <tr className="contents">
            {/* Render the days of the week for desktop */}
            {Array.from({ length: 7 }, (_, i) => (
              <th
                key={i}
                className={classes(
                  "hidden border px-2 py-1 text-center font-bold uppercase md:block",
                  theme.heading,
                  theme.border,
                )}
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
                      className={classes(
                        "hidden bg-black/10 md:block",
                        theme.border,
                      )}
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
                      "relative pr-12 md:pr-1",
                      // On mobile, make the weekends have a darker background
                      (day === 0 || day === 6) &&
                        "bg-black/15 md:bg-transparent",
                      theme.border,
                    )}
                  >
                    <div className="absolute right-0 top-0 mb-auto flex justify-end md:relative">
                      <p
                        className={classes(
                          "flex gap-1 rounded-bl-lg px-1.5 pb-1 pt-1.5 font-mono text-sm leading-none md:-mr-1 md:-mt-1",
                          // Fade out days in the past
                          fullDate.getTime() < today.getTime() && "opacity-50",
                          // Show the current day in a pill
                          fullDate.getTime() === today.getTime() &&
                            theme.heading,
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
                    </div>

                    {events.map((event) => event.children)}
                  </Day>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {children}
    </div>
  );
};

export default Calendar;
