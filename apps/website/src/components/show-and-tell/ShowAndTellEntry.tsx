import React, { forwardRef, useCallback, useRef } from "react";
import type {
  FileStorageObject,
  ImageAttachment,
  ImageMetadata,
  LinkAttachment,
  ShowAndTellEntry as ShowAndTellEntryModel,
  ShowAndTellEntryAttachment,
} from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { parseVideoUrl } from "@/utils/video-urls";
import { notEmpty } from "@/utils/helpers";
import { LocalDate } from "@/components/shared/LocalDate";
import { ShowAndTellGallery } from "@/components/show-and-tell/gallery/ShowAndTellGallery";

export type ShowAndTellEntryWithAttachments = ShowAndTellEntryModel & {
  attachments: Array<
    ShowAndTellEntryAttachment & {
      linkAttachment: LinkAttachment | null;
      imageAttachment:
        | (ImageAttachment & {
            fileStorageObject:
              | (FileStorageObject & { imageMetadata: ImageMetadata | null })
              | null;
          })
        | null;
    }
  >;
};

type ShowAndTellEntryProps = {
  entry: ShowAndTellEntryWithAttachments;
  isPresentationView: boolean;
  showPermalink?: boolean;
};

export const ShowAndTellEntry = forwardRef<
  HTMLElement | null,
  ShowAndTellEntryProps
>(function ShowAndTellEntry(
  { entry, isPresentationView, showPermalink = false },
  forwardedRef
) {
  const wrapperRef = useRef<HTMLElement | null>(null);
  const imageAttachments = entry.attachments
    .filter(({ attachmentType }) => attachmentType === "image")
    .map(({ imageAttachment }) => imageAttachment)
    .filter(notEmpty);
  const videoAttachments = entry.attachments
    .filter(({ attachmentType }) => attachmentType === "video")
    .map(({ linkAttachment }) => linkAttachment)
    .filter(notEmpty);

  let featureImageUrl = imageAttachments[0]?.url;
  if (!featureImageUrl) {
    const youtubeVideo = videoAttachments.find(
      ({ url }) => parseVideoUrl(url)?.platform === "youtube"
    );
    if (youtubeVideo) {
      const videoId = parseVideoUrl(youtubeVideo.url)?.id;
      if (videoId) {
        featureImageUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
    }
  }

  const handleRef = useCallback(
    (node: HTMLElement) => {
      wrapperRef.current = node;
      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    },
    [forwardedRef]
  );

  const header = (
    <header
      className={`p-4 drop-shadow-xl ${
        isPresentationView ? "" : "text-center"
      }`}
    >
      <h2
        className={`mb-3 font-serif ${
          isPresentationView ? "text-6xl" : "text-4xl"
        }`}
      >
        {entry.title}
      </h2>

      <p
        className={` ${
          isPresentationView
            ? "text-4xl text-alveus-tan-200"
            : "text-2xl text-alveus-green"
        }`}
      >
        <span className="mr-1 italic">by </span>
        {entry.displayName}
        {" — "}
        <LocalDate dateTime={entry.createdAt} format="long" />
      </p>
    </header>
  );

  return (
    <article
      key={entry.id}
      className={
        "relative flex flex-shrink-0 flex-col transition-opacity delay-500 duration-500 " +
        (isPresentationView
          ? "h-[calc(100vh-6em)] h-[calc(100svh-6em)] w-[80%] select-none snap-center overflow-hidden bg-alveus-green text-white shadow-xl"
          : "min-h-[70vh] min-h-[70svh] justify-center border-t border-alveus-green first:border-t-0")
      }
      onClick={(e) => {
        if (isPresentationView)
          e.currentTarget.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
      }}
      ref={handleRef}
    >
      {isPresentationView && featureImageUrl && (
        <div className="absolute top-0 z-0 h-full w-full overflow-hidden rounded-xl">
          <Image
            loading="lazy"
            width={1920}
            height={1080}
            draggable={false}
            className="pointer-events-none absolute inset-0 -m-2 h-[calc(100%+4em)] w-[calc(100%+4em)] select-none object-cover opacity-30 blur-md"
            src={featureImageUrl}
            alt=""
          />
        </div>
      )}
      <div
        className={`z-10 flex flex-col gap-4 p-4 ${
          isPresentationView
            ? "scrollbar-none absolute inset-0 flex-1 overflow-hidden overflow-y-scroll"
            : ""
        }`}
      >
        {showPermalink ? (
          <Link href={`/show-and-tell/posts/${entry.id}`}>{header}</Link>
        ) : (
          header
        )}

        <ShowAndTellGallery
          lightboxParent={isPresentationView ? wrapperRef.current : null}
          imageAttachments={imageAttachments}
          videoAttachments={videoAttachments}
        />

        <div className="-m-4 mt-0 bg-white/70 p-4 text-gray-900 backdrop-blur-sm">
          <div
            className={`mx-auto w-fit  ${
              isPresentationView ? "scrollbar-none max-h-[66vh] pb-6" : ""
            }`}
          >
            <div
              className="alveus-ugc hyphens-auto max-w-[1100px] leading-relaxed md:text-lg xl:text-2xl"
              dangerouslySetInnerHTML={{ __html: entry.text }}
            />
          </div>
        </div>
      </div>
    </article>
  );
});
