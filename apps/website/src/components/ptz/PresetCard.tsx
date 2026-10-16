import Image from "next/image";
import { type ReactNode, useState } from "react";

import type { PresetImage } from "@/data/tech/cameras.types";

import { classes } from "@/utils/classes";

const PresetThumbnail = ({ image }: { image: PresetImage | null }) => {
  const [failed, setFailed] = useState(false);
  return image &&
    image.src &&
    image.width > 0 &&
    image.height > 0 &&
    !failed ? (
    <Image
      src={image.src}
      alt=""
      width={image.width}
      height={image.height}
      sizes="(max-width: 768px) 50vw, 300px"
      onError={() => setFailed(true)}
      className="aspect-video w-full bg-alveus-green object-cover"
    />
  ) : (
    <div
      role="img"
      aria-label="No preset image available"
      className="flex aspect-video w-full items-center justify-center bg-alveus-green text-sm text-alveus-tan"
    >
      No image available
    </div>
  );
};

const PresetCard = ({
  title,
  image,
  onLoad,
  disabled = false,
  canLoad = false,
  imageProvenance,
  className,
  children,
}: {
  title: string;
  image: PresetImage | null;
  canLoad?: boolean;
  imageProvenance?: "legacy" | "capture" | null;
  onLoad?: () => void;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
}) => (
  <div
    className={classes(
      "rounded-lg border border-alveus-green-900 shadow-lg",
      className,
    )}
  >
    <div className="relative overflow-hidden rounded-t-lg">
      <PresetThumbnail key={image?.src ?? "none"} image={image} />
    </div>
    <div className="flex flex-col gap-1 rounded-b-lg bg-alveus-tan p-2">
      <div className="flex items-center justify-between">
        <h4 className="truncate text-lg font-semibold">{title}</h4>
        {canLoad && onLoad && (
          <button
            type="button"
            onClick={onLoad}
            disabled={disabled}
            className="shrink-0 rounded-sm border border-alveus-green-700 px-2 py-1 text-sm disabled:opacity-50"
          >
            Load preset
          </button>
        )}
      </div>
      {image && imageProvenance === "legacy" && (
        <span className="text-xs text-alveus-green-600">Legacy image</span>
      )}
      <p className="text-sm text-alveus-green-600 italic">{children}</p>
    </div>
  </div>
);

export default PresetCard;
