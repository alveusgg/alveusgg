import Image from "next/image";
import { type ReactNode, useState } from "react";

import type { PresetImage } from "@/data/tech/cameras.types";

import { classes } from "@/utils/classes";
import { type RouterInputs } from "@/utils/trpc";

import CopyToClipboardButton from "@/components/shared/actions/CopyToClipboardButton";
import RunCommandButton from "@/components/shared/actions/RunCommandButton";

type Command = RouterInputs["stream"]["runCommand"];

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
  command,
  canLoad = false,
  imageProvenance,
  className,
  children,
}: {
  title: string;
  image: PresetImage | null;
  canLoad?: boolean;
  imageProvenance?: "legacy" | "capture" | null;
  command?: Command;
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
      {canLoad && command && (
        <RunCommandButton
          command={command.command}
          args={command.args}
          subOnly
          tooltip={{ offset: 8 }}
          className="absolute inset-0 flex items-center justify-center text-alveus-green-100 opacity-25 transition-all hover:bg-black/50 hover:text-alveus-green-300 hover:opacity-100 [&>svg]:size-12"
        />
      )}
    </div>
    <div className="flex flex-col gap-1 rounded-b-lg bg-alveus-tan p-2">
      <div className="flex items-center justify-between">
        <h4 className="truncate text-lg font-semibold">{title}</h4>
        {canLoad && command && (
          <div className="flex gap-1">
            <CopyToClipboardButton
              text={`!${[command.command, ...(command.args ?? [])].join(" ")}`}
              options={{ initialText: "Copy command" }}
              preview
            />
            <RunCommandButton
              command={command.command}
              args={command.args}
              subOnly
            />
          </div>
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
