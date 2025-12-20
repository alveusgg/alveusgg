import {
  Stream as CloudflareStream,
  type StreamPlayerApi,
} from "@cloudflare/stream-react";
import Image, { type StaticImageData } from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { env } from "@/env";

import { classes } from "@/utils/classes";
import { createImageUrl } from "@/utils/image";

import IconLoading from "@/icons/IconLoading";
import IconYouTube from "@/icons/IconYouTube";

export type StreamSource = {
  id: string; // Video ID
  cu: string; // Customer Code
};

type PreviewProps = {
  src: StreamSource;
  alt?: string;
  className?: string;
  icon?: boolean;
};

export const getStreamUrlThumbnail = (src: StreamSource) =>
  createImageUrl({
    src: `https://customer-${encodeURIComponent(src.cu)}.cloudflarestream.com/${encodeURIComponent(src.id)}/thumbnails/thumbnail.jpg?width=1280&height=720`,
    width: 1280,
    quality: 100,
  });

export const getStreamUrlMp4 = (src: StreamSource): string =>
  `https://customer-${encodeURIComponent(src.cu)}.cloudflarestream.com/${encodeURIComponent(src.id)}/downloads/default.mp4`;

export const getStreamUrlIframe = (
  src: StreamSource,
  {
    start,
    autoPlay = false,
    muted = false,
    poster,
    title,
    link,
  }: Partial<{
    start: string | number;
    autoPlay: boolean;
    muted: boolean;
    poster: string;
    title?: string;
    link?: string;
  }> = {},
): string => {
  const url = new URL(
    `https://customer-${encodeURIComponent(src.cu)}.cloudflarestream.com/${encodeURIComponent(src.id)}/iframe`,
  );
  url.searchParams.set("autoplay", autoPlay.toString());
  url.searchParams.set("muted", muted.toString());
  if (start) url.searchParams.set("startTime", start.toString());
  if (poster) url.searchParams.set("poster", poster);
  if (title) url.searchParams.set("title", title);
  if (link) {
    url.searchParams.set("channel-link", link);
    url.searchParams.set("share-link", link);
  }
  return url.toString();
};

export const StreamPreview = ({
  src,
  alt = "Video thumbnail",
  className,
  icon = true,
}: PreviewProps) => (
  <div className="relative aspect-video w-full">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src={getStreamUrlThumbnail(src)}
      alt={alt}
      loading="lazy"
      className={classes(
        "pointer-events-none aspect-video w-full bg-alveus-green-800 object-cover transition group-hover/trigger:scale-102 group-hover/trigger:shadow-2xl",
        !/\bshadow-/.test(className || "") && "shadow-xl",
        !/\brounded-/.test(className || "") && "rounded-2xl",
        className,
      )}
    />
    {icon && (
      <>
        <div className="absolute inset-0 m-auto box-content aspect-[10/7] w-20 rounded-2xl bg-alveus-green/25 p-0.5 backdrop-blur-sm transition group-hover/trigger:scale-110 group-hover/trigger:bg-alveus-green/50" />
        <IconYouTube
          size={80}
          className="absolute inset-0 m-auto text-white drop-shadow-md transition group-hover/trigger:scale-110 group-hover/trigger:drop-shadow-xl"
        />
      </>
    )}
  </div>
);

type EmbedProps = {
  src: StreamSource;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  className?: string;
  time?: number;
  title?: string;
  caption?: string;
  poster?: StaticImageData;
  threshold?: number;
  onEnded?: () => void;
};

export const StreamEmbed = ({
  src,
  autoplay = false,
  loop = false,
  muted = false,
  time,
  controls = false,
  className,
  title = "Video embed",
  caption,
  poster,
  threshold = 0.1,
  onEnded,
}: EmbedProps) => {
  const streamRef = useRef<StreamPlayerApi>(undefined);
  const [playing, setPlaying] = useState(autoplay);
  const [visible, setVisible] = useState(false);
  const [seen, setSeen] = useState(false);
  const [ready, setReady] = useState(false);

  const ref = useCallback(
    (node: HTMLDivElement) => {
      if (!node) return;
      if (!threshold) {
        // If no threshold is provided, we assume the element is always visible
        setVisible(true);
        setSeen(true);
        return;
      }

      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            setVisible(entry.isIntersecting);
            if (entry.isIntersecting) setSeen(true);
          });
        },
        { threshold },
      );
      obs.observe(node);

      return () => {
        obs.disconnect();
      };
    },
    [threshold],
  );

  const playPause = useCallback(() => {
    if (!streamRef.current) return;

    if (visible) {
      if (playing) {
        streamRef.current.play();
      }
    } else {
      streamRef.current.pause();
    }
  }, [visible, playing]);

  // streamRef isn't immediately available, so we loop until it is
  useEffect(() => {
    const interval = setInterval(() => {
      if (streamRef.current) {
        clearInterval(interval);
        playPause();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [playPause]);

  const computedPoster = useMemo(
    () =>
      poster &&
      env.NEXT_PUBLIC_BASE_URL +
        createImageUrl({ src: poster.src, width: 1200 }),
    [poster],
  );

  return (
    <div className="flex h-full flex-col" ref={ref}>
      <div
        className={classes(
          "relative mx-auto flex aspect-video max-w-full grow overflow-hidden",
          !/\brounded-/.test(className || "") && "rounded-2xl",
          className,
        )}
      >
        <div className="absolute inset-0 -z-10 flex h-full w-full flex-col justify-center">
          {poster ? (
            <Image
              src={poster}
              alt=""
              className="h-full w-full object-contain"
              width={1200}
            />
          ) : (
            <StreamPreview
              src={src}
              className="rounded-none shadow-none"
              icon={false}
            />
          )}

          {!ready && (
            <IconLoading
              className="absolute top-1/2 left-1/2 -translate-1/2"
              size={32}
            />
          )}
        </div>

        {seen && (
          <CloudflareStream
            src={src.id}
            customerCode={src.cu}
            loop={loop}
            muted={muted}
            controls={controls}
            currentTime={time}
            title={title}
            poster={computedPoster}
            width="100%"
            height="100%"
            className="size-full"
            letterboxColor="transparent"
            streamRef={streamRef}
            onPlay={() => visible && controls && setPlaying(true)}
            onPause={() => visible && controls && setPlaying(false)}
            onCanPlay={() => setReady(true)}
            onEnded={onEnded}
          />
        )}
      </div>

      {caption && (
        <p className="my-4 text-center text-xl text-balance text-alveus-tan md:mb-0 lg:mt-8">
          {caption}
        </p>
      )}
    </div>
  );
};
