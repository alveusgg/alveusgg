import { Transition } from "@headlessui/react";
import { Fragment, useMemo, useState } from "react";

import { standardCategories } from "@/data/calendar-events";
import { channels, isChannelWithCalendarEvents } from "@/data/twitch";

import { classes } from "@/utils/classes";
import { typeSafeObjectEntries, typeSafeObjectKeys } from "@/utils/helpers";
import { getShortBaseUrl } from "@/utils/short-url";
import { sentenceToTitle } from "@/utils/string-case";

import useTimezone from "@/hooks/timezone";
import useToday from "@/hooks/today";

import {
  Calendar,
  useCalendarEventsQuery,
  useMonthSelection,
} from "@/components/calendar/Calendar";
import { CalendarItem } from "@/components/calendar/CalendarItem";
import Link from "@/components/content/Link";

import IconExternal from "@/icons/IconExternal";
import IconPlus from "@/icons/IconPlus";
import IconSync from "@/icons/IconSync";
import IconTrash from "@/icons/IconTrash";

const groupedCategories = standardCategories.reduce(
  (acc, category) => {
    const group = category.name.split(" ")[0]!.toLowerCase();
    return {
      ...acc,
      [group]: [...(acc[group] || []), category],
    };
  },
  {} as Record<string, { name: string; color: string }[]>,
);

const webcalUrls = typeSafeObjectKeys(channels)
  .filter(isChannelWithCalendarEvents)
  .reduce(
    (acc, key) => ({
      ...acc,
      [key]: `${getShortBaseUrl().replace(/^((https?:)?\/\/)?/, "webcal://")}/updates/ical${key === "alveus" ? "" : `/${key}`}`,
    }),
    {} as Record<string, string>,
  );

const selectionButtonClasses =
  "flex items-center gap-2 p-1 text-sm leading-none text-alveus-green-500 transition-colors hover:text-alveus-green-800";

export function Schedule() {
  const [timeZone, setTimeZone] = useTimezone();
  const today = useToday(timeZone);
  const [selected, setSelected] = useMonthSelection(timeZone, today);
  const [categories, setCategories] = useState<Set<string>>(new Set());
  const events = useCalendarEventsQuery(timeZone, selected);
  const eventsWithChildren = useMemo(
    () =>
      today &&
      events.data
        ?.filter((event) => !categories.size || categories.has(event.category))
        .map((event) => ({
          date: event.startAt,
          hoist: !event.hasTime,
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
    [today, events.data, categories, timeZone],
  );

  if (!selected) return null;

  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-2 xl:grid-cols-3">
      <Calendar
        events={eventsWithChildren || []}
        selectedDateTime={selected}
        loading={events.isPending}
        onChange={setSelected}
        className="mt-2 md:mt-6 xl:col-span-2"
        timeZone={timeZone}
        setTimeZone={setTimeZone}
      >
        <div className="flex justify-between gap-2 italic opacity-50">
          <p>
            Events and dates/times are subject to change. Enable notifications
            to know when streams go live.
          </p>

          <Transition show={events.isPending}>
            <p className="animate-pulse transition-opacity duration-300 data-[closed]:animate-none data-[closed]:opacity-0">
              Loading...
            </p>
          </Transition>
        </div>
      </Calendar>

      <div className="flex flex-col gap-4 xl:pt-32">
        {typeSafeObjectEntries(groupedCategories).map(([group, grouped]) => (
          <Fragment key={group}>
            <div className="flex flex-col gap-2">
              <h4 className="text-lg font-bold">{sentenceToTitle(group)}</h4>

              {webcalUrls[group] && (
                <div className="flex flex-wrap gap-2">
                  <Link
                    custom
                    external
                    className="rounded-lg bg-alveus-green px-2 py-1 text-sm text-alveus-tan transition-colors hover:bg-alveus-green-800"
                    href={`https://calendar.google.com/calendar/render?cid=${webcalUrls[group]}`}
                  >
                    Add to Google Calendar
                    <IconExternal
                      size="1em"
                      className="mr-0.5 -mb-0.5 ml-1 inline-block align-baseline"
                    />
                  </Link>
                  <input
                    readOnly={true}
                    type="url"
                    className="box-content min-w-0 rounded-lg bg-alveus-green-800 p-1 text-center text-sm text-alveus-tan italic outline-hidden"
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
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-x-4 gap-y-1 md:grid-cols-2 xl:grid-cols-1">
              {grouped.map((category) => (
                <label
                  key={category.name}
                  className="group flex cursor-pointer items-center gap-2"
                >
                  <input
                    type="checkbox"
                    checked={categories.has(category.name)}
                    onChange={(e) => {
                      const newCategories = new Set(categories);
                      if (e.currentTarget.checked) {
                        newCategories.add(category.name);
                      } else {
                        newCategories.delete(category.name);
                      }
                      setCategories(newCategories);
                    }}
                    className="sr-only"
                  />

                  <div
                    className={classes(
                      category.color,
                      "rounded-md border-2 p-1 group-hover:border-black/20",
                      categories.has(category.name)
                        ? "border-black/20"
                        : "border-black/10",
                    )}
                  >
                    <div
                      className={classes(
                        "h-2 w-2 rounded-full",
                        categories.has(category.name)
                          ? "bg-black/25"
                          : "bg-transparent",
                      )}
                    />
                  </div>
                  <p className="shrink-0 opacity-75">
                    <span className="sr-only">Filter by </span>
                    {category.name}
                  </p>
                </label>
              ))}

              <button
                type="button"
                onClick={() =>
                  setCategories((current) => {
                    const next = new Set(current);
                    grouped.forEach((category) => next.add(category.name));
                    return next;
                  })
                }
                className={classes(
                  selectionButtonClasses,
                  "col-span-full -mx-0.5 justify-self-start",
                )}
              >
                <IconPlus size={16} /> Select all
              </button>
            </div>
          </Fragment>
        ))}

        <div className="-mx-0.5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategories(new Set())}
            className={selectionButtonClasses}
          >
            <IconTrash size={16} /> Clear selection
          </button>
          <button
            type="button"
            onClick={() =>
              setCategories((current) => {
                const next = new Set<string>();
                standardCategories.forEach((category) => {
                  if (!current.has(category.name)) {
                    next.add(category.name);
                  }
                });
                return next;
              })
            }
            className={selectionButtonClasses}
          >
            <IconSync size={16} /> Invert selection
          </button>
        </div>
      </div>
    </div>
  );
}
