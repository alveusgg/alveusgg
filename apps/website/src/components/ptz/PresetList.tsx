import {
  Input,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Tab,
  TabGroup,
  TabList,
} from "@headlessui/react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
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
import { trpc } from "@/utils/trpc";

import useLocalStorage from "@/hooks/storage";
import useSubscriberAccess from "@/hooks/subscription";
import useTooltip from "@/hooks/tooltip";

import Heading from "@/components/content/Heading";
import PresetCard from "@/components/ptz/PresetCard";
import PresetMap from "@/components/ptz/PresetMap";
import ActionPreviewTooltip from "@/components/shared/actions/ActionPreviewTooltip";

import IconMapPin from "@/icons/IconMapPin";
import IconMenu from "@/icons/IconMenu";
import IconXCircle from "@/icons/IconXCircle";
import IconZoomIn from "@/icons/IconZoomIn";
import IconZoomOut from "@/icons/IconZoomOut";

type PresetView = "list" | "map";
type ZoomDirection = "in" | "out";

const zoomOutLevels = ["10", "50", "70", "90"] as const;
const zoomInLevels = ["125", "150", "200", "400", "600"] as const;

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

const ZoomOption = ({
  camera,
  level,
  direction,
}: {
  camera: string;
  level: string;
  direction: ZoomDirection;
}) => {
  const percent =
    direction === "out" ? 100 - Number(level) : Number(level) - 100;
  const sign = direction === "out" ? "-" : "+";

  const { props, element } = useTooltip({
    content: (
      <ActionPreviewTooltip preview={`!ptzzoom ${camera} ${level}`}>
        {`Zoom ${direction} by ${sign}${percent}%`}
      </ActionPreviewTooltip>
    ),
    aria: `Zoom ${direction} by ${sign}${percent}%`,
    placement: "right",
  });

  return (
    <ListboxOption
      value={level}
      className="cursor-pointer rounded-sm px-2 py-1 text-sm data-focus:bg-alveus-green-100"
      as="li"
      {...props}
    >
      {element}
      {level}%
    </ListboxOption>
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
}) => {
  const { hasScopes, subscription } = useSubscriberAccess();
  const canZoom = hasScopes && !!subscription.data;
  const cameraSlug = camera.toLowerCase();

  const { mutate: runCommand, status } = trpc.stream.runCommand.useMutation();
  const isPending = status === "pending";

  const [zoomValue, setZoomValue] = useState("");

  const onZoomChange = useCallback(
    (value: string) => {
      runCommand({ command: "ptzzoom", args: [cameraSlug, value] });
      // Reset back to the placeholder, the dropdown is an action trigger,
      // not a reflection of the camera's actual zoom state
      setZoomValue("");
    },
    [runCommand, cameraSlug],
  );

  const [statusText, setStatusText] = useState<string>();
  useEffect(() => {
    if (status === "idle") {
      setStatusText(undefined);
      return;
    }

    if (status === "pending") {
      setStatusText("Sending command...");
      return;
    }

    if (status === "success") {
      setStatusText("Command sent!");
      const timeout = setTimeout(() => setStatusText(undefined), 2000);
      return () => clearTimeout(timeout);
    }

    if (status === "error") {
      setStatusText("Error sending command");
      const timeout = setTimeout(() => setStatusText(undefined), 2000);
      return () => clearTimeout(timeout);
    }
  }, [status]);

  const zoomOutTooltip = useTooltip({
    content: statusText ?? "Zoom out",
    force: !!statusText,
  });
  const zoomInTooltip = useTooltip({
    content: statusText ?? "Zoom in",
    force: !!statusText,
  });

  const zoomButtonClasses = classes(
    "inline-block p-1 text-alveus-green-400 hover:text-black focus:outline-none",
    isPending && "opacity-60",
  );

  const zoomOptionsClasses =
    "absolute top-full z-30 mt-1 flex max-h-60 min-w-18 flex-col gap-0.5 overflow-auto rounded-md border border-alveus-green-200 bg-alveus-green-50 p-1 text-alveus-green-900 shadow-lg transition-opacity duration-100 ease-in-out focus:outline-hidden data-closed:opacity-0";

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <Heading
        level={3}
        className="my-0 shrink-0 scroll-mt-14 text-2xl"
        id={`presets:${camelToKebab(camera)}`}
      >
        {cameras[camera].title}
        <span className="text-sm text-alveus-green-400 italic">
          {` (${cameraSlug})`}
        </span>
      </Heading>

      {isCameraPTZ(cameras[camera]) && (
        <>
          {zoom && canZoom && (
            <div className="flex items-center">
              <Listbox
                value={zoomValue}
                onChange={onZoomChange}
                disabled={isPending}
              >
                <div className="relative">
                  <ListboxButton
                    className={zoomButtonClasses}
                    {...zoomOutTooltip.props}
                  >
                    <IconZoomOut className="size-5" />
                  </ListboxButton>
                  {zoomOutTooltip.element}

                  <ListboxOptions
                    transition
                    className={zoomOptionsClasses}
                    as="ul"
                  >
                    {zoomOutLevels.map((level) => (
                      <ZoomOption
                        key={level}
                        camera={cameraSlug}
                        level={level}
                        direction="out"
                      />
                    ))}
                  </ListboxOptions>
                </div>
              </Listbox>

              <div className="pointer-events-none -ml-0.5 h-0.5 w-4 rounded-sm bg-alveus-green-400" />

              <Listbox
                value={zoomValue}
                onChange={onZoomChange}
                disabled={isPending}
              >
                <div className="relative">
                  <ListboxButton
                    className={zoomButtonClasses}
                    {...zoomInTooltip.props}
                  >
                    <IconZoomIn className="size-5" />
                  </ListboxButton>
                  {zoomInTooltip.element}

                  <ListboxOptions
                    transition
                    className={zoomOptionsClasses}
                    as="ul"
                  >
                    {zoomInLevels.map((level) => (
                      <ZoomOption
                        key={level}
                        camera={cameraSlug}
                        level={level}
                        direction="in"
                      />
                    ))}
                  </ListboxOptions>
                </div>
              </Listbox>
            </div>
          )}

          <div className="relative grow">
            <Input
              type="text"
              placeholder="Search presets..."
              aria-label="Search presets"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full rounded-sm border border-alveus-green-200 bg-alveus-green-50/75 px-2 py-1 pr-8 font-semibold shadow-md focus:ring-2 focus:ring-alveus-green focus:outline-none focus:ring-inset"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearch("")}
                aria-label="Clear search"
                className="absolute inset-y-0 right-0 flex items-center pr-2 text-alveus-green-400 hover:text-alveus-green-700"
              >
                <IconXCircle className="size-4" />
              </button>
            )}
          </div>

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
};

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
                key={`${camera}-${name}`}
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
