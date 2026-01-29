import { Input } from "@headlessui/react";
import Image, { type StaticImageData } from "next/image";
import { type ReactNode, useEffect, useState } from "react";

import cameras, {
  type Camera,
  isCameraMulti,
  isCameraPTZ,
} from "@/data/tech/cameras";

import { classes } from "@/utils/classes";
import { typeSafeObjectEntries } from "@/utils/helpers";
import { camelToKebab } from "@/utils/string-case";
import { type RouterInputs } from "@/utils/trpc";

import Heading from "@/components/content/Heading";
import CopyToClipboardButton from "@/components/shared/actions/CopyToClipboardButton";
import RunCommandButton from "@/components/shared/actions/RunCommandButton";

import IconZoomIn from "@/icons/IconZoomIn";
import IconZoomOut from "@/icons/IconZoomOut";

type Command = RouterInputs["stream"]["runCommand"];

const Card = ({
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

const PresetList = ({
  camera,
  zoom = false,
}: {
  camera: Camera;
  zoom?: boolean;
}) => {
  const [search, setSearch] = useState("");
  const searchClean = search.trim().toLowerCase();
  useEffect(() => {
    // Reset the search presets when the selected camera changes
    setSearch("");
  }, [camera]);

  return (
    <>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Heading
          level={3}
          className="my-0 shrink-0 scroll-mt-14 text-2xl"
          id={`presets:${camelToKebab(camera)}`}
        >
          {cameras[camera].title}
          <span className="text-sm text-alveus-green-400 italic">
            {` (${camera.toLowerCase()})`}
          </span>
        </Heading>

        {isCameraPTZ(cameras[camera]) && (
          <>
            {zoom && (
              <div className="flex items-center">
                <RunCommandButton
                  command="ptzzoom"
                  args={[camera.toLowerCase(), "80"]}
                  tooltip={{ text: "Run zoom out command" }}
                  icon={IconZoomOut}
                />

                <div className="pointer-events-none -ml-0.5 h-0.5 w-4 rounded bg-alveus-green-400" />

                <RunCommandButton
                  command="ptzzoom"
                  args={[camera.toLowerCase(), "120"]}
                  tooltip={{ text: "Run zoom in command" }}
                  icon={IconZoomIn}
                />
              </div>
            )}

            <Input
              type="text"
              placeholder="Search presets..."
              aria-label="Search presets"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="grow rounded border border-alveus-green-200 bg-alveus-green-50/75 px-2 py-1 font-semibold shadow-md focus:ring-2 focus:ring-alveus-green focus:outline-none focus:ring-inset"
            />
          </>
        )}
      </div>

      <div className="scrollbar-none shrink grow overflow-y-auto">
        <div className="mt-3 grid grid-cols-2 gap-4 @3xl:grid-cols-3 @5xl:grid-cols-4">
          {isCameraPTZ(cameras[camera]) &&
            typeSafeObjectEntries(cameras[camera].presets)
              .filter(
                ([name, preset]) =>
                  !searchClean.length ||
                  name.toLowerCase().includes(searchClean) ||
                  preset.description.toLowerCase().includes(searchClean),
              )
              .map(([name, preset]) => (
                <Card
                  key={name}
                  title={name}
                  image={preset.image}
                  command={{
                    command: "ptzload",
                    args: [camera.toLowerCase(), name],
                  }}
                >
                  {preset.description}
                </Card>
              ))}

          {isCameraMulti(cameras[camera]) && (
            <Card
              title={cameras[camera].multi.cameras.join(" + ")}
              image={cameras[camera].multi.image}
              className="col-span-2"
            >
              {cameras[camera].multi.description}
            </Card>
          )}
        </div>

        <div className="pointer-events-none sticky bottom-0 z-10 -mt-2 h-16 mask-t-from-25% backdrop-blur-sm" />
      </div>
    </>
  );
};

export default PresetList;
