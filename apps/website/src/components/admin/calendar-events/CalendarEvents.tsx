import { useMemo, useState } from "react";

import { Headline } from "@/components/admin/Headline";
import { Panel } from "@/components/admin/Panel";
import {
  Calendar,
  useCalendarEventsQuery,
  useMonthSelection,
} from "@/components/calendar/Calendar";
import { CalendarItem } from "@/components/calendar/CalendarItem";

import useToday from "@/hooks/today";

import { CalendarEventForm } from "./CalendarEventForm";

export function CalendarEvents() {
  const today = useToday();
  const [selected, setSelected] = useMonthSelection(today);

  const events = useCalendarEventsQuery(selected);

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
            href={`/admin/calendar-events/${event.id}/edit`}
          />
        ),
      })),
    [events.data, today],
  );

  return (
    <>
      <Headline>Calendar Events</Headline>

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
