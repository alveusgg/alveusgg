import {
  Fragment,
  isValidElement,
  useCallback,
  useMemo,
  useRef,
  type Ref,
} from "react";
import Image from "next/image";
import parse, {
  domToReact,
  Element,
  Text,
  type DOMNode,
  type HTMLReactParserOptions,
} from "html-react-parser";
import { ErrorBoundary } from "react-error-boundary";

import { parseVideoUrl, videoPlatformConfigs } from "@/utils/video-urls";
import { notEmpty } from "@/utils/helpers";
import { DATETIME_ALVEUS_ZONE, formatDateTime } from "@/utils/datetime";

import type { PublicShowAndTellEntryWithAttachments } from "@/server/db/show-and-tell";

import Link from "@/components/content/Link";
import { ShowAndTellGallery } from "@/components/show-and-tell/gallery/ShowAndTellGallery";
import { Badge } from "@/components/show-and-tell/Badge";

import IconWorld from "@/icons/IconWorld";
import { classes } from "@/utils/classes";

type ShowAndTellEntryProps = {
  entry: PublicShowAndTellEntryWithAttachments;
  newLocation: boolean;
  isPresentationView?: boolean;
  withHeight?: boolean;
  ref?: Ref<HTMLElement>;
};

const getTextContentRecursive = (node: DOMNode): string => {
  if (node instanceof Element) {
    return (node.children as DOMNode[])
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
        <Fragment>
          {domToReact(node.children as DOMNode[], parseOptions)}
        </Fragment>
      ) : (
        <Empty />
      );
    }

    if (node instanceof Element && node.name === "a" && node.attribs.href) {
      return (
        <Link href={node.attribs.href} external>
          {domToReact(node.children as DOMNode[], parseOptions)}
        </Link>
      );
    }
  },
};

const Header = ({
  entry,
  newLocation,
  isPresentationView,
}: ShowAndTellEntryProps) => {
  const hours = entry.volunteeringMinutes && entry.volunteeringMinutes / 60;

  return (
    <header
      className={`p-4 px-10 drop-shadow-xl ${
        isPresentationView ? "" : "text-center"
      }`}
    >
      <div className="flex items-center justify-end">
        <h2
          className={`mb-3 grow font-serif ${
            isPresentationView ? "text-6xl" : "text-4xl"
          }`}
        >
          {entry.title}
        </h2>

        {(
          [
            [newLocation, "New location"],
            [entry.seenOnStream, "Seen on stream"],
          ] satisfies [boolean, string][]
        ).map(
          ([cond, text], i) =>
            cond && (
              <Badge
                dark={isPresentationView}
                key={i}
                pulse={isPresentationView}
              >
                {text}
              </Badge>
            ),
        )}
      </div>

      <p
        className={` ${
          isPresentationView
            ? "text-4xl text-alveus-tan-200"
            : "text-2xl text-alveus-green"
        }`}
      >
        <span className="mr-1 italic">by </span>
        {entry.displayName}
        {entry.location && (
          <>
            <span className="mr-1 italic"> near </span>
            {entry.location}
          </>
        )}
        {" — "}
        {formatDateTime(
          entry.createdAt,
          { style: "long" },
          { zone: DATETIME_ALVEUS_ZONE },
        )}
        {entry.volunteeringMinutes ? (
          <>
            {` — `}
            <Link
              href="/show-and-tell/give-an-hour"
              className={classes(
                "inline-flex items-center gap-1 text-green-700",
                isPresentationView
                  ? "group text-nowrap rounded-full bg-blue-900/95 p-1 text-3xl shadow-lg transition-all hover:bg-blue-900 hover:text-green-600 hover:scale-102 focus:bg-blue-900 focus:text-green-600"
                  : "hover:underline focus:underline",
              )}
              target="_blank"
              custom
            >
              <strong
                className={classes(
                  "bg-gradient-to-br to-green-600 bg-clip-text font-bold text-transparent",
                  isPresentationView
                    ? "from-blue-500 pl-2 leading-none transition-colors group-hover:from-blue-400 group-hover:to-green-500"
                    : "from-blue-800",
                )}
              >
                Gave {hours} {hours === 1 ? "Hour" : "Hours"} for Earth
              </strong>
              <IconWorld
                className={classes(
                  "inline-block",
                  isPresentationView ? "h-12 w-12" : "h-8 w-8",
                )}
              />
            </Link>
          </>
        ) : null}
      </p>
    </header>
  );
};

const Content = ({
  entry,
  isPresentationView,
}: Omit<ShowAndTellEntryProps, "newLocation">) => {
  const content = useMemo(() => {
    try {
      return entry.text && parse(`<root>${entry.text}</root>`, parseOptions);
    } catch (e) {
      console.error(`Failed to parse Show and Tell entry text ${entry.id}`, e);
    }
  }, [entry.text, entry.id]);

  const note = useMemo(() => {
    try {
      return (
        entry.notePublic &&
        parse(`<root>${entry.notePublic}</root>`, parseOptions)
      );
    } catch (e) {
      console.error(`Failed to parse Show and Tell entry note ${entry.id}`, e);
    }
  }, [entry.notePublic, entry.id]);

  const hasContent = isValidElement(content) && content.type !== Empty;
  const hasNote = isValidElement(note) && note.type !== Empty;

  return (
    (hasContent || hasNote) && (
      <div className="-m-4 mt-0 bg-white/70 p-4 text-gray-900 backdrop-blur-sm">
        <div
          className={`mx-auto w-fit ${
            isPresentationView ? "scrollbar-none max-h-[66vh] pb-6" : ""
          }`}
        >
          {hasContent && (
            <div className="alveus-ugc max-w-[1100px] hyphens-auto leading-relaxed md:text-lg xl:text-2xl">
              <ErrorBoundary
                FallbackComponent={Empty}
                onError={(err) =>
                  console.error(
                    `Failed to render Show and Tell entry text ${entry.id}`,
                    err,
                  )
                }
              >
                {content}
              </ErrorBoundary>
            </div>
          )}

          {hasNote && (
            <div className="opacity-75">
              <h3 className="-mb-4 mt-4 text-xs font-bold uppercase text-alveus-green-600 xl:text-sm">
                Mod Note
              </h3>

              <div className="alveus-ugc max-w-[1100px] hyphens-auto xl:text-lg">
                <ErrorBoundary
                  FallbackComponent={Empty}
                  onError={(err) =>
                    console.error(
                      `Failed to render Show and Tell entry note ${entry.id}`,
                      err,
                    )
                  }
                >
                  {note}
                </ErrorBoundary>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  );
};

export const ShowAndTellEntry = ({
  entry,
  newLocation,
  isPresentationView = false,
  withHeight = true,
  ref: forwardedRef,
}: ShowAndTellEntryProps) => {
  const wrapperRef = useRef<HTMLElement>(null);
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

  return (
    <article
      key={entry.id}
      className={classes(
        "relative flex flex-shrink-0 flex-col transition-opacity delay-500 duration-500 focus:outline-none",
        isPresentationView &&
          "h-[calc(100svh-6em)] h-[calc(100vh-6em)] w-[80%] select-none snap-center overflow-hidden bg-alveus-green text-white shadow-xl",
        !isPresentationView &&
          "justify-center border-t border-alveus-green/50 first:border-t-0",
        withHeight && !isPresentationView && "min-h-[70svh] min-h-[70vh]",
      )}
      onClick={(e) => {
        if (isPresentationView)
          e.currentTarget.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
      }}
      ref={handleRef}
      data-show-and-tell-entry={entry.id}
      data-show-and-tell-author={entry.displayName}
      tabIndex={-1}
    >
      {isPresentationView && featureImageUrl && (
        <div className="absolute top-0 z-0 size-full overflow-hidden rounded-xl">
          <Image
            loading="lazy"
            width={1920}
            height={1080}
            draggable={false}
            className="pointer-events-none absolute inset-0 -m-2 size-[calc(100%+4em)] select-none object-cover opacity-30 blur-md"
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
        <Header
          entry={entry}
          newLocation={newLocation}
          isPresentationView={isPresentationView}
        />

        <ShowAndTellGallery
          isPresentationView={isPresentationView}
          lightboxParentRef={wrapperRef}
          imageAttachments={imageAttachments}
          videoAttachments={videoAttachments}
        />

        <Content entry={entry} isPresentationView={isPresentationView} />
      </div>
    </article>
  );
};
