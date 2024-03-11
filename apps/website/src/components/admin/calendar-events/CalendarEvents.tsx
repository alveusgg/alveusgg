import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { trpc } from "@/utils/trpc";
import { LinkButton } from "@/components/shared/Button";
import { ModalDialog } from "@/components/shared/ModalDialog";
import { Headline } from "@/components/admin/Headline";
import { Panel } from "@/components/admin/Panel";
import Calendar from "@/components/content/Calendar";

export function CalendarEvents() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selected, setSelected] = useState<{ month: number; year: number }>();
  useEffect(() => {
    const now = new Date();
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
      events.data?.map((event) => ({
        date: event.startAt,
        children: (
          <Link
            key={event.id}
            className="mb-auto block rounded-sm bg-alveus-tan p-1 leading-none transition-colors hover:bg-alveus-green hover:text-alveus-tan"
            href={`/admin/calendar-events/${event.id}/edit`}
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
    [events.data],
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
            onChange={setSelected}
          />
        )}

        <div className="mt-4 flex gap-2">
          <LinkButton
            href="/admin/calendar-events/create"
            size="small"
            width="auto"
          >
            + Create calendar event
          </LinkButton>
        </div>
      </Panel>
    </>
  );
}
