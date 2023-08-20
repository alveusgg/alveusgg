import React, {
  forwardRef,
  Fragment,
  isValidElement,
  useCallback,
  useMemo,
  useRef,
} from "react";
import type {
  FileStorageObject,
  ImageAttachment,
  ImageMetadata,
  LinkAttachment,
  ShowAndTellEntry as ShowAndTellEntryModel,
  ShowAndTellEntryAttachment,
} from "@prisma/client";
import Image from "next/image";
import parse, {
  domToReact,
  Element,
  Text,
  type DOMNode,
  type HTMLReactParserOptions,
} from "html-react-parser";

import { parseVideoUrl, videoPlatformConfigs } from "@/utils/video-urls";
import { notEmpty } from "@/utils/helpers";
import { DATETIME_ALVEUS_ZONE, formatDateTime } from "@/utils/datetime";

import Link from "@/components/content/Link";
import { ShowAndTellGallery } from "@/components/show-and-tell/gallery/ShowAndTellGallery";
import { SeenOnStreamBadge } from "@/components/show-and-tell/SeenOnStreamBadge";

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

const getTextContentRecursive = (node: DOMNode): string => {
  if (node instanceof Element) {
    return node.children
      .map((child) => getTextContentRecursive(child))
      .join("");
  }

  if (node instanceof Text) {
    return node.data || "";
  }

  return "";
};

const Empty = () => <Fragment />;

const parseOptions: HTMLReactParserOptions = {
  replace: (node) => {
    if (node instanceof Element && node.name === "root") {
      return getTextContentRecursive(node).trim() ? (
        <Fragment>{domToReact(node.children, parseOptions)}</Fragment>
      ) : (
        <Empty />
      );
    }

    if (node instanceof Element && node.name === "a" && node.attribs.href) {
      return (
        <Link href={node.attribs.href} external>
          {domToReact(node.children, parseOptions)}
        </Link>
      );
    }
  },
};

export const ShowAndTellEntry = forwardRef<
  HTMLElement | null,
  ShowAndTellEntryProps
>(function ShowAndTellEntry(
  {
    entry,
    isPresentationView,
    //showPermalink = false,
  },
  forwardedRef,
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
    for (const videoAttachment of videoAttachments) {
      const parsedVideoUrl = parseVideoUrl(videoAttachment.url);
      if (!parsedVideoUrl) continue;
      const videoPlatformConfig = videoPlatformConfigs[parsedVideoUrl.platform];
      if (!("previewUrl" in videoPlatformConfig)) continue;
      featureImageUrl = videoPlatformConfig.previewUrl(parsedVideoUrl.id);
      break;
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
    [forwardedRef],
  );

  const content = useMemo(
    () => parse(`<root>${entry.text}</root>`, parseOptions),
    [entry.text],
  );

  const header = (
    <header
      className={`p-4 px-10 drop-shadow-xl ${
        isPresentationView ? "" : "text-center"
      }`}
    >
      {entry.seenOnStreamAt && <SeenOnStreamBadge />}

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
        {formatDateTime(
          entry.createdAt,
          { style: "long" },
          { zone: DATETIME_ALVEUS_ZONE },
        )}
      </p>
    </header>
  );

  return (
    <article
      key={entry.id}
      className={
        "relative flex flex-shrink-0 flex-col transition-opacity delay-500 duration-500 " +
        (isPresentationView
          ? "h-[calc(100svh-6em)] h-[calc(100vh-6em)] w-[80%] select-none snap-center overflow-hidden bg-alveus-green text-white shadow-xl"
          : "min-h-[70svh] min-h-[70vh] justify-center border-t border-alveus-green/50 first:border-t-0")
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
        {/* showPermalink ? (
          <Link href={`/show-and-tell/posts/${entry.id}`}>{header}</Link>
        ) : (
          header
        ) */}
        {header}

        <ShowAndTellGallery
          isPresentationView={isPresentationView}
          lightboxParentRef={wrapperRef}
          imageAttachments={imageAttachments}
          videoAttachments={videoAttachments}
        />

        {isValidElement(content) && content.type !== Empty && (
          <div className="-m-4 mt-0 bg-white/70 p-4 text-gray-900 backdrop-blur-sm">
            <div
              className={`mx-auto w-fit  ${
                isPresentationView ? "scrollbar-none max-h-[66vh] pb-6" : ""
              }`}
            >
              <div className="alveus-ugc max-w-[1100px] hyphens-auto leading-relaxed md:text-lg xl:text-2xl">
                {content}
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
});
