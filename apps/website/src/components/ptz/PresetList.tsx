import { Input, Tab, TabGroup, TabList } from "@headlessui/react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { z } from "zod";

import cameras, { type Camera } from "@/data/tech/cameras";
import {
  type PresetEntry,
  isCameraMulti,
  isCameraPTZ,
} from "@/data/tech/cameras.types";

import { classes } from "@/utils/classes";
import { typeSafeObjectEntries } from "@/utils/helpers";
import { sortPresets } from "@/utils/sort-presets";
import { camelToKebab } from "@/utils/string-case";

import useLocalStorage from "@/hooks/storage";
import useTooltip from "@/hooks/tooltip";

import Heading from "@/components/content/Heading";
import PresetCard from "@/components/ptz/PresetCard";
import PresetMap from "@/components/ptz/PresetMap";
import RunCommandButton from "@/components/shared/actions/RunCommandButton";

import IconMapPin from "@/icons/IconMapPin";
import IconMenu from "@/icons/IconMenu";
import IconZoomIn from "@/icons/IconZoomIn";
import IconZoomOut from "@/icons/IconZoomOut";

type PresetView = "list" | "map";

const PresetToolsTab = ({
  tooltip,
  children,
}: {
  tooltip: string;
  children: ReactNode;
}) => {
  const { props, element } = useTooltip({ content: tooltip, offset: 4 });

  return (
    <Tab
      {...props}
      className={({ selected }) =>
        classes(
          "px-3 py-1.5 transition-colors focus:outline-none",
          selected
            ? "bg-alveus-green-700 text-alveus-green-50"
            : "text-alveus-green-800 hover:bg-alveus-green-100",
        )
      }
    >
      {element}
      {children}
    </Tab>
  );
};

const PresetTools = ({
  camera,
  zoom,
  search,
  onSearch,
  view,
  onView,
}: {
  camera: Camera;
  zoom: boolean;
  search: string;
  onSearch: (value: string) => void;
  view: PresetView;
  onView: (value: PresetView) => void;
}) => (
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

            <div className="pointer-events-none -ml-0.5 h-0.5 w-4 rounded-sm bg-alveus-green-400" />

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
          onChange={(e) => onSearch(e.target.value)}
          className="grow rounded-sm border border-alveus-green-200 bg-alveus-green-50/75 px-2 py-1 font-semibold shadow-md focus:ring-2 focus:ring-alveus-green focus:outline-none focus:ring-inset"
        />

        <TabGroup
          selectedIndex={view === "list" ? 0 : 1}
          onChange={(index) => onView(index === 0 ? "list" : "map")}
        >
          <TabList className="inline-flex overflow-hidden rounded-sm border border-alveus-green-300 bg-alveus-green-50 text-sm font-semibold shadow-sm">
            <PresetToolsTab tooltip="List view">
              <IconMenu className="size-5" />
            </PresetToolsTab>
            <PresetToolsTab tooltip="Map view">
              <IconMapPin className="size-5" />
            </PresetToolsTab>
          </TabList>
        </TabGroup>
      </>
    )}
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
  const [view, setView] = useLocalStorage<PresetView>(
    "presets:view",
    useMemo(() => z.enum(["list", "map"]), []),
    "list",
  );
  const searchClean = search.trim().toLowerCase();

  useEffect(() => {
    // Reset the search presets when the selected camera changes
    setSearch("");

    // Reset the view to list if a non-PTZ camera is selected
    if (!isCameraPTZ(cameras[camera])) {
      setView("list");
    }
  }, [camera, setView]);

  const sorted = useMemo(
    () =>
      isCameraPTZ(cameras[camera])
        ? sortPresets(typeSafeObjectEntries(cameras[camera].presets))
        : [],
    [camera],
  );

  const filter = useMemo(() => {
    if (!searchClean.length) return undefined;

    return ([name, preset]: PresetEntry) =>
      name.toLowerCase().includes(searchClean) ||
      preset.description.toLowerCase().includes(searchClean);
  }, [searchClean]);

  return (
    <>
      <PresetTools
        camera={camera}
        zoom={zoom}
        search={search}
        onSearch={setSearch}
        view={view}
        onView={setView}
      />

      {view === "list" ? (
        <div className="scrollbar-none shrink grow overflow-y-auto">
          <div className="mt-3 grid grid-cols-2 gap-4 @3xl:grid-cols-3 @5xl:grid-cols-4">
            {sorted.filter(filter ?? (() => true)).map(([name, preset]) => (
              <PresetCard
                key={name}
                title={name}
                image={preset.image}
                command={{
                  command: "ptzload",
                  args: [camera.toLowerCase(), name],
                }}
              >
                {preset.description}
              </PresetCard>
            ))}

            {isCameraMulti(cameras[camera]) && (
              <PresetCard
                title={cameras[camera].multi.cameras.join(" + ")}
                image={cameras[camera].multi.image}
                className="col-span-2"
              >
                {cameras[camera].multi.description}
              </PresetCard>
            )}
          </div>

          <div className="pointer-events-none sticky bottom-0 z-10 -mt-2 h-16 mask-t-from-25% backdrop-blur-sm" />
        </div>
      ) : (
        <PresetMap camera={camera} presets={sorted} filter={filter} />
      )}
    </>
  );
};

export default PresetList;
