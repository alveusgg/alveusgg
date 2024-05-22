import type { FormEvent } from "react";
import { useState, useCallback } from "react";

import type { CalendarEvent } from "@prisma/client";
import { useRouter } from "next/router";

import { trpc } from "@/utils/trpc";
import { classes } from "@/utils/classes";
import {
  DATE_LOCAL_INPUT_FORMAT,
  TIME_LOCAL_INPUT_FORMAT,
  inputValueDatetimeLocalToUtc,
  utcToInputValueDatetimeLocal,
} from "@/utils/local-datetime";
import { frequentLinks, standardCategories } from "@/data/calendar-events";

import type { CalendarEventSchema } from "@/server/db/calendar-events";

import {
  Button,
  dangerButtonClasses,
  defaultButtonClasses,
} from "@/components/shared/form/Button";
import { TextField } from "@/components/shared/form/TextField";
import { Fieldset } from "@/components/shared/form/Fieldset";
import { MessageBox } from "@/components/shared/MessageBox";
import { FieldGroup } from "@/components/shared/form/FieldGroup";
import { LocalDateField } from "@/components/shared/form/LocalDateField";
import { LocalTimeField } from "@/components/shared/form/LocalTimeField";
import { SelectBoxField } from "@/components/shared/form/SelectBoxField";

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

      const startAtDate = formData.get("startAtDate");
      const startAtTime = formData.get("startAtTime");
      const hasTime = startAtTime !== "";
      const startAt = inputValueDatetimeLocalToUtc(
        // If there is no time selected, default to noon (12 pm)
        `${startAtDate}T${hasTime ? startAtTime : "12:00"}`,
      );

      const mutationData: CalendarEventSchema = {
        title: String(formData.get("title")),
        category: String(formData.get("category")),
        link,
        startAt,
        hasTime,
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

  // We have to use a controlled value for inputs with a reset button
  const [category, setCategory] = useState(calendarEvent?.category || "");
  const [link, setLink] = useState(calendarEvent?.link || "");

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

        <SelectBoxField
          label="Category"
          name="category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          {standardCategories.map((category) => (
            <option key={category.name} value={category.name}>
              {category.name}
            </option>
          ))}
        </SelectBoxField>

        <TextField
          label="Description"
          name="description"
          defaultValue={calendarEvent?.description || ""}
        />

        <TextField
          label="Link"
          name="link"
          inputMode="url"
          isRequired
          type="url"
          list="calendar-event-link-suggestions"
          showResetButton={true}
          inputClassName="font-mono"
          placeholder={frequentLinks[0]?.url}
          value={link}
          onChange={(value) => setLink(value)}
        />
      </Fieldset>

      <datalist id="calendar-event-link-suggestions">
        {frequentLinks.map((link) => (
          <option key={link.url} value={link.url}>
            {link.label}
          </option>
        ))}
      </datalist>

      <Fieldset legend="Time and date">
        <FieldGroup>
          <LocalDateField
            label="Start date (Central Time)"
            name="startAtDate"
            defaultValue={utcToInputValueDatetimeLocal(
              calendarEvent?.startAt,
              DATE_LOCAL_INPUT_FORMAT,
            )}
            className="max-w-[calc(20ch)]"
            required
          />
          <LocalTimeField
            label="Start time (Central Time)"
            name="startAtTime"
            defaultValue={
              calendarEvent?.hasTime
                ? utcToInputValueDatetimeLocal(
                    calendarEvent?.startAt,
                    TIME_LOCAL_INPUT_FORMAT,
                  )
                : undefined
            }
            className="max-w-[calc(20ch)]"
            showResetButton
          />
        </FieldGroup>
      </Fieldset>

      <div className="flex flex-col gap-2">
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
      </div>
    </form>
  );
}
