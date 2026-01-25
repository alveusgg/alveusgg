import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Input,
} from "@headlessui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import cameras, { type Camera } from "@/data/tech/cameras";

import { classes } from "@/utils/classes";
import { typeSafeObjectEntries, typeSafeObjectKeys } from "@/utils/helpers";
import { camelToTitle } from "@/utils/string-case";

import RunCommandButton from "@/components/shared/actions/RunCommandButton";

import IconChevronDown from "@/icons/IconChevronDown";

const Button = ({
  camera,
  onClick,
  selected,
}: {
  camera: Camera;
  onClick: () => void;
  selected: Camera;
}) => (
  <div className="flex w-full shrink-0 overflow-hidden rounded shadow-md">
    <button
      onClick={onClick}
      className={classes(
        "my-auto grow px-3 py-2 text-left text-lg font-semibold backdrop-blur-sm",
        camera === selected
          ? "bg-alveus-green/75 text-white"
          : "bg-alveus-green-50/75 hover:bg-alveus-green-100/90",
      )}
    >
      {cameras[camera].title}
      <span className="text-sm text-alveus-green-400 italic">
        {` (${camera.toLowerCase()})`}
      </span>
    </button>

    {camera !== selected &&
      cameras[camera].group === cameras[selected].group && (
        <RunCommandButton
          command="swap"
          args={[selected.toLowerCase(), camera.toLowerCase()]}
          subOnly
          tooltip={{ text: "Run swap command", offset: 8 }}
          className="flex items-center rounded-r bg-alveus-green/75 px-2 text-alveus-tan backdrop-blur-sm transition-colors hover:bg-alveus-green-900/90"
        />
      )}
  </div>
);

export const CamListFull = ({
  camera,
  onChange,
}: {
  camera: Camera;
  onChange: (camera: Camera) => void;
}) => {
  // Track all the disclosure buttons so we can open/close them based on search input
  const disclosures = useRef<Set<HTMLButtonElement>>(new Set());
  const disclosureRef = useCallback((el: HTMLButtonElement) => {
    disclosures.current.add(el);
    return () => {
      disclosures.current.delete(el);
    };
  }, []);

  const [search, setSearch] = useState("");
  const searchClean = search.trim().toLowerCase();
  useEffect(() => {
    // If we have a search term, open all the disclosures that're rendered
    if (searchClean.length > 0) {
      disclosures.current.forEach((el) => {
        if (el instanceof HTMLButtonElement && !("open" in el.dataset)) {
          el.click();
        }
      });
      return;
    }

    // If we have no search term, close all disclosures
    disclosures.current.forEach((el) => {
      if (el instanceof HTMLButtonElement && "open" in el.dataset) {
        el.click();
      }
    });
  }, [searchClean]);

  // Group the cameras and filter them based on search
  const groupedCameras = useMemo(
    () =>
      typeSafeObjectEntries(cameras).reduce(
        (acc, [key, value]) =>
          !searchClean?.length ||
          value.title.toLowerCase().includes(searchClean)
            ? {
                ...acc,
                [value.group]: [...(acc[value.group] ?? []), key],
              }
            : acc,
        {} as Record<string, Camera[]>,
      ),
    [searchClean],
  );

  return (
    <>
      <Input
        type="text"
        placeholder="Search cameras..."
        aria-label="Search cameras"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded border border-alveus-green-200 bg-alveus-green-50/75 px-2 py-1 font-semibold shadow-md backdrop-blur-sm focus:ring-2 focus:ring-alveus-green focus:outline-none"
      />

      <div className="scrollbar-none flex shrink grow flex-col gap-1 overflow-y-auto pt-2">
        {typeSafeObjectEntries(groupedCameras)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([name, group]) => {
            if (group.length === 0) return null;

            if (group.length === 1) {
              const item = group[0]!;
              return (
                <Button
                  key={item}
                  camera={item}
                  onClick={() => onChange(item)}
                  selected={camera}
                />
              );
            }

            return (
              <Disclosure key={name}>
                <DisclosureButton
                  ref={disclosureRef}
                  className={classes(
                    "group flex w-full shrink-0 items-center justify-between rounded px-3 py-2 text-left text-lg font-semibold shadow-md backdrop-blur-sm",
                    cameras[camera].group === name
                      ? "bg-alveus-green/75 text-white"
                      : "bg-alveus-green-50/75 hover:bg-alveus-green-100/90",
                  )}
                >
                  <span>
                    {camelToTitle(name)} Cameras
                    <span className="text-sm text-alveus-green-400 italic">
                      {` (${group.length})`}
                    </span>
                  </span>
                  <IconChevronDown className="ml-auto size-5 group-data-[open]:-scale-y-100" />
                </DisclosureButton>
                <DisclosurePanel className="ml-4 flex flex-col gap-1">
                  {group.map((item) => (
                    <Button
                      key={item}
                      camera={item}
                      onClick={() => onChange(item)}
                      selected={camera}
                    />
                  ))}
                </DisclosurePanel>
              </Disclosure>
            );
          })}

        <div className="pointer-events-none sticky bottom-0 z-10 -mt-2 h-16 shrink-0 mask-t-from-25% backdrop-blur-sm" />
      </div>
    </>
  );
};

export const CamListDropdown = ({
  camera,
  onChange,
}: {
  camera: Camera;
  onChange: (camera: Camera) => void;
}) => (
  <>
    <label htmlFor="camera-select" className="sr-only">
      Select Camera
    </label>

    <select
      id="camera-select"
      value={camera}
      onChange={(e) => onChange(e.target.value as Camera)}
      className="w-full rounded border border-alveus-green-200 bg-alveus-green-50 px-3 py-2 text-lg font-semibold focus:ring-2 focus:ring-alveus-green focus:outline-none"
    >
      {typeSafeObjectKeys(cameras).map((camera) => (
        <option key={camera} value={camera}>
          {cameras[camera].title} ({camera.toLowerCase()})
        </option>
      ))}
    </select>
  </>
);
