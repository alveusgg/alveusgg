import { useState } from "react";
import type { inferRouterOutputs } from "@trpc/server";
import { trpc } from "@/utils/trpc";
import {
  Button,
  dangerButtonClasses,
  LinkButton,
} from "@/components/shared/Button";
import { ModalDialog } from "@/components/shared/ModalDialog";
import { Headline } from "@/components/admin/Headline";
import { Panel } from "@/components/admin/Panel";
import IconPencil from "@/icons/IconPencil";
import IconTrash from "@/icons/IconTrash";
import type { AppRouter } from "@/server/trpc/router/_app";
import DateTime from "@/components/content/DateTime";
type RouterOutput = inferRouterOutputs<AppRouter>;
type CalendarEvent =
  RouterOutput["adminCalendarEvents"]["getCalendarEvents"][number];

type CalendarEventProps = {
  calendarEvent: CalendarEvent;
  onError: (error: string) => void;
  onUpdate: () => void;
};

function CalendarEvent({
  calendarEvent,
  onError,
  onUpdate,
}: CalendarEventProps) {
  const deleteMutation =
    trpc.adminCalendarEvents.deleteCalendarEvent.useMutation({
      onError: (error) => onError(error.message),
      onSettled: () => onUpdate(),
    });

  return (
    <>
      <tr className="border-b border-gray-700">
        <td className="p-1">{calendarEvent.title}</td>
        <td className="p-1 tabular-nums">
          <DateTime date={calendarEvent.startAt} format={{ time: "minutes" }} />
        </td>
        <td className="flex flex-row flex-wrap gap-2 p-1">
          <LinkButton
            size="small"
            width="auto"
            href={`/admin/calendar-events/${calendarEvent.id}/edit`}
          >
            <IconPencil className="h-4 w-4" />
            Edit
          </LinkButton>

          <Button
            size="small"
            width="auto"
            className={dangerButtonClasses}
            confirmationMessage="Please confirm deletion!"
            onClick={() => deleteMutation.mutate(calendarEvent.id)}
          >
            <IconTrash className="h-4 w-4" />
            Delete
          </Button>
        </td>
      </tr>
    </>
  );
}

export function CalendarEvents() {
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const events = trpc.adminCalendarEvents.getCalendarEvents.useQuery();

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
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left">Title</th>
              <th className="text-left">Starts At</th>
              <th className="text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.data?.map((event) =>
              showPastEvents || new Date(event.startAt) > new Date() ? (
                <CalendarEvent
                  key={event.id}
                  calendarEvent={event}
                  onError={(err) => setErrorMessage(err)}
                  onUpdate={() => events.refetch()}
                />
              ) : null,
            )}
          </tbody>
        </table>

        <div className="mt-4 flex gap-2">
          <LinkButton
            href="/admin/calendar-events/create"
            size="small"
            width="auto"
          >
            + Create calendar event
          </LinkButton>

          <Button
            onClick={() => setShowPastEvents(!showPastEvents)}
            size="small"
            width="auto"
          >
            {showPastEvents ? "Hide" : "Show"} past events
          </Button>
        </div>
      </Panel>
    </>
  );
}
