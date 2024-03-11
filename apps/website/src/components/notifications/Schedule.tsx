import { useEffect, useMemo, useState } from "react";

import { trpc } from "@/utils/trpc";
import { classes } from "@/utils/classes";

import Link from "@/components/content/Link";
import Calendar from "@/components/content/Calendar";

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
              getColor(event.link),
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

  if (events.isLoading || !today || !selected || !currentMonth)
    return <p>Loading schedule...</p>;
  if (!eventsWithChildren) return <p>No schedule is available currently.</p>;

  return (
    <Calendar
      events={eventsWithChildren}
      month={selected.month}
      year={selected.year}
      onChange={setSelected}
    >
      <p className="italic opacity-50">
        Events and dates/times are subject to change. Enable notifications to
        know when streams go live.
      </p>
    </Calendar>
  );
}
