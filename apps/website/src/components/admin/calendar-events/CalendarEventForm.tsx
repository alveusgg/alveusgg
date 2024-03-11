import type { FormEvent } from "react";
import { useCallback } from "react";

import type { CalendarEvent } from "@prisma/client";
import { useRouter } from "next/router";

import { trpc } from "@/utils/trpc";

import type { CalendarEventSchema } from "@/server/db/calendar-events";

import { Button, defaultButtonClasses } from "@/components/shared/Button";
import { TextField } from "@/components/shared/form/TextField";
import { Fieldset } from "@/components/shared/form/Fieldset";
import { MessageBox } from "@/components/shared/MessageBox";
import {
  inputValueDatetimeLocalToUtc,
  utcToInputValueDatetimeLocal,
} from "@/utils/local-datetime";
import { FieldGroup } from "@/components/shared/form/FieldGroup";
import { LocalDateTimeField } from "@/components/shared/form/LocalDateTimeField";

type CalendarEventFormProps = {
  action: "create" | "edit";
  calendarEvent?: CalendarEvent;
};

export function CalendarEventForm({
  action,
  calendarEvent,
}: CalendarEventFormProps) {
  const router = useRouter();
  const submit =
    trpc.adminCalendarEvents.createOrEditCalendarEvent.useMutation();

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
        submit.mutate({
          action: "edit",
          id: calendarEvent.id,
          ...mutationData,
        });
      } else {
        submit.mutate(
          { action: "create", ...mutationData },
          {
            onSuccess: async () => {
              await router.push("/admin/calendar-events");
            },
          },
        );
      }
    },
    [action, calendarEvent, router, submit],
  );

  return (
    <form className="flex flex-col gap-10" onSubmit={handleSubmit}>
      {submit.error && (
        <MessageBox variant="failure">
          <pre>{submit.error.message}</pre>
        </MessageBox>
      )}
      {submit.isSuccess && (
        <MessageBox variant="success">Calendar event updated!</MessageBox>
      )}

      <Fieldset legend="Calendar event">
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

      <Button type="submit" className={defaultButtonClasses}>
        {action === "create" ? "Create" : "Update"}
      </Button>
    </form>
  );
}
