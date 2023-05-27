import React, { useCallback, useRef, useState } from "react";
import { Duration } from "luxon";

import { notificationCategories } from "@/config/notifications";
import { trpc } from "@/utils/trpc";

import logoImage from "@/assets/push-image/logo.png";
import defaultBgImage from "@/assets/push-image/default.png";

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
import { PushImageCanvas } from "@/components/notifications/PushImageCanvas";
import { Headline } from "@/components/admin/Headline";
import { CheckboxField } from "@/components/shared/form/CheckboxField";
import { Fieldset } from "@/components/shared/form/Fieldset";
import { LocalDateTimeField } from "@/components/shared/form/LocalDateTimeField";

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
  const image = imageAttachmentData.files[0];

  const [category, setCategory] = useState("announcements");
  const [heading, setHeading] = useState("");
  const [text, setText] = useState("");
  const [link, setLink] = useState("https://www.twitch.tv/AlveusSanctuary");

  const submit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const imageUrl =
        image && image.status === "upload.done" ? image.url : undefined;

      sendNotification.mutate({
        text: String(data.get("text") || ""),
        tag: String(data.get("tag") || ""),
        heading: String(data.get("heading") || ""),
        url: String(data.get("url") || ""),
        imageUrl,
      });
    },
    [image, sendNotification]
  );

  const previewImageUrl =
    (image &&
      ((image.status === "upload.pending" && image.dataURL) ||
        (image.status === "upload.done" && image.url))) ||
    defaultBgImage.src;

  return (
    <div>
      <form ref={formRef} onSubmit={submit}>
        {sendNotification.isLoading && (
          <p className="text-gray-700">Notification is being sent …</p>
        )}
        {sendNotification.isError && (
          <p className="text-red-800">
            ERROR: Could not send the notification!
          </p>
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
            label="Heading (100 chars)"
            name="heading"
            isRequired={true}
            minLength={1}
            maxLength={100}
            value={heading}
            onChange={(value) => setHeading(value)}
          />

          <TextAreaField
            label="Text (200 chars)"
            name="text"
            isRequired={true}
            minLength={2}
            maxLength={200}
            value={text}
            onChange={(value) => setText(value)}
          />

          <TextField
            label="Link"
            name="url"
            type="url"
            autoComplete="url"
            list="notification-link-suggestions"
            showResetButton={true}
            value={link}
            onChange={(value) => setLink(value)}
            pattern="https?://.*"
          />

          <datalist id="notification-link-suggestions">
            <option value="https://www.twitch.tv/AlveusSanctuary">
              Twitch channel AlveusSanctuary
            </option>
            <option value="https://www.twitch.tv/maya">
              Twitch channel Maya
            </option>
            <option value="https://youtube.com/@AlveusSanctuary">
              YouTube channel AlveusSanctuary
            </option>
            <option value="https://www.youtube.com/@mayahiga">
              YouTube channel Maya
            </option>
            <option value="https://www.alveussanctuary.org/">Website</option>
            <option value="https://twitter.com/AlveusSanctuary">
              Twitter page
            </option>
          </datalist>

          <UploadAttachmentsField
            label="Base Image"
            {...imageAttachmentData}
            maxNumber={1}
            upload={upload}
            allowedFileTypes={allowedFileTypes}
            renderAttachment={({ fileReference, ...props }) => (
              <ImageUploadAttachment {...props} fileReference={fileReference} />
            )}
          />

          <Fieldset legend="Event details">
            <div className="flex flex-wrap gap-4">
              <LocalDateTimeField
                showResetButton
                name="start"
                label="Start"
                required
              />
              <LocalDateTimeField
                showResetButton
                name="end"
                label="End"
                required
              />
            </div>
          </Fieldset>

          <Fieldset legend="Publication channels">
            <div className="flex flex-wrap gap-4">
              <CheckboxField
                name="channel"
                value="updatesPage"
                className="rounded-lg border border-white/20 px-2"
              >
                Updates page
              </CheckboxField>
              <CheckboxField
                name="channel"
                value="twitter"
                className="rounded-lg border border-white/20 px-2"
              >
                Twitter
              </CheckboxField>
              <CheckboxField
                name="channel"
                value="instagram"
                className="rounded-lg border border-white/20 px-2"
              >
                Instagram
              </CheckboxField>
              <CheckboxField
                name="channel"
                value="stream"
                className="rounded-lg border border-white/20 px-2"
              >
                Show on stream
              </CheckboxField>
            </div>
          </Fieldset>

          <Button type="submit" className={defaultButtonClasses}>
            Send notification
          </Button>
        </div>
      </form>

      <div className="mt-10 flex gap-4 border-t border-black/50 pt-5">
        <div className="flex-1">
          <Headline>OpenGraph (Twitter, Facebook etc.)</Headline>

          <div className="overflow-hidden rounded-xl">
            <PushImageCanvas
              heading={heading}
              text={text}
              backgroundImageUrl={previewImageUrl}
              logoImageUrl={logoImage.src}
            />
          </div>
        </div>
        <div className="flex-1">
          <Headline>Instagram</Headline>

          <div className="overflow-hidden rounded-xl">
            <PushImageCanvas
              heading={heading}
              text={text}
              backgroundImageUrl={previewImageUrl}
              logoImageUrl={logoImage.src}
              width={1080}
              height={1080}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
