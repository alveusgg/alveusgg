import { Transition } from "@headlessui/react";
import { DateTime } from "luxon";
import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useMemo,
  useState,
} from "react";

import "@bart-krakowski/get-week-info-polyfill";

import { classes } from "@/utils/classes";
import { trpc } from "@/utils/trpc";

import useToday from "@/hooks/today";

import IconArrowRight from "@/icons/IconArrowRight";

import { CalendarTimezoneSwitch } from "./CalendarTimezoneSwitch";

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

type CalendarTheme = {
  background: string;
  border: string;
  heading: string;
};

const getCalendarTheme = (month?: number): CalendarTheme => {
  // January: Winter
  if (month === 0)
    return {
      background:
        "bg-gradient-to-b from-blue-100 to-blue-400 text-alveus-green-900",
      border: "border-blue-900",
      heading: "bg-blue-900 text-alveus-tan",
    };

  // February: Valentine's Day
  if (month === 1)
    return {
      background:
        "bg-gradient-to-b from-pink-100 to-pink-400 text-alveus-green-900",
      border: "border-pink-900",
      heading: "bg-pink-900 text-alveus-tan",
    };

  // March: St. Patrick's Day
  if (month === 2)
    return {
      background:
        "bg-gradient-to-b from-green-200 to-green-600 text-alveus-green-900",
      border: "border-green-900",
      heading: "bg-green-900 text-alveus-tan",
    };

  // April: Blossom
  if (month === 3)
    return {
      background:
        "bg-gradient-to-b from-pink-200 via-pink-200 to-blue-100 text-alveus-green-900",
      border: "border-pink-900",
      heading: "bg-pink-900 text-alveus-tan",
    };

  // May: Spring
  if (month === 4)
    return {
      background:
        "bg-gradient-to-b from-blue-400 to-blue-100 text-alveus-green-900",
      border: "border-blue-900",
      heading: "bg-blue-900 text-alveus-tan",
    };

  // June: Summer
  if (month === 5)
    return {
      background:
        "bg-gradient-to-b from-green-400 via-green-200 to-blue-200 text-alveus-green-900",
      border: "border-green-900",
      heading: "bg-green-900 text-alveus-tan",
    };

  // June: Summer
  if (month === 6)
    return {
      background:
        "bg-gradient-to-b from-blue-400 via-blue-200 to-green-200 text-alveus-green-900",
      border: "border-blue-900",
      heading: "bg-blue-900 text-alveus-tan",
    };

  // August: Late Summer
  if (month === 7)
    return {
      background:
        "bg-gradient-to-b from-green-200 via-green-300 to-alveus-green-400 text-alveus-green-900",
      border: "border-alveus-green-900",
      heading: "bg-alveus-green-900 text-alveus-tan",
    };

  // September: Fall
  if (month === 8)
    return {
      background:
        "bg-gradient-to-b from-yellow-300 to-yellow-600 text-alveus-green-900",
      border: "border-alveus-tan-800",
      heading: "bg-alveus-tan-800 text-alveus-tan",
    };

  // October: Halloween
  if (month === 9)
    return {
      background:
        "bg-gradient-to-b from-yellow-400 to-alveus-tan-400 text-alveus-green-900",
      border: "border-blue-900",
      heading: "bg-blue-900 text-alveus-tan",
    };

  // November: Thanksgiving
  if (month === 10)
    return {
      background:
        "bg-gradient-to-b from-alveus-tan-300 to-alveus-tan-500 text-alveus-green-900",
      border: "border-alveus-tan-800",
      heading: "bg-alveus-tan-800 text-alveus-tan",
    };

  // December: Christmas
  if (month === 11)
    return {
      background:
        "bg-gradient-to-b from-green-600 to-green-300 text-alveus-green-900",
      border: "border-red-800",
      heading: "bg-red-800 text-alveus-tan",
    };

  // Default: Alveus standard colors
  return {
    background: "bg-alveus-green-100 text-alveus-green-900",
    border: "border-alveus-green-900",
    heading: "bg-alveus-green-900 text-alveus-tan",
  };
};

export type MonthSelection = DateTime;

export function useMonthSelection(timeZone: string, initialDate?: DateTime) {
  const [selected, setSelected] = useState<MonthSelection>(
    initialDate || DateTime.fromObject({ day: 1 }, { zone: timeZone }),
  );

  return [selected, setSelected] as const;
}

export function useCalendarEventsQuery(
  timeZone: string,
  { month, year }: MonthSelection,
) {
  const start = DateTime.fromObject(
    { month, year, day: 1 },
    { zone: timeZone },
  );

  const end = start.plus({ months: 1 });

  return trpc.calendarEvents.getCalendarEvents.useQuery(
    { start: start.toJSDate(), end: end.toJSDate() },
    { enabled: !!month && !!year },
  );
}

type DayProps = {
  children?: ReactNode;
  className?: string;
};

const Day = ({ children, className }: DayProps) => (
  <td
    className={classes(
      "flex min-h-8 flex-col gap-1 border p-1 transition-colors md:min-h-24",
      className,
    )}
  >
    {children}
  </td>
);

type CalendarEvent = {
  date: Date;
  hoist: boolean;
  children: ReactNode;
};

type CalendarProps = {
  events: CalendarEvent[];
  selectedDateTime: DateTime;
  loading?: boolean;
  onChange?: Dispatch<SetStateAction<MonthSelection>>;
  className?: string;
  children?: ReactNode;
  timeZone?: string;
  setTimeZone: Dispatch<SetStateAction<string>>;
};

const getDateKey = (date: DateTime, timeZone?: string) =>
  date.setZone(timeZone).startOf("day").toFormat("MM/dd/yyyy");

export function Calendar({
  events,
  selectedDateTime,
  loading = false,
  onChange,
  className,
  children,
  timeZone,
  setTimeZone,
}: CalendarProps) {
  const today = useToday(timeZone);
  const todayKey = today && getDateKey(today, timeZone);
  const daysInMonth = selectedDateTime.daysInMonth;

  const placeholders = useMemo(() => {
    const delay = [
      "animation-delay-0",
      "animation-delay-200",
      "animation-delay-300",
      "animation-delay-500",
      "animation-delay-700",
    ];
    const height = ["h-5", "h-10"];
    const days = Array.from({ length: daysInMonth! }, (_, i) => i);

    return Array.from({ length: 10 }, () => {
      const idx = Math.floor(Math.random() * days.length);
      const day = days.splice(idx, 1)[0] as number;
      return {
        date: DateTime.fromObject(
          {
            month: selectedDateTime.month,
            year: selectedDateTime.year,
            day: day + 1,
          },
          { zone: timeZone },
        )
          .startOf("day")
          .toJSDate(),
        hoist: false,
        children: (
          <Transition key={day} appear show>
            <div
              // Fade these in with a short delay before starting
              // Delay stops a flash of placeholders if we load quickly
              className={classes(
                "transition-delay-200 mb-auto block animate-pulse rounded-xs bg-gray-400/50 transition-opacity duration-500 data-[closed]:opacity-0",
                delay[Math.floor(Math.random() * delay.length)],
                height[Math.floor(Math.random() * height.length)],
              )}
            />
          </Transition>
        ),
      };
    });
  }, [selectedDateTime, daysInMonth, timeZone]);

  const byDay = useMemo(() => {
    const grouped = (loading ? placeholders : events).reduce<
      Record<string, CalendarEvent[]>
    >((acc, event) => {
      const dateKey = getDateKey(DateTime.fromJSDate(event.date), timeZone);
      acc[dateKey] ??= [];
      acc[dateKey].push(event);
      return acc;
    }, {});

    return Object.fromEntries(
      Object.entries(grouped).map(([date, events]) => [
        date,
        events.toSorted((a, b) => {
          // Hoisted events go first
          if (a.hoist && !b.hoist) return -1;
          if (!a.hoist && b.hoist) return 1;

          // Then sort by time
          return a.date.getTime() - b.date.getTime();
        }),
      ]),
    );
  }, [loading, placeholders, events, timeZone]);

  const theme = useMemo(
    () => getCalendarTheme(selectedDateTime.month - 1),
    [selectedDateTime.month],
  );

  if (!today || !selectedDateTime) return null;

  const locale = new Intl.Locale(
    Intl.DateTimeFormat().resolvedOptions().locale,
  );
  // Get first day of the week based on Locale.
  // Defaults to 7 if getWeekInfo is not supported.
  // 1 = Monday, 7 = Sunday.
  const startDay = locale.getWeekInfo?.()?.firstDay ?? 7;
  const startOffset = (7 + selectedDateTime.weekday - startDay) % 7; // Luxon uses 1-based days
  const weeks = Math.ceil((startOffset + daysInMonth!) / 7);

  return (
    <div className={classes("flex flex-col gap-2 md:gap-6", className)}>
      <div className="flex flex-col gap-4 sm:gap-2">
        <div className="flex items-baseline justify-between">
          <p className="text-5xl font-medium">
            {selectedDateTime.setLocale("en-US").monthLong}
          </p>
          <p className="text-2xl font-medium">{selectedDateTime.year}</p>
        </div>

        {onChange && (
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => onChange(selectedDateTime.minus({ month: 1 }))}
              className="transition-colors hover:text-alveus-green-400"
            >
              <IconArrowRight className="size-6 rotate-180" />
            </button>

            <CalendarTimezoneSwitch
              onChange={(tz) => setTimeZone(tz)}
              timeZone={timeZone}
            />

            <button
              type="button"
              onClick={() => onChange(selectedDateTime.plus({ month: 1 }))}
              className="transition-colors hover:text-alveus-green-400"
            >
              <IconArrowRight className="size-6" />
            </button>
          </div>
        )}
      </div>

      <table
        className={classes(
          "grid grid-cols-1 overflow-hidden rounded-md border shadow-lg transition-colors md:grid-cols-7",
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
                  "hidden border px-2 py-1 text-center font-bold uppercase transition-colors md:block",
                  i === 0 && "rounded-tl-sm",
                  i === 6 && "rounded-tr-sm",
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

                // If we're on the first week, and the first day of the month, round on mobile
                // If we're on the last week, and the last day of the month, round on mobile
                // If we're on the last week, and the first or last day of the row, round on mobile
                const firstWk = week === 0;
                const lastWk = week === weeks - 1;
                const rounded = classes(
                  firstWk && date === 1 && "rounded-t-sm md:rounded-none",
                  lastWk &&
                    date === daysInMonth &&
                    "rounded-b-sm md:rounded-none",
                  lastWk && i === 0 && "md:rounded-bl-sm",
                  lastWk && i === 6 && "md:rounded-br-sm",
                );

                // Render empty cells for days outside of the month
                if (date < 1 || date > daysInMonth!)
                  return (
                    <Day
                      key={date}
                      className={classes(
                        "hidden bg-black/10 md:block",
                        theme.border,
                        rounded,
                      )}
                    />
                  );

                const fullDate = DateTime.fromObject(
                  {
                    month: selectedDateTime.month,
                    year: selectedDateTime.year,
                    day: date,
                  },
                  { zone: timeZone },
                );

                const dateKey = getDateKey(fullDate, timeZone);
                const events = byDay[dateKey] || [];

                const day = fullDate.weekday;
                const isPast = fullDate.startOf("day") < today;
                const isToday = dateKey === todayKey;

                const paddedDate = String(date).padStart(2, "0");

                return (
                  <Day
                    key={date}
                    className={classes(
                      // On mobile, we'll position absolute the date + day of week
                      "relative pr-12 md:pr-1",
                      // On mobile, make the weekends have a darker background
                      (day === 6 || day === 7) &&
                        "bg-black/15 md:bg-transparent",
                      theme.border,
                      rounded,
                    )}
                  >
                    <div className="absolute top-0 right-0 mb-auto flex justify-end md:relative">
                      <p
                        className={classes(
                          "flex gap-1 rounded-bl-lg px-1.5 pt-1.5 pb-1 font-mono text-sm leading-none md:-mt-1 md:-mr-1",
                          isPast && "opacity-50",
                          isToday && theme.heading,
                        )}
                      >
                        {paddedDate}
                        {/* Render the day of the week for mobile */}
                        <span className="md:hidden">
                          {days[(i + startDay) % 7]?.charAt(0)}
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
}
