import React, { useRef } from "react";

import { notificationCategories } from "@/config/notifications";
import { trpc } from "@/utils/trpc";
import { TextField } from "@/components/shared/form/TextField";
import { TextAreaField } from "@/components/shared/form/TextAreaField";
import { Button, defaultButtonClasses } from "@/components/shared/Button";
import { SelectBoxField } from "@/components/shared/form/SelectBoxField";
import {
  UploadAttachmentsField,
  useUploadAttachmentsData,
} from "@/components/shared/form/UploadAttachmentsField";
import { useFileUpload } from "@/components/shared/hooks/useFileUpload";
import { ImageUploadAttachment } from "@/components/shared/form/ImageUploadAttachment";

export const allowedFileTypes = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
] as const;
type AllowedFileTypes = typeof allowedFileTypes;

export function SendNotificationForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const sendNotification = trpc.adminNotifications.sendNotification.useMutation(
    {
      onSuccess: () => {
        if (formRef.current) {
          formRef.current.reset();
        }
      },
    }
  );

  const createFileUpload =
    trpc.adminNotifications.createFileUpload.useMutation();
  const upload = useFileUpload<AllowedFileTypes>(
    (signature) => createFileUpload.mutateAsync(signature),
    { allowedFileTypes }
  );
  const imageAttachmentData = useUploadAttachmentsData();

  return (
    <form
      ref={formRef}
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const image = imageAttachmentData.files[0];
        const imageUrl =
          image && image.status === "upload.done" ? image.url : undefined;

        sendNotification.mutate({
          text: String(data.get("text") || ""),
          tag: String(data.get("tag") || ""),
          heading: String(data.get("heading") || ""),
          url: String(data.get("url") || ""),
          imageUrl,
        });
      }}
    >
      {sendNotification.isLoading && (
        <p className="text-gray-700">Notification is being sent …</p>
      )}
      {sendNotification.isError && (
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

        <UploadAttachmentsField
          label="Image"
          {...imageAttachmentData}
          maxNumber={1}
          upload={upload}
          allowedFileTypes={allowedFileTypes}
          renderAttachment={({ fileReference, ...props }) => (
            <ImageUploadAttachment {...props} fileReference={fileReference} />
          )}
        />

        <Button type="submit" className={defaultButtonClasses}>
          Send notification
        </Button>
      </div>
    </form>
  );
}
