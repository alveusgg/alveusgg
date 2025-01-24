import { type FormEvent, useCallback, useMemo, useState } from "react";
import { useRouter } from "next/router";
import type { ShowAndTellEntry } from "@prisma/client";

import type {
  PublicShowAndTellEntryWithAttachments,
  ShowAndTellSubmitInput,
} from "@/server/db/show-and-tell";

import {
  MAX_IMAGES,
  MAX_VIDEOS,
  getMaxTextLengthForCreatedAt,
  resizeImageOptions,
} from "@/data/show-and-tell";

import { classes } from "@/utils/classes";
import { trpc } from "@/utils/trpc";
import { notEmpty } from "@/utils/helpers";
import { getEntityStatus } from "@/utils/entity-helpers";
import { type ImageMimeType, imageMimeTypes } from "@/utils/files";

import IconLoading from "@/icons/IconLoading";
import IconWarningTriangle from "@/icons/IconWarningTriangle";

import useFileUpload from "@/hooks/files/upload";

import { Fieldset } from "../shared/form/Fieldset";
import { TextField } from "../shared/form/TextField";
import { RichTextField } from "../shared/form/RichTextField";
import {
  UploadAttachmentsField,
  useUploadAttachmentsData,
} from "../shared/form/UploadAttachmentsField";
import { Button } from "../shared/form/Button";
import { ImageUploadAttachment } from "../shared/form/ImageUploadAttachment";
import { MessageBox } from "../shared/MessageBox";
import { TextAreaField } from "../shared/form/TextAreaField";
import { NumberField } from "../shared/form/NumberField";
import {
  useVideoLinksData,
  VideoLinksField,
} from "../shared/form/VideoLinksField";
import Link from "../content/Link";
import type { MapLocation } from "../shared/form/MapPickerField";
import { MapPickerField } from "../shared/form/MapPickerField";

type ShowAndTellEntryFormProps = {
  isAnonymous?: boolean;
  entry?: PublicShowAndTellEntryWithAttachments & Partial<ShowAndTellEntry>;
  action: "review" | "create" | "update";
  onUpdate?: () => void;
};

function GiveAnHourInput({
  defaultValue,
  enabled,
}: {
  defaultValue?: number;
  enabled: boolean;
}) {
  const [value, setValue] = useState(defaultValue || 1);

  return (
    <NumberField
      label="Hours"
      name="giveAnHour"
      isDisabled={!enabled}
      suffix={
        <span className="mr-2 min-w-[5ch] text-black">
          {value === 1 ? "hour" : "hours"}
        </span>
      }
      value={value}
      onChange={setValue}
      step={1}
      minValue={1}
      maxValue={100}
      inputClassName={classes(
        "text-right min-w-[calc(4ch+1rem)]",
        enabled ? "" : "opacity-50 cursor-not-allowed",
      )}
      showButtons={true}
      labelClassName="sr-only"
      groupClassName="w-min"
    />
  );
}

export function ShowAndTellEntryForm({
  isAnonymous = false,
  action = "create",
  entry,
  onUpdate,
}: ShowAndTellEntryFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const create = trpc.showAndTell.create.useMutation();
  const update = trpc.showAndTell.update.useMutation();
  const review = trpc.adminShowAndTell.review.useMutation();
  const isLoading = create.isPending || update.isPending || review.isPending;

  const [wantsToTrackGiveAnHour, setWantsToTrackGiveAnHour] = useState(
    !!entry?.volunteeringMinutes,
  );

  const initialLocation = useMemo<MapLocation | undefined>(
    () =>
      entry &&
      typeof entry.latitude === "number" &&
      typeof entry.longitude === "number"
        ? {
            latitude: entry.latitude,
            longitude: entry.longitude,
            location: entry.location || "",
          }
        : undefined,
    [entry],
  );
  const [postLocation, setPostLocation] = useState<MapLocation>(
    {} as MapLocation,
  );
  const handlePostLocation = useCallback(
    (userSelectedLocation: MapLocation) => {
      setPostLocation(userSelectedLocation);
    },
    [],
  );

  const imageAttachmentsData = useUploadAttachmentsData(
    useMemo(
      () =>
        entry?.attachments
          .filter((attachment) => attachment.attachmentType === "image")
          .map(({ imageAttachment }) => imageAttachment)
          .filter(notEmpty)
          .map((imageAttachment) => ({
            status: "saved",
            id: imageAttachment.id,
            url: imageAttachment.url,
            fileStorageObjectId: imageAttachment.fileStorageObjectId,
          })),
      [entry?.attachments],
    ),
  );
  const videoLinksData = useVideoLinksData(
    useMemo(
      () =>
        entry?.attachments
          .filter((attachment) => attachment.attachmentType === "video")
          .map(({ linkAttachment }) => linkAttachment)
          .filter(notEmpty)
          .map(({ url }) => url),
      [entry?.attachments],
    ),
  );

  const createFileUpload = trpc.showAndTell.createFileUpload.useMutation();
  const upload = useFileUpload<ImageMimeType>(
    (signature) => createFileUpload.mutateAsync(signature),
    { allowedFileTypes: imageMimeTypes },
  );

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const hours = parseFloat(formData.get("giveAnHour") as string);
    const data: ShowAndTellSubmitInput = {
      displayName: formData.get("displayName") as string,
      title: formData.get("title") as string,
      text: formData.get("text") as string,
      imageAttachments: { create: [], update: {} },
      videoLinks: videoLinksData.videoUrls,
      volunteeringMinutes: wantsToTrackGiveAnHour && hours ? hours * 60 : null,
      location: postLocation?.location ?? "",
      latitude: postLocation?.latitude ?? null,
      longitude: postLocation?.longitude ?? null,
    };

    for (const fileReference of imageAttachmentsData.files) {
      if (
        fileReference.status !== "upload.done" &&
        fileReference.status !== "saved"
      ) {
        setError("Please wait for all uploads to finish");
        return;
      }

      const imageId = fileReference.id;
      const linkAttachmentData = {
        url: fileReference.url,
        fileStorageObjectId: fileReference.fileStorageObjectId,
        title: "", // Currently not supported
        description: "", // Currently not supported
        caption: String(formData.get(`image[${imageId}][caption]`) || ""),
        alternativeText: String(
          formData.get(`image[${imageId}][alternativeText]`) || "",
        ),
      };

      if (fileReference.status === "saved") {
        data.imageAttachments.update[imageId] = linkAttachmentData;
      } else {
        data.imageAttachments.create.push({
          ...linkAttachmentData,
          name: fileReference.file.name,
        });
      }
    }

    if (action === "create") {
      create.mutate(data, {
        onSuccess: () => {
          if (isAnonymous) {
            // We can't redirect to the entry because the user is anonymous
            setIsSubmitted(true);
            onUpdate?.();
          } else {
            // Redirect to my posts
            router.push(`/show-and-tell/my-posts/`);
          }
        },
        onError: (err) => {
          setError(err.message);
          onUpdate?.();
        },
      });
    } else if (action === "update" && entry) {
      update.mutate(
        { ...data, id: entry.id },
        {
          onSuccess: () => {
            setSuccessMessage("Entry updated successfully!");
            onUpdate?.();
          },
          onError: (err) => {
            setError(err.message);
            onUpdate?.();
          },
        },
      );
    } else if (action === "review" && entry) {
      review.mutate(
        {
          ...data,
          id: entry.id,
          notePrivate: (formData.get("notePrivate") as string) ?? "",
          notePublic: (formData.get("notePublic") as string) ?? "",
        },
        {
          onSuccess: () => {
            setSuccessMessage("Entry updated successfully!");
            onUpdate?.();
          },
          onError: (err) => {
            setError(err.message);
            onUpdate?.();
          },
        },
      );
    }

    setError(null);
  };

  if (isSubmitted) {
    return (
      <div className="my-5">
        <MessageBox variant="success">
          Your entry has been submitted. It will be reviewed by a moderator and
          then published.
        </MessageBox>
      </div>
    );
  }

  const wasApproved = entry && getEntityStatus(entry) === "approved";

  return (
    <form className="my-5 flex flex-col gap-5" onSubmit={handleSubmit}>
      {action === "update" && wasApproved && (
        <MessageBox variant="warning" className="my-4 flex items-center gap-2">
          <IconWarningTriangle className="size-6 text-yellow-900" />
          You are modifying a previously approved post. Upon submitting your
          edits, the post will be unpublished until the changes have been
          reviewed and approved.
        </MessageBox>
      )}
      {error && <MessageBox variant="failure">{error}</MessageBox>}
      {successMessage && (
        <MessageBox variant="success">{successMessage}</MessageBox>
      )}

      <div className="flex flex-col gap-5 lg:flex-row lg:gap-20">
        <div className="flex flex-[3] flex-col gap-5">
          <Fieldset legend="About you">
            <TextField
              label="Name"
              isRequired
              name="displayName"
              autoComplete="name"
              minLength={1}
              maxLength={100}
              defaultValue={entry?.displayName || undefined}
              placeholder="What should we call you?"
            />
          </Fieldset>
          <Fieldset legend="Post">
            <TextField
              label="Title"
              isRequired
              minLength={1}
              maxLength={100}
              name="title"
              defaultValue={entry?.title}
              placeholder="What's your post about?"
            />
            <MapPickerField
              name="postLocation"
              textToShow="Add post location"
              antialias={true}
              maxZoom={8}
              onLocationChange={handlePostLocation}
              initialLocation={initialLocation}
            />
            <RichTextField
              label="Content"
              name="text"
              defaultValue={entry?.text}
              maxLength={getMaxTextLengthForCreatedAt(entry?.createdAt)}
            />
          </Fieldset>
        </div>
        <div className="flex flex-[2] flex-col gap-5">
          <Fieldset legend="Attachments">
            <div className="lg:mb-10">
              <VideoLinksField
                name="videoUrls"
                maxNumber={MAX_VIDEOS}
                {...videoLinksData}
              />
            </div>
            <UploadAttachmentsField
              {...imageAttachmentsData}
              label="Pictures"
              upload={upload}
              maxNumber={MAX_IMAGES}
              allowedFileTypes={imageMimeTypes}
              resizeImageOptions={resizeImageOptions}
              renderAttachment={({ fileReference, ...props }) => {
                const initialData =
                  fileReference.status === "saved"
                    ? entry?.attachments.find(
                        ({ imageAttachment }) =>
                          imageAttachment &&
                          imageAttachment.id === fileReference.id,
                      )?.imageAttachment
                    : undefined;

                return (
                  <ImageUploadAttachment
                    {...props}
                    fileReference={fileReference}
                  >
                    <div className="flex flex-col gap-3">
                      <TextAreaField
                        name={`image[${fileReference.id}][caption]`}
                        label={<strong className="font-bold">Caption</strong>}
                        maxLength={200}
                        defaultValue={initialData?.caption}
                      />
                      <TextAreaField
                        name={`image[${fileReference.id}][alternativeText]`}
                        label={
                          <span className="text-gray-600">
                            Visual Description
                            <br />
                            <em className="text-sm">
                              Text accessible to visually impaired users to
                              describe the image
                            </em>
                          </span>
                        }
                        maxLength={300}
                        defaultValue={initialData?.alternativeText}
                      />
                    </div>
                  </ImageUploadAttachment>
                );
              }}
            />
          </Fieldset>
        </div>
      </div>

      <div className="space-y-10">
        <Fieldset legend="Give an hour for Earth">
          <p>
            Do you want to track hours you spent on this activity as part of the
            Alveus community&apos;s effort to give an hour for Earth? Originally
            part of WWF&apos;s{" "}
            <Link href="/show-and-tell/give-an-hour" external>
              Give an Hour
            </Link>{" "}
            initiative.
          </p>

          <div className="flex items-center gap-8">
            <label
              htmlFor="giveAnHourTracked"
              className="flex items-center gap-4"
            >
              <input
                type="checkbox"
                id="giveAnHourTracked"
                checked={wantsToTrackGiveAnHour}
                onChange={(e) => setWantsToTrackGiveAnHour(e.target.checked)}
              />
              Yes, I want to track my hours:
            </label>

            <GiveAnHourInput
              enabled={wantsToTrackGiveAnHour}
              defaultValue={
                entry?.volunteeringMinutes ? entry.volunteeringMinutes / 60 : 1
              }
            />
          </div>
        </Fieldset>

        {action === "review" && (
          <Fieldset legend="Moderator Notes">
            <div className="flex flex-col gap-5 lg:flex-row lg:gap-20">
              <RichTextField
                label="Private Note (only visible in review mode)"
                name="notePrivate"
                defaultValue={entry?.notePrivate || undefined}
              />

              <RichTextField
                label="Public Note (visible on the post)"
                name="notePublic"
                defaultValue={entry?.notePublic || undefined}
              />
            </div>
          </Fieldset>
        )}

        {error && <MessageBox variant="failure">{error}</MessageBox>}
        {successMessage && (
          <MessageBox variant="success">{successMessage}</MessageBox>
        )}

        <Button type="submit">
          {isLoading ? (
            <>
              <IconLoading className="size-5" />
              Saving …
            </>
          ) : action === "create" ? (
            "Submit for review"
          ) : action === "update" && wasApproved ? (
            "Submit changes for review"
          ) : (
            "Save changes"
          )}
        </Button>
      </div>
    </form>
  );
}
