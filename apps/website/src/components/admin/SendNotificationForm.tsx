import React, { useRef } from "react";

import { notificationCategories } from "@/config/notifications";
import { trpc } from "@/utils/trpc";
import { TextField } from "@/components/shared/form/TextField";
import { TextAreaField } from "@/components/shared/form/TextAreaField";
import { Button, defaultButtonClasses } from "@/components/shared/Button";
import { SelectBoxField } from "@/components/shared/form/SelectBoxField";

export function SendNotificationForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const runAction = trpc.adminAction.runAction.useMutation({
    onSuccess: () => {
      if (formRef.current) {
        formRef.current.reset();
      }
    },
  });

  return (
    <form
      ref={formRef}
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        runAction.mutate({
          action: "sendNotification",
          text: String(data.get("text") || ""),
          tag: String(data.get("tag") || ""),
          heading: String(data.get("heading") || ""),
          url: String(data.get("url") || ""),
        });
      }}
    >
      {runAction.isLoading && (
        <p className="text-gray-700">Notification is being sent …</p>
      )}
      {runAction.isError && (
        <p className="text-red-800">ERROR: Could not send the notification!</p>
      )}

      <div className="flex flex-col gap-5">
        <SelectBoxField
          label="Category"
          name="tag"
          required
          defaultValue="announcements"
        >
          <option value=""></option>
          {notificationCategories.map(({ tag, label }) => (
            <option
              key={tag}
              value={tag}
              defaultChecked={tag === "announcements"}
            >
              {label}
            </option>
          ))}
        </SelectBoxField>

        <TextField
          label="Heading"
          name="heading"
          isRequired={true}
          defaultValue="Alveus announcement"
          minLength={1}
          maxLength={100}
        />

        <TextAreaField
          label="Text"
          name="text"
          isRequired={true}
          minLength={2}
          maxLength={200}
          defaultValue="This is an announcement."
        />

        <TextField
          label="Link"
          name="url"
          type="url"
          autoComplete="url"
          isRequired={true}
          defaultValue="https://www.twitch.tv/AlveusSanctuary"
        />

        <Button type="submit" className={defaultButtonClasses}>
          Send notification
        </Button>
      </div>
    </form>
  );
}
