import { Duration } from "luxon";
import { type FormEvent, useCallback, useRef, useState } from "react";

import {
  notificationCategories,
  notificationChannels,
  notificationLinkDefault,
  notificationLinkSuggestions,
} from "@/data/notifications";

import { classes } from "@/utils/classes";
import { type ImageMimeType, imageMimeTypes } from "@/utils/files";
import { typeSafeObjectEntries } from "@/utils/helpers";
import { trpc } from "@/utils/trpc";

import useFileUpload from "@/hooks/files/upload";

import { MessageBox } from "@/components/shared/MessageBox";
import { Button, defaultButtonClasses } from "@/components/shared/form/Button";
import { CheckboxField } from "@/components/shared/form/CheckboxField";
import { Fieldset } from "@/components/shared/form/Fieldset";
import { ImageUploadAttachment } from "@/components/shared/form/ImageUploadAttachment";
import { LocalDateTimeField } from "@/components/shared/form/LocalDateTimeField";
import { SelectBoxField } from "@/components/shared/form/SelectBoxField";
import { TextAreaField } from "@/components/shared/form/TextAreaField";
import { TextField } from "@/components/shared/form/TextField";
import {
  UploadAttachmentsField,
  useUploadAttachmentsData,
} from "@/components/shared/form/UploadAttachmentsField";

import IconLoading from "@/icons/IconLoading";
import IconTrash from "@/icons/IconTrash";

const resizeImageOptions = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 90,
};

export function SendNotificationForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const createNotification =
    trpc.adminNotifications.createNotification.useMutation({
      onSuccess: () => {
        if (formRef.current) {
          formRef.current.reset();
        }
      },
    });

  const createFileUpload =
    trpc.adminNotifications.createFileUpload.useMutation();

  const upload = useFileUpload<ImageMimeType>(
    (signature) => createFileUpload.mutateAsync(signature),
    { allowedFileTypes: imageMimeTypes },
  );

  const imageAttachmentData = useUploadAttachmentsData();

  const image = imageAttachmentData.files[0];

  const [category, setCategory] = useState("announcements");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [link, setLink] = useState(notificationLinkDefault);

  const [isScheduled, setIsScheduled] = useState(false);

  const submit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const imageUrl = image?.status === "upload.done" ? image.url : undefined;
      const fileStorageObjectId =
        image?.status === "upload.done" ? image.fileStorageObjectId : undefined;
      const scheduledStartAt =
        (isScheduled && String(data.get("scheduledStartAt"))) || undefined;
      const scheduledEndAt =
        (isScheduled && String(data.get("scheduledEndAt"))) || undefined;
      const channels = data.getAll("channel").map(String);

      createNotification.mutate({
        text: String(data.get("text") || ""),
        tag: String(data.get("tag") || ""),
        title: String(data.get("title") || ""),
        linkUrl: String(data.get("url") || ""),
        scheduledStartAt,
        scheduledEndAt,
        imageUrl,
        vodUrl: String(data.get("vodUrl") || "") || undefined,
        fileStorageObjectId,
        isPush: channels.includes("push"),
        isDiscord: channels.includes("discord"),
      });
    },
    [image, isScheduled, createNotification],
  );

  return (
    <div>
      <form ref={formRef} onSubmit={submit}>
        {createNotification.isPending && (
          <MessageBox variant="default" className="flex items-center">
            <IconLoading className="mr-2 size-5 animate-spin" />
            Notification is being published…
          </MessageBox>
        )}
        {createNotification.isError && (
          <MessageBox variant="failure">
            ERROR: Could not create the notification!
          </MessageBox>
        )}

        <div className="flex flex-col gap-5">
          <SelectBoxField
            label="Category"
            name="tag"
            required
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            size={notificationCategories.length}
          >
            {notificationCategories.map(({ tag, label, ttl }) => (
              <option key={tag} value={tag}>
                {label} (push active for{" "}
                {Duration.fromMillis(ttl * 1000, { locale: "en-US" })
                  .rescale()
                  .toHuman({ unitDisplay: "short" })}
                )
              </option>
            ))}
          </SelectBoxField>

          <TextField
            label="Title (100 chars)"
            name="title"
            isRequired={true}
            minLength={1}
            maxLength={100}
            value={title}
            onChange={(value) => setTitle(value)}
          />

          <TextAreaField
            label="Message text (180 chars)"
            name="text"
            isRequired={true}
            minLength={2}
            maxLength={180}
            value={text}
            onChange={(value) => setText(value)}
          />

          <TextField
            label="Link"
            name="url"
            inputMode="url"
            type="url"
            list="notification-link-suggestions"
            showResetButton={true}
            pattern="https?://.*"
            inputClassName="font-mono"
            value={link}
            onChange={(value) => setLink(value)}
          />

          <datalist id="notification-link-suggestions">
            {notificationLinkSuggestions.map((link) => (
              <option key={link.url} value={link.url}>
                {link.label}
              </option>
            ))}
          </datalist>

          <UploadAttachmentsField
            label="Image"
            {...imageAttachmentData}
            maxNumber={1}
            upload={upload}
            allowedFileTypes={imageMimeTypes}
            resizeImageOptions={resizeImageOptions}
            renderAttachment={(props) => (
              <ImageUploadAttachment {...props}>
                <div className="flex h-full flex-col items-start justify-center">
                  <Button
                    size="small"
                    width="auto"
                    onClick={() =>
                      imageAttachmentData.dispatch({
                        type: "remove",
                        id: props.fileReference.id,
                      })
                    }
                  >
                    <IconTrash className="size-5" />
                    Remove
                  </Button>
                </div>
              </ImageUploadAttachment>
            )}
          />

          <TextField
            label="VoD"
            name="vodUrl"
            inputMode="url"
            type="url"
            showResetButton={true}
            pattern="https?://.*"
            inputClassName="font-mono"
          />

          <Fieldset legend="Announcement details">
            <div>
              <CheckboxField
                name="isScheduled"
                value="true"
                isSelected={isScheduled}
                onChange={(selected) => setIsScheduled(selected)}
              >
                Is scheduled event (start/end date)
              </CheckboxField>
            </div>

            <div
              className={classes(
                `flex flex-wrap gap-4 border-l pl-3`,
                !isScheduled && "hidden",
              )}
            >
              <LocalDateTimeField
                showResetButton
                name="scheduledStartAt"
                label="Start (Central Time)"
                required
              />
              <LocalDateTimeField
                showResetButton
                name="scheduledEndAt"
                label="End (Central Time)"
              />
            </div>
          </Fieldset>

          <Fieldset legend="Publication channels">
            <div className="flex flex-wrap gap-4">
              {typeSafeObjectEntries(notificationChannels).map(
                ([id, options]) => (
                  <CheckboxField
                    key={id}
                    name="channel"
                    value={id}
                    className="rounded-lg border border-white/20 px-2"
                    defaultSelected={options.isDefault}
                  >
                    {options.label}
                  </CheckboxField>
                ),
              )}
            </div>
          </Fieldset>

          <Button type="submit" className={defaultButtonClasses}>
            Send notification
          </Button>
        </div>
      </form>
    </div>
  );
}
