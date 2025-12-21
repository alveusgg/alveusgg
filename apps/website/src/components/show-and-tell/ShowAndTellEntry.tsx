import parse, {
  type DOMNode,
  Element,
  type HTMLReactParserOptions,
  Text,
  domToReact,
} from "html-react-parser";
import Image from "next/image";
import {
  Fragment,
  type Ref,
  isValidElement,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { ErrorBoundary } from "react-error-boundary";

import type { PublicShowAndTellEntryWithAttachments } from "@/server/db/show-and-tell";

import { featuredAttachmentsImage } from "@/utils/attachments";
import { classes } from "@/utils/classes";
import { formatDateTime } from "@/utils/datetime";
import { DATETIME_ALVEUS_ZONE } from "@/utils/timezone";

import Link from "@/components/content/Link";
import { Badge } from "@/components/show-and-tell/Badge";
import { ShowAndTellGallery } from "@/components/show-and-tell/gallery/ShowAndTellGallery";

import IconWorld from "@/icons/IconWorld";

import showAndTellPeepo from "@/assets/show-and-tell/peepo.png";

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
                  ? "group rounded-full bg-blue-900/95 p-1 text-3xl text-nowrap shadow-lg transition-all hover:scale-102 hover:bg-blue-900 hover:text-green-600 focus:bg-blue-900 focus:text-green-600"
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
      <div className="-m-4 mt-0 bg-white/70 p-4 text-gray-900 backdrop-blur-xs">
        <div
          className={`mx-auto w-fit ${
            isPresentationView ? "scrollbar-none max-h-[66vh] pb-6" : ""
          }`}
        >
          {hasContent && (
            <div className="alveus-ugc max-w-[1100px] leading-relaxed hyphens-auto md:text-lg xl:text-2xl">
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
              <h3 className="mt-4 -mb-4 text-xs font-bold text-alveus-green-600 uppercase xl:text-sm">
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

  const featuredImage = useMemo(
    () => featuredAttachmentsImage(entry.attachments),
    [entry.attachments],
  );

  return (
    <article
      key={entry.id}
      className={classes(
        "relative flex flex-shrink-0 flex-col transition-opacity delay-500 duration-500 focus:outline-hidden",
        isPresentationView &&
          "h-[calc(100svh-6em)] h-[calc(100vh-6em)] w-[80%] snap-center overflow-hidden bg-alveus-green text-white shadow-xl transition-[background-color,opacity]",
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
      style={
        isPresentationView && entry.dominantColor !== null
          ? {
              backgroundColor: `oklch(from rgb(${entry.dominantColor}) min(l, 0.5) c h)`,
            }
          : undefined
      }
    >
      {isPresentationView && featuredImage && (
        <div className="absolute top-0 z-0 size-full overflow-hidden rounded-xl">
          <Image
            loading="lazy"
            width={1920}
            height={1080}
            draggable={false}
            className="pointer-events-none absolute inset-0 -m-2 size-[calc(100%+4em)] object-cover opacity-30 blur-md select-none"
            src={featuredImage.url}
            alt=""
          />
        </div>
      )}
      <div
        className={`z-10 flex flex-col gap-4 p-4 ${
          isPresentationView
            ? "absolute inset-0 scrollbar-none flex-1 overflow-hidden overflow-y-scroll"
            : ""
        }`}
      >
        <Header
          entry={entry}
          newLocation={newLocation}
          isPresentationView={isPresentationView}
        />

        {entry.attachments.length ? (
          <ShowAndTellGallery
            isPresentationView={isPresentationView}
            attachments={entry.attachments}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-4">
            <Image
              src={showAndTellPeepo}
              height={384}
              alt=""
              className={classes(
                "h-full w-auto opacity-50",
                isPresentationView ? "max-h-96" : "max-h-48",
              )}
            />
            <p className="text-xs italic opacity-75">
              This post has no videos or images.
            </p>
          </div>
        )}

        <Content entry={entry} isPresentationView={isPresentationView} />
      </div>
    </article>
  );
};
