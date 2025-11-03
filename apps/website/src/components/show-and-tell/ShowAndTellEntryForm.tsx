import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import Image from "next/image";
import { useRouter } from "next/router";
import {
  type ComponentProps,
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocale } from "react-aria";

import type { ShowAndTellEntry } from "@alveusgg/database";

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
import { getEntityStatus } from "@/utils/entity-helpers";
import { type ImageMimeType, imageMimeTypes } from "@/utils/files";
import { notEmpty } from "@/utils/helpers";
import { createImageUrl } from "@/utils/image";
import { extractColorFromImage } from "@/utils/process-image";
import { splitAttachments } from "@/utils/split-attachments";
import { trpc } from "@/utils/trpc";

import useFileUpload from "@/hooks/files/upload";
import { useFormChangeWarning } from "@/hooks/useFormChangeWarning";

import IconChevronDown from "@/icons/IconChevronDown";
import IconLoading from "@/icons/IconLoading";
import IconWarningTriangle from "@/icons/IconWarningTriangle";

import Link from "../content/Link";
import { MessageBox } from "../shared/MessageBox";
import { ModalDialog } from "../shared/ModalDialog";
import { Button } from "../shared/form/Button";
import { Fieldset } from "../shared/form/Fieldset";
import { ImageUploadAttachment } from "../shared/form/ImageUploadAttachment";
import type { MapLocation } from "../shared/form/MapPickerField";
import { MapPickerField } from "../shared/form/MapPickerField";
import { NumberField } from "../shared/form/NumberField";
import { RichTextField } from "../shared/form/RichTextField";
import { TextAreaField } from "../shared/form/TextAreaField";
import { TextField } from "../shared/form/TextField";
import {
  UploadAttachmentsField,
  useUploadAttachmentsData,
} from "../shared/form/UploadAttachmentsField";
import {
  VideoLinksField,
  useVideoLinksData,
} from "../shared/form/VideoLinksField";
import { DominantColorFieldset } from "./DominantColorFieldset";

type ShowAndTellEntryFormProps = {
  isAnonymous?: boolean;
  entry?: PublicShowAndTellEntryWithAttachments & Partial<ShowAndTellEntry>;
  action: "review" | "create" | "update";
  onUpdate?: () => void;
  onUnsavedChangesRef?: (confirmFn: (message?: string) => boolean) => void;
};

function ImageAttachment({
  entry,
  fileReference,
  onClick,
  ...props
}: Omit<ComponentProps<typeof ImageUploadAttachment>, "onClick"> &
  Pick<ShowAndTellEntryFormProps, "entry"> & {
    onClick: (url: string) => void;
  }) {
  const initialData =
    fileReference.status === "saved"
      ? entry?.attachments.find(
          ({ imageAttachment }) =>
            imageAttachment && imageAttachment.id === fileReference.id,
        )?.imageAttachment
      : undefined;

  const [hasAlt, setHasAlt] = useState(!!initialData?.alternativeText);

  const handlePreviewClick = () => {
    if (
      fileReference.status === "upload.done" ||
      fileReference.status === "saved"
    ) {
      onClick(fileReference.url);
    }
  };

  return (
    <ImageUploadAttachment
      {...props}
      onClick={handlePreviewClick}
      fileReference={fileReference}
    >
      <TextAreaField
        name={`image[${fileReference.id}][caption]`}
        label={<strong className="font-bold">Caption</strong>}
        maxLength={200}
        defaultValue={initialData?.caption}
      />

      <Disclosure as="div" className="mt-4" defaultOpen={hasAlt}>
        <DisclosureButton
          className={classes(
            "group flex w-full items-center justify-between text-left text-gray-500",
            hasAlt
              ? "pointer-events-none"
              : "transition-colors hover:text-gray-700",
          )}
          disabled={hasAlt}
        >
          <strong className="text-sm font-bold">
            Accessibility Description
          </strong>

          <IconChevronDown
            className="box-content shrink-0 p-1 transition-transform group-data-[open]:-scale-y-100"
            size={24}
          />
        </DisclosureButton>

        <DisclosurePanel className="rounded bg-gray-100 p-2" static={hasAlt}>
          <TextAreaField
            name={`image[${fileReference.id}][alternativeText]`}
            label={
              <>
                <span className="sr-only">Alt text</span>
                <p className="text-xs text-gray-600 italic">
                  Use this text to describe the image for visually impaired
                  users. This text is NOT visible on the show and tell page, but
                  will be read by screen readers and other accessibility tools.
                </p>
              </>
            }
            labelClassName="block -mb-4"
            maxLength={300}
            defaultValue={initialData?.alternativeText}
            onChange={(val) => setHasAlt(!!val)}
          />
        </DisclosurePanel>
      </Disclosure>
    </ImageUploadAttachment>
  );
}

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
      maxValue={9999}
      inputClassName={classes(
        "min-w-[calc(5ch+1rem)] text-right",
        enabled ? "" : "cursor-not-allowed opacity-50",
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
  onUnsavedChangesRef,
}: ShowAndTellEntryFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const create = trpc.showAndTell.create.useMutation();
  const update = trpc.showAndTell.update.useMutation();
  const review = trpc.adminShowAndTell.review.useMutation();
  const isLoading = create.isPending || update.isPending || review.isPending;

  // Only enable unsaved changes warning for admin review action
  const { markAsChanged, resetChanges, confirmIfUnsaved } =
    useFormChangeWarning(action === "review");

  const [wantsToTrackGiveAnHour, setWantsToTrackGiveAnHour] = useState(
    !!entry?.volunteeringMinutes,
  );

  // Track the initial state to detect when the checkbox changes
  const initialWantsToTrack = useRef(!!entry?.volunteeringMinutes);

  // Mark as changed when checkbox state changes
  useEffect(() => {
    if (wantsToTrackGiveAnHour !== initialWantsToTrack.current) {
      markAsChanged();
    }
  }, [wantsToTrackGiveAnHour, markAsChanged]);

  // Expose confirmIfUnsaved to parent component
  useEffect(() => {
    onUnsavedChangesRef?.(confirmIfUnsaved);
  }, [confirmIfUnsaved, onUnsavedChangesRef]);

  const closeModal = () => {
    setPreviewImageUrl(null);
  };

  const openModal = (url: string) => {
    setPreviewImageUrl(url);
  };

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

  const [postLocation, setPostLocation] = useState(initialLocation);
  const handlePostLocation = useCallback(
    (userSelectedLocation: MapLocation) => {
      setPostLocation(userSelectedLocation);
      markAsChanged();
    },
    [markAsChanged],
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
            extractColor: () =>
              extractColorFromImage(
                createImageUrl({
                  src: imageAttachment.url,
                  width: 1280,
                  quality: 100,
                }),
              ),
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

  const { locale } = useLocale();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const numberGroupChar = new Intl.NumberFormat(locale, {
      useGrouping: true,
    })
      .formatToParts(1000)
      .find((part) => part.type === "group")?.value;
    let hoursText = formData.get("giveAnHour") as string | null;
    if (hoursText && numberGroupChar) {
      hoursText = hoursText.replaceAll(numberGroupChar, "");
    }
    const hours = parseInt(hoursText ?? "");

    let dominantColor = formData.get("dominantColor") as string | null;
    if (dominantColor) {
      const r = parseInt(dominantColor.slice(1, 3), 16);
      const g = parseInt(dominantColor.slice(3, 5), 16);
      const b = parseInt(dominantColor.slice(5, 7), 16);
      dominantColor = [r, g, b].join();
    }

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
      dominantColor,
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

      if (!data.dominantColor) {
        data.dominantColor = await fileReference.extractColor();
      }

      if (fileReference.status === "saved") {
        data.imageAttachments.update[imageId] = linkAttachmentData;
      } else {
        data.imageAttachments.create.push({
          ...linkAttachmentData,
          name: fileReference.file.name,
        });
      }
    }

    if (!data.dominantColor) {
      const { featuredImage } = splitAttachments(
        videoLinksData.videoUrls.map((url) => ({
          id: "",
          entryId: "",
          attachmentType: "video",
          linkAttachmentId: "",
          imageAttachmentId: null,

          linkAttachment: {
            id: "",
            type: "",
            name: "",
            title: "",
            alternativeText: "",
            caption: "",
            description: "",
            url,
          },
          imageAttachment: null,
        })),
      );

      if (featuredImage) {
        data.dominantColor = await extractColorFromImage(
          createImageUrl({ src: featuredImage.url, width: 1280, quality: 100 }),
        );
      }
    }

    if (action === "create") {
      create.mutate(data, {
        onSuccess: () => {
          resetChanges();
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
            resetChanges();
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
            resetChanges();
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
              onChange={markAsChanged}
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
              onChange={markAsChanged}
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
              onChange={markAsChanged}
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
              renderAttachment={({ key, fileReference, ...props }) => (
                <ImageAttachment
                  key={key}
                  entry={entry}
                  fileReference={fileReference}
                  onClick={openModal}
                  {...props}
                />
              )}
            />
          </Fieldset>
        </div>
      </div>

      <div className="space-y-10">
        <Fieldset legend="Give an hour for Earth">
          <p>
            Do you want to track hours you spent on this activity as part of the
            Alveus community&apos;s effort to{" "}
            <Link href="/show-and-tell/give-an-hour" external>
              Give an Hour
            </Link>{" "}
            for Earth initiative?
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
          <>
            <Fieldset legend="Moderator Notes">
              <div className="flex flex-col gap-5 lg:flex-row lg:gap-20">
                <RichTextField
                  label="Private Note (only visible in review mode)"
                  name="notePrivate"
                  defaultValue={entry?.notePrivate || undefined}
                  onChange={markAsChanged}
                />

                <RichTextField
                  label="Public Note (visible on the post)"
                  name="notePublic"
                  defaultValue={entry?.notePublic || undefined}
                  onChange={markAsChanged}
                />
              </div>
            </Fieldset>

            <DominantColorFieldset
              savedColor={
                entry?.dominantColor ? `rgb(${entry.dominantColor})` : undefined
              }
            />
          </>
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

      <ModalDialog
        isOpen={!!previewImageUrl}
        closeModal={closeModal}
        title="Image Preview"
        panelClassName="max-w-3xl"
      >
        {previewImageUrl && (
          <Image
            src={previewImageUrl}
            alt="Form Image"
            width={500}
            height={500}
            className="w-full object-contain"
          ></Image>
        )}
      </ModalDialog>
    </form>
  );
}
