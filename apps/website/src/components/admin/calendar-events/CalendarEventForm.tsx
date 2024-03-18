import type { FormEvent } from "react";
import { useCallback } from "react";

import type { CalendarEvent } from "@prisma/client";
import { useRouter } from "next/router";

import { trpc } from "@/utils/trpc";
import { classes } from "@/utils/classes";
import {
  inputValueDatetimeLocalToUtc,
  utcToInputValueDatetimeLocal,
} from "@/utils/local-datetime";

import type { CalendarEventSchema } from "@/server/db/calendar-events";

import {
  Button,
  dangerButtonClasses,
  defaultButtonClasses,
} from "@/components/shared/Button";
import { TextField } from "@/components/shared/form/TextField";
import { Fieldset } from "@/components/shared/form/Fieldset";
import { MessageBox } from "@/components/shared/MessageBox";
import { FieldGroup } from "@/components/shared/form/FieldGroup";
import { LocalDateTimeField } from "@/components/shared/form/LocalDateTimeField";

type CalendarEventFormProps = {
  action: "create" | "edit";
  calendarEvent?: CalendarEvent;
  onCreate?: () => void;
  className?: string;
};

export function CalendarEventForm({
  action,
  calendarEvent,
  onCreate,
  className,
}: CalendarEventFormProps) {
  const router = useRouter();
  const submitMutation =
    trpc.adminCalendarEvents.createOrEditCalendarEvent.useMutation();

  const deleteMutation =
    trpc.adminCalendarEvents.deleteCalendarEvent.useMutation({
      onSuccess: async () => {
        await router.push("/admin/calendar-events");
      },
    });

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const formData = new FormData(event.currentTarget);

      // Add https:// if not present
      const link =
        String(formData.get("link")).startsWith("http://") ||
        String(formData.get("link")).startsWith("https://")
          ? String(formData.get("link"))
          : "https://" + String(formData.get("link"));

      const mutationData: CalendarEventSchema = {
        title: String(formData.get("title")),
        link: link,
        startAt: inputValueDatetimeLocalToUtc(String(formData.get("startAt"))),
      };

      if (formData.get("description"))
        mutationData.description = String(formData.get("description"));

      if (action === "edit") {
        if (!calendarEvent) return;
        submitMutation.mutate({
          action: "edit",
          id: calendarEvent.id,
          ...mutationData,
        });
      } else {
        submitMutation.mutate(
          { action: "create", ...mutationData },
          {
            onSuccess:
              onCreate ||
              (async () => {
                await router.push("/admin/calendar-events");
              }),
          },
        );
      }
    },
    [action, calendarEvent, router, submitMutation, onCreate],
  );

  return (
    <form
      className={classes("flex flex-col gap-10", className)}
      onSubmit={handleSubmit}
    >
      {submitMutation.error && (
        <MessageBox variant="failure">
          <pre>{submitMutation.error.message}</pre>
        </MessageBox>
      )}
      {deleteMutation.error && (
        <MessageBox variant="failure">
          <pre>{deleteMutation.error.message}</pre>
        </MessageBox>
      )}
      {submitMutation.isSuccess && (
        <MessageBox variant="success">
          Calendar event {action === "create" ? "created" : "updated"}!
        </MessageBox>
      )}
      {deleteMutation.isSuccess && (
        <MessageBox variant="success">Calendar event deleted!</MessageBox>
      )}

      <Fieldset
        legend={`${action === "create" ? "Create" : "Update"} Calendar Event`}
      >
        <TextField
          label="Title"
          name="title"
          defaultValue={calendarEvent?.title || ""}
          isRequired
        />

        <TextField
          label="Description"
          name="description"
          defaultValue={calendarEvent?.description || ""}
        />

        <TextField
          defaultValue={calendarEvent?.link || ""}
          label="Link"
          name="link"
          inputMode="url"
          isRequired
          type="url"
          inputClassName="font-mono"
          placeholder="https://twitch.tv/alveussanctuary"
        />
      </Fieldset>

      <Fieldset legend="Time and date">
        <FieldGroup>
          <LocalDateTimeField
            label="Start (Central Time)"
            name="startAt"
            defaultValue={utcToInputValueDatetimeLocal(calendarEvent?.startAt)}
          />
        </FieldGroup>
      </Fieldset>

      <Fieldset legend="">
        <Button type="submit" className={defaultButtonClasses}>
          {action === "create" ? "Create" : "Update"}
        </Button>

        {calendarEvent && (
          <Button
            type="button"
            className={dangerButtonClasses}
            confirmationMessage="Please confirm deletion!"
            onClick={() => deleteMutation.mutate(calendarEvent.id)}
          >
            Delete
          </Button>
        )}
      </Fieldset>
    </form>
  );
}
