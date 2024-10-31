import {
  forwardRef,
  Fragment,
  isValidElement,
  useCallback,
  useMemo,
  useRef,
  useState,
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
import { SeenOnStreamBadge } from "@/components/show-and-tell/SeenOnStreamBadge";

import IconWorld from "@/icons/IconWorld";
import { classes } from "@/utils/classes";

type ShowAndTellEntryProps = {
  entry: PublicShowAndTellEntryWithAttachments;
  isPresentationView?: boolean;
  withHeight?: boolean;
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

const Header = ({ entry, isPresentationView }: ShowAndTellEntryProps) => {
  const hours = entry.volunteeringMinutes && entry.volunteeringMinutes / 60;

  return (
    <header
      className={`p-4 px-10 drop-shadow-xl ${
        isPresentationView ? "" : "text-center"
      }`}
    >
      {entry.seenOnStream && (
        <SeenOnStreamBadge
          dark={isPresentationView}
          pulse={isPresentationView}
        />
      )}

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
                  ? "group text-nowrap rounded-full bg-blue-900/95 p-1 text-3xl shadow-lg transition-all hover:scale-102 hover:bg-blue-900 hover:text-green-600 focus:bg-blue-900 focus:text-green-600"
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

const Content = ({ entry, isPresentationView }: ShowAndTellEntryProps) => {
  const content = useMemo(() => {
    try {
      return parse(`<root>${entry.text}</root>`, parseOptions);
    } catch (e) {
      console.error(`Failed to parse Show and Tell entry ${entry.id}`, e);
    }
  }, [entry.text, entry.id]);

  return (
    isValidElement(content) &&
    content.type !== Empty && (
      <div className="-m-4 mt-0 bg-white/70 p-4 text-gray-900 backdrop-blur-sm">
        <div
          className={`mx-auto w-fit  ${
            isPresentationView ? "scrollbar-none max-h-[66vh] pb-6" : ""
          }`}
        >
          <div className="alveus-ugc max-w-[1100px] hyphens-auto leading-relaxed md:text-lg xl:text-2xl">
            <ErrorBoundary
              FallbackComponent={Empty}
              onError={(err) =>
                console.error(
                  `Failed to render Show and Tell entry ${entry.id}`,
                  err,
                )
              }
            >
              {content}
            </ErrorBoundary>
          </div>
        </div>
      </div>
    )
  );
};

type Range = [number, number];
const cut = (
  vboxes: {
    population: number;
    ranges: [Range, Range, Range];
    product: number | null;
  }[],
  histogram: number[],
  compareFn: Parameters<(typeof vboxes)["sort"]>[0],
) => {
  if (vboxes.length > 1) {
    vboxes.sort(compareFn);
  }

  const { ranges } = vboxes.pop()!;

  const enum Channel {
    Red,
    Green,
    Blue,
  }

  let maxRange = Channel.Red;
  let maxSpan = ranges[maxRange][1] - ranges[maxRange][0];
  for (let i = Channel.Green; i < ranges.length; i++) {
    const range = ranges[i];

    const span = range[1] - range[0];
    if (span > maxSpan) {
      maxSpan = span;
      maxRange = i;
    }
  }

  let total = 0;
  const partialSums = [];
  const jChannel = ((maxRange + 1) % 3) as Channel;
  const kChannel = ((jChannel + 1) % 3) as Channel;
  const [iStart, iEnd] = ranges[maxRange];
  const [jStart, jEnd] = ranges[jChannel];
  const [kStart, kEnd] = ranges[kChannel];
  for (let i = iStart; i <= iEnd; i++) {
    let sum = 0;

    const iIdx = i << (5 * (2 - maxRange));

    for (let j = jStart; j <= jEnd; j++) {
      const jIdx = iIdx + (j << (5 * (2 - jChannel)));

      for (let k = kStart; k <= kEnd; k++) {
        const histogramIdx = jIdx + (k << (5 * (2 - kChannel)));

        sum += histogram[histogramIdx] ?? 0;
      }
    }

    total += sum;

    partialSums[i] = total;
  }

  const partialDiffs = partialSums.map((sum) => total - sum);

  for (let i = iStart; i <= iEnd; i++) {
    if (partialSums[i]! > total / 2) {
      let median: number;

      const left = i - iStart;
      const right = iEnd - i;
      if (left <= right) median = Math.min(iEnd - 1, ~~(i + right / 2));
      else median = Math.max(iStart, ~~(i - 1 - left / 2));

      while (partialSums[i] === 0) {
        median++;
      }

      let diff = partialDiffs[median];
      while (diff === 0 && partialSums[median - 1]) {
        median--;

        diff = partialDiffs[median];
      }

      vboxes.push(
        {
          population: partialSums[median]!,
          ranges: ranges.map((range, i) =>
            i === maxRange ? [range[0], median] : [...range],
          ) as [Range, Range, Range],
          product: null,
        },
        {
          population: partialDiffs[median]!,
          ranges: ranges.map((range, i) =>
            i === maxRange ? [median + 1, range[1]] : [...range],
          ) as [Range, Range, Range],
          product: null,
        },
      );

      break;
    }
  }
};

export const ShowAndTellEntry = forwardRef<
  HTMLElement | null,
  ShowAndTellEntryProps
>(function ShowAndTellEntry(
  { entry, isPresentationView = false, withHeight = true },
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

  const [backgroundColor, setBackgroundColor] = useState<string>();

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
      style={
        isPresentationView
          ? { backgroundColor, transitionProperty: "background-color, opacity" }
          : undefined
      }
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
            onLoad={(e) => {
              if (
                typeof backgroundColor !== "undefined" ||
                !window.CanvasRenderingContext2D
              )
                return;

              const { currentTarget } = e;
              const { naturalHeight, naturalWidth } = currentTarget;

              const canvas = document.createElement("canvas");
              canvas.height = naturalHeight;
              canvas.width = naturalWidth;

              const context = canvas.getContext("2d")!;

              context.drawImage(
                currentTarget,
                0,
                0,
                naturalWidth,
                naturalHeight,
              );

              const { data } = context.getImageData(
                0,
                0,
                naturalWidth,
                naturalHeight,
              );

              const histogram = Array(1 << 15);

              const blockSize = 4 * 10;
              let population = 0;
              const ranges = Array.from({ length: 3 }, () => [
                (1 << 5) - 1,
                0,
              ]) as [Range, Range, Range];
              for (let i = 0; i < data.length; i += blockSize) {
                if (data[i + 3]! < 128) continue;

                let histogramIdx = 0;
                for (let j = 0; j < 3; j++) {
                  const value = data[i + j]! >> 3;

                  if (value < ranges[j]![0]) {
                    ranges[j]![0] = value;
                  }
                  if (value > ranges[j]![1]) {
                    ranges[j]![1] = value;
                  }

                  histogramIdx += value << (5 * (2 - j));
                }

                histogram[histogramIdx] = (histogram[histogramIdx] ?? 0) + 1;
                population++;
              }

              const vboxes: Parameters<typeof cut>[0] = [
                { population, ranges, product: null },
              ];

              for (let i = 0; i < 3; i++) {
                cut(vboxes, histogram, (a, b) => a.population - b.population);
              }

              for (let i = 0; i < vboxes.length; i++) {
                const vbox = vboxes[i]!;

                vbox.product = vbox.ranges.reduce(
                  (prev, curr) => prev * (curr[1] - curr[0] + 1),
                  vbox.population,
                );
              }

              cut(vboxes, histogram, (a, b) => a.product! - b.product!);

              let dominantColorVbox = vboxes[0]!;
              for (let i = 1; i < vboxes.length; i++) {
                const vbox = vboxes[i]!;

                if (vbox.product === null) {
                  vbox.product = vbox.ranges.reduce(
                    (prev, curr) => prev * (curr[1] - curr[0] + 1),
                    vbox.population,
                  );
                }

                if (vbox.product > dominantColorVbox.product!) {
                  dominantColorVbox = vbox;
                }
              }

              const [rRange, gRange, bRange] = dominantColorVbox.ranges;

              const dominantColor = [0, 0, 0];
              let total = 0;
              for (let r = rRange[0]; r <= rRange[1]; r++) {
                const rIdx = r << 10;
                for (let g = gRange[0]; g <= gRange[1]; g++) {
                  const gIdx = rIdx + (g << 5);
                  for (let b = bRange[0]; b <= bRange[1]; b++) {
                    const histogramIdx = gIdx + b;
                    const amt = histogram[histogramIdx] ?? 0;

                    if (amt > 0) {
                      total += amt;

                      dominantColor[0] += amt * (r + 0.5);
                      dominantColor[1] += amt * (g + 0.5);
                      dominantColor[2] += amt * (b + 0.5);
                    }
                  }
                }
              }
              if (total > 0) {
                for (let i = 0; i < dominantColor.length; i++) {
                  dominantColor[i] = ~~((dominantColor[i]! << 3) / total);
                }
              } else {
                for (let i = 0; i < dominantColorVbox.ranges.length; i++) {
                  const range = dominantColorVbox.ranges[i]!;
                  dominantColor[i] = ~~(((range[0] + range[1] + 1) << 3) / 2);
                }
              }

              setBackgroundColor(
                `oklch(from rgb(${dominantColor}) min(l, 0.5) c h)`,
              );
            }}
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
        <Header entry={entry} isPresentationView={isPresentationView} />

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
});
