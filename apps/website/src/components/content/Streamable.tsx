import { classes } from "@/utils/classes";
import { createImageUrl } from "@/utils/image";

import IconStreamable from "@/icons/IconStreamable";

type PreviewProps = {
  videoId: string;
  alt?: string;
  className?: string;
};

const imgSrc = (id: string) =>
  createImageUrl({
    src: `https://cdn-cf-east.streamable.com/image/${encodeURIComponent(id)}.jpg`,
    width: 1280,
    quality: 100,
  });

export const StreamablePreview = ({
  videoId,
  alt = "",
  className,
}: PreviewProps) => (
  <div className="relative">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src={imgSrc(videoId)}
      alt={alt}
      loading="lazy"
      className={classes(
        "pointer-events-none rounded-2xl bg-alveus-green-800 object-cover shadow-xl transition group-hover/trigger:scale-102 group-hover/trigger:shadow-2xl",
        className,
      )}
    />
    <div className="absolute inset-0 m-auto box-content aspect-square w-20 rounded-full bg-alveus-green/25 p-0.5 backdrop-blur-sm transition group-hover/trigger:scale-110 group-hover/trigger:bg-alveus-green/50" />
    <IconStreamable
      size={80}
      className="absolute inset-0 m-auto text-white drop-shadow-md transition group-hover/trigger:scale-110 group-hover/trigger:drop-shadow-xl"
    />
  </div>
);

type EmbedProps = {
  videoId: string;
  caption?: string;
};

const iframeSrc = (id: string) =>
  `https://streamable.com/e/${encodeURIComponent(id)}`;

export const StreamableEmbed = ({ videoId, caption }: EmbedProps) => (
  <div className="flex h-full flex-col">
    <div className="mx-auto flex aspect-video max-w-full grow">
      <iframe
        src={iframeSrc(videoId)}
        referrerPolicy="no-referrer"
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
