import { useMemo } from "react";
import { Transition } from "@headlessui/react";

import { standardCategories } from "@/data/calendar-events";

import { classes } from "@/utils/classes";
import { getShortBaseUrl } from "@/utils/short-url";
import { typeSafeObjectEntries } from "@/utils/helpers";

import Link from "@/components/content/Link";
import {
  Calendar,
  useCalendarEventsQuery,
  useMonthSelection,
} from "@/components/calendar/Calendar";
import { CalendarItem } from "@/components/calendar/CalendarItem";

import IconExternal from "@/icons/IconExternal";

import useTimezone from "@/hooks/timezone";
import useToday from "@/hooks/today";

const groupedCategories = standardCategories.reduce(
  (acc, category) => {
    const group = category.name.split(" ")[0]!;
    return {
      ...acc,
      [group]: [...(acc[group] || []), category],
    };
  },
  {} as Record<string, { name: string; color: string }[]>,
);

const webcalUrls: Record<string, string> = {
  Alveus: `${getShortBaseUrl().replace(/^((https?:)?\/\/)?/, "webcal://")}/updates/ical`,
};

export function Schedule() {
  const [timeZone, setTimeZone] = useTimezone();
  const today = useToday(timeZone);
  const [selected, setSelected] = useMonthSelection(timeZone, today);
  const events = useCalendarEventsQuery(timeZone, selected);
  const eventsWithChildren = useMemo(
    () =>
      today &&
      events.data?.map((event) => ({
        date: event.startAt,
        children: (
          <CalendarItem
            key={event.id}
            event={event}
            today={today}
            href={event.link}
            timeZone={timeZone}
            external
          />
        ),
      })),
    [today, events.data, timeZone],
  );

  if (!selected) return null;

  return (
    <Calendar
      events={eventsWithChildren || []}
      selectedDateTime={selected}
      loading={events.isPending}
      onChange={setSelected}
      className="mt-2 md:mt-6"
      timeZone={timeZone}
      setTimeZone={setTimeZone}
    >
      <div className="flex justify-between gap-2 italic opacity-50">
        <p>
          Events and dates/times are subject to change. Enable notifications to
          know when streams go live.
        </p>

        <Transition show={events.isPending}>
          <p className="animate-pulse transition-opacity duration-300 data-[closed]:animate-none data-[closed]:opacity-0">
            Loading...
          </p>
        </Transition>
      </div>

      {typeSafeObjectEntries(groupedCategories).map(([group, categories]) => (
        <div key={group}>
          <div className="mb-1 flex flex-wrap items-end justify-end gap-2">
            <h4 className="mr-auto text-lg font-bold">{group}</h4>

            {webcalUrls[group] && (
              <>
                <Link
                  custom
                  external
                  className="rounded-lg bg-alveus-green px-2 py-1 text-sm text-alveus-tan transition-colors hover:bg-alveus-green-800"
                  href={`https://calendar.google.com/calendar/render?cid=${webcalUrls[group]}`}
                >
                  Add to Google Calendar
                  <IconExternal
                    size="1em"
                    className="-mb-0.5 ml-1 mr-0.5 inline-block align-baseline"
                  />
                </Link>
                <input
                  readOnly={true}
                  type="url"
                  className="box-content min-w-0 rounded-lg bg-alveus-green-800 p-1 text-center text-sm italic text-alveus-tan outline-none"
                  value={webcalUrls[group]}
                  onClick={(e) =>
                    e.currentTarget.setSelectionRange(
                      0,
                      e.currentTarget.value.length,
                    )
                  }
                  ref={(input) => {
                    if (!input) return;
                    input.style.width = "0";
                    input.style.width = `${input.scrollWidth}px`;
                  }}
                />
              </>
            )}
          </div>

          <div className="grid grid-cols-1 gap-x-4 gap-y-1 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <div key={category.name} className="flex items-center gap-2">
                <div
                  className={classes(
                    category.color,
                    "rounded-md p-2 shadow-sm",
                  )}
                />
                <p className="flex-shrink-0 opacity-75">{category.name}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </Calendar>
  );
}
