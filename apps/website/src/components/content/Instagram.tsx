import { classes } from "@/utils/classes";
import { createImageUrl } from "@/utils/image";

import IconInstagram from "@/icons/IconInstagram";

type PreviewProps = {
  reelId: string;
  alt?: string;
  className?: string;
};

const imgSrc = (id: string) =>
  createImageUrl({
    src: `/api/instagram/preview/${encodeURIComponent(id)}`,
    width: 640,
    quality: 100,
  });

export const Preview = ({ reelId, alt, className }: PreviewProps) => (
  <div className="relative aspect-[9/16] h-full">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src={imgSrc(reelId)}
      alt={alt}
      loading="lazy"
      className={classes(
        "pointer-events-none size-full rounded-2xl bg-alveus-green-800 object-cover shadow-xl transition group-hover/trigger:scale-102 group-hover/trigger:shadow-2xl",
        className,
      )}
    />
    <div className="absolute inset-0 m-auto aspect-square w-16 rounded-2xl bg-alveus-green/25 backdrop-blur-sm transition group-hover/trigger:scale-110 group-hover/trigger:bg-alveus-green/50" />
    <IconInstagram
      size={64}
      className="absolute inset-0 m-auto text-white drop-shadow-md transition group-hover/trigger:scale-110 group-hover/trigger:drop-shadow-xl"
    />
  </div>
);
