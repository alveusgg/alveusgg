import { useEffect, useMemo, useState } from "react";
import { Transition } from "@headlessui/react";

import { trpc } from "@/utils/trpc";
import { classes } from "@/utils/classes";

import Link from "@/components/content/Link";
import Calendar, { getEventLinkColor } from "@/components/content/Calendar";

export function Schedule() {
  const [today, setToday] = useState<Date>();
  const [selected, setSelected] = useState<{ month: number; year: number }>();
  useEffect(() => {
    const now = new Date();
    setToday(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
    setSelected({ month: now.getMonth(), year: now.getFullYear() });
  }, []);
  const currentMonth = useMemo(
    () => selected && new Date(selected.year, selected.month, 1),
    [selected],
  );
  const nextMonth = useMemo(
    () => selected && new Date(selected.year, selected.month + 1, 1),
    [selected],
  );

  const events = trpc.calendarEvents.getCalendarEvents.useQuery(
    { start: currentMonth, end: nextMonth },
    { enabled: currentMonth !== undefined && nextMonth !== undefined },
  );

  const eventsWithChildren = useMemo(
    () =>
      today &&
      events.data?.map((event) => ({
        date: event.startAt,
        children: (
          <Link
            key={event.id}
            className={classes(
              getEventLinkColor(event.link),
              "mb-auto block rounded-sm p-1 leading-none transition-colors",
              event.startAt.getTime() < today.getTime() && "opacity-50",
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
        ),
      })),
    [events.data, today],
  );

  if (!selected) return null;

  return (
    <Calendar
      events={eventsWithChildren || []}
      month={selected.month}
      year={selected.year}
      loading={events.isLoading}
      onChange={setSelected}
      className="mt-2 md:mt-6"
    >
      <div className="flex justify-between gap-2 italic opacity-50">
        <p>
          Events and dates/times are subject to change. Enable notifications to
          know when streams go live.
        </p>

        <Transition
          show={events.isLoading}
          enter="transition-opacity duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          entered="animate-pulse"
          leave="transition-opacity duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          as="p"
        >
          Loading...
        </Transition>
      </div>
    </Calendar>
  );
}
