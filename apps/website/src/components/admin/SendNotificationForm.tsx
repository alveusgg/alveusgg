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

        <label>
          <strong className="mb-0.5 block font-normal">Heading:</strong>
          <input
            name="heading"
            type="text"
            minLength={1}
            maxLength={100}
            defaultValue="Alveus announcement"
            required
            className="w-full border p-1 px-2"
          />
        </label>

        <label>
          <strong className="mb-0.5 block font-normal">Text:</strong>
          <textarea
            name="text"
            minLength={2}
            maxLength={200}
            defaultValue="Example content"
            required
            className="w-full border p-1 px-2"
          />
        </label>

        <label>
          <strong className="mb-0.5 block font-normal">Link:</strong>
          <input
            name="url"
            type="url"
            defaultValue="https://www.twitch.tv/AlveusSanctuary"
            required
            className="w-full border p-1 px-2"
          />
        </label>

        <div className="flex flex-row justify-end">
          <button
            type="submit"
            className="rounded-full bg-gray-800 p-2 px-4 text-white"
          >
            Send notification
          </button>
        </div>
      </div>
    </form>
  );
}
