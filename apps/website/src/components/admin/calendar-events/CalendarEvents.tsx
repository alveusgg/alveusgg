import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { getStandardCategoryColor } from "@/data/calendar-events";

import { trpc } from "@/utils/trpc";
import { classes } from "@/utils/classes";

import { ModalDialog } from "@/components/shared/ModalDialog";
import { Headline } from "@/components/admin/Headline";
import { Panel } from "@/components/admin/Panel";
import Calendar from "@/components/content/Calendar";

import { CalendarEventForm } from "./CalendarEventForm";

export function CalendarEvents() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
              getStandardCategoryColor(event.category),
              "mb-auto block rounded-sm p-1 leading-none transition-colors",
              event.startAt.getTime() < today.getTime() && "opacity-50",
            )}
            href={`/admin/calendar-events/${event.id}/edit`}
          >
            <p className="font-semibold">{event.title}</p>
            {event.hasTime && (
              <p className="text-sm tabular-nums">
                {event.startAt.toLocaleTimeString(undefined, {
                  hour: "numeric",
                  minute: "2-digit",
                  timeZoneName: "short",
                })}
              </p>
            )}
          </Link>
        ),
      })),
    [events.data, today],
  );

  return (
    <>
      <Headline>Calendar Events</Headline>

      {errorMessage && (
        <ModalDialog
          title="Could not perform action"
          closeModal={() => setErrorMessage(null)}
        >
          <p>{errorMessage}</p>
        </ModalDialog>
      )}

      <Panel>
        {selected && (
          <Calendar
            events={eventsWithChildren || []}
            month={selected.month}
            year={selected.year}
            loading={events.isLoading}
            onChange={setSelected}
          />
        )}

        <CalendarEventForm
          action="create"
          onCreate={events.refetch}
          className="mt-8 border-t-2 border-alveus-green pt-8"
        />
      </Panel>
    </>
  );
}
