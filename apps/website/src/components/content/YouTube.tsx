import { type ReactNode, useCallback, useState } from "react";

import { classes } from "@/utils/classes";
import { createImageUrl } from "@/utils/image";

import IconYouTube from "@/icons/IconYouTube";

import BaseLightbox from "./Lightbox";
import Link from "./Link";

type PreviewProps = {
  videoId: string;
  alt?: string;
  className?: string;
  icon?: boolean;
};

const imgSrc = (id: string, type: string) =>
  createImageUrl({
    src: `https://img.youtube.com/vi/${encodeURIComponent(
      id,
    )}/${encodeURIComponent(type)}.jpg`,
    width: 1280,
    quality: 100,
  });

export const YouTubePreview = ({
  videoId,
  alt = "Video thumbnail",
  className,
  icon = true,
}: PreviewProps) => {
  // Handle falling back to hq if there isn't a maxres image
  const [type, setType] = useState<"maxresdefault" | "hqdefault">(
    "maxresdefault",
  );
  const onError = useCallback(() => {
    if (type === "maxresdefault") setType("hqdefault");
  }, [type]);

  return (
    <div className="relative">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imgSrc(videoId, type)}
        onError={onError}
        alt={alt}
        loading="lazy"
        className={classes(
          "pointer-events-none bg-alveus-green-800 object-cover shadow-xl transition group-hover/trigger:scale-102 group-hover/trigger:shadow-2xl",
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
};

type EmbedProps = {
  videoId: string;
  caption?: string;
};

const iframeSrc = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${encodeURIComponent(
    id,
  )}?modestbranding=1&rel=0`;

export const YouTubeEmbed = ({ videoId, caption }: EmbedProps) => (
  <div className="flex h-full flex-col">
    <div className="mx-auto flex aspect-video max-w-full grow">
      <iframe
        src={iframeSrc(videoId)}
        title="Video embed"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="fullscreen; encrypted-media"
        sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox"
        loading="lazy"
        className="pointer-events-auto my-auto aspect-video h-auto w-full rounded-2xl bg-alveus-green-800 shadow-xl"
        allowFullScreen
      />
    </div>

    {caption && (
      <p className="my-4 text-center text-xl text-balance text-alveus-tan md:mb-0 lg:mt-8">
        {caption}
      </p>
    )}
  </div>
);

export const YouTubeLightbox = ({
  videoId,
  caption,
  children,
  className,
}: {
  videoId: string;
  caption?: string;
  children?: ReactNode;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  const onClose = useCallback(() => setOpen(false), []);

  return (
    <>
      <Link
        href={`https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`}
        external
        onClick={(e) => {
          e.preventDefault();
          setOpen(true);
        }}
        custom
        className={classes("group/trigger", className)}
      >
        {children || (
          <YouTubePreview
            videoId={videoId}
            alt={caption}
            className="aspect-video h-auto w-full"
          />
        )}
      </Link>

      <BaseLightbox
        open={open ? videoId : undefined}
        onClose={onClose}
        items={{
          [videoId]: <YouTubeEmbed videoId={videoId} caption={caption} />,
        }}
      />
    </>
  );
};
