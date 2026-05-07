import Image, { type StaticImageData } from "next/image";
import { type ReactNode } from "react";

import { classes } from "@/utils/classes";
import { type RouterInputs } from "@/utils/trpc";

import CopyToClipboardButton from "@/components/shared/actions/CopyToClipboardButton";
import RunCommandButton from "@/components/shared/actions/RunCommandButton";

type Command = RouterInputs["stream"]["runCommand"];

const PresetCard = ({
  title,
  image,
  command,
  className,
  children,
}: {
  title: string;
  image: StaticImageData;
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
      <Image
        src={image}
        alt=""
        width={300}
        className="aspect-video w-full object-cover"
      />
      {command && (
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
        {command && (
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
      <p className="text-sm text-alveus-green-600 italic">{children}</p>
    </div>
  </div>
);

export default PresetCard;
