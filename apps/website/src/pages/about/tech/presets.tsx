import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Field,
  Input,
  Label,
  Switch,
} from "@headlessui/react";
import { type NextPage } from "next";
import Image, { type StaticImageData } from "next/image";
import {
  Fragment,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { z } from "zod";

import cameras, { type Camera } from "@/data/tech/cameras";
import type { CameraMulti, CameraPTZ } from "@/data/tech/cameras.types";
import { channels, scopeGroups } from "@/data/twitch";

import { classes } from "@/utils/classes";
import {
  isDefinedEntry,
  typeSafeObjectEntries,
  typeSafeObjectKeys,
} from "@/utils/helpers";
import { camelToKebab, camelToTitle } from "@/utils/string-case";
import { type RouterInputs, trpc } from "@/utils/trpc";

import useLocalStorage from "@/hooks/storage";

import Consent from "@/components/Consent";
import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import Twitch, { TwitchChat } from "@/components/content/Twitch";
import ProvideAuth from "@/components/shared/LoginWithExtraScopes";
import ActionButton from "@/components/shared/actions/ActionButton";
import CopyToClipboardButton from "@/components/shared/actions/CopyToClipboardButton";
import RunCommandButton from "@/components/shared/actions/RunCommandButton";

import IconCheck from "@/icons/IconCheck";
import IconChevronDown from "@/icons/IconChevronDown";
import IconLoading from "@/icons/IconLoading";
import IconVideoCamera from "@/icons/IconVideoCamera";
import IconX from "@/icons/IconX";
import IconZoomIn from "@/icons/IconZoomIn";
import IconZoomOut from "@/icons/IconZoomOut";

import leafLeftImage1 from "@/assets/floral/leaf-left-1.png";
import leafLeftImage3 from "@/assets/floral/leaf-left-3.png";
import leafRightImage2 from "@/assets/floral/leaf-right-2.png";

type Command = RouterInputs["stream"]["runCommand"];

const sidebarClamp = (val: number) =>
  Math.min(Math.max(val, 400), window.innerWidth / 2);

const sidebarDefault = () =>
  typeof window !== "undefined" ? sidebarClamp(window.innerWidth / 3) : -1;

const getPositionIcon = (position: number) => {
  const PositionIcon = ({ className }: { className?: string }) => (
    <div
      className={classes(
        "box-content flex items-center justify-center rounded-sm border-2 border-current p-0.5 font-mono text-sm",
        className,
      )}
    >
      {position}
    </div>
  );
  return PositionIcon;
};

const Button = ({
  camera,
  title,
  group,
  onClick,
  selected,
}: {
  camera: Camera;
  title: string;
  group: string;
  onClick: () => void;
  selected: {
    camera: Camera;
    group: string;
  };
}) => (
  <div className="flex w-full shrink-0 overflow-hidden rounded shadow-md">
    <button
      onClick={onClick}
      className={classes(
        "my-auto grow px-3 py-2 text-left text-lg font-semibold backdrop-blur-sm",
        camera === selected.camera
          ? "bg-alveus-green/75 text-white"
          : "bg-alveus-green-50/75 hover:bg-alveus-green-100/90",
      )}
    >
      {title}
      <span className="text-sm text-alveus-green-400 italic">
        {` (${camera.toLowerCase()})`}
      </span>
    </button>

    {camera !== selected.camera && group === selected.group && (
      <RunCommandButton
        command="swap"
        args={[selected.camera.toLowerCase(), camera.toLowerCase()]}
        subOnly
        tooltip="Run swap command"
        className="flex items-center rounded-r bg-alveus-green/75 px-2 text-alveus-tan backdrop-blur-sm transition-colors hover:bg-alveus-green-900/90"
      />
    )}
  </div>
);

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
    <Image
      src={image}
      alt=""
      width={300}
      className="aspect-video w-full rounded-t-lg object-cover transition-transform"
    />
    <div className="flex flex-col gap-1 rounded-b-lg bg-alveus-tan p-2">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold">{title}</h4>
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

const AboutTechPresetsPage: NextPage = () => {
  const { data: session } = trpc.auth.getSession.useQuery();
  const subscription = trpc.stream.getSubscription.useQuery(undefined, {
    enabled: scopeGroups.chat.every((scope) =>
      session?.user?.scopes?.includes(scope),
    ),
  });

  // Allow the camera UI to be focused with other page UI hidden
  const [focused, setFocused] = useLocalStorage(
    "presets:focused",
    useMemo(() => z.boolean(), []),
    false,
  );
  const zen = subscription.isSuccess && subscription.data && focused;
  useEffect(() => {
    if (zen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [zen]);

  // Track all the disclosure buttons so we can open/close them based on search input
  const disclosures = useRef<Set<HTMLButtonElement>>(new Set());
  const disclosureRef = useCallback((el: HTMLButtonElement) => {
    disclosures.current.add(el);
    return () => {
      disclosures.current.delete(el);
    };
  }, []);

  const [searchCamera, setSearchCamera] = useState("");
  const searchCameraSanitized = searchCamera.trim().toLowerCase();
  useEffect(() => {
    // If we have a search term, open all the disclosures that're rendered
    if (searchCameraSanitized.length > 0) {
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
  }, [searchCameraSanitized]);

  // Filer the cameras based on the search term and group them
  const groupedCameras = useMemo(
    () =>
      typeSafeObjectEntries(cameras).reduce(
        (acc, [key, value]) =>
          !searchCameraSanitized.length ||
          value.title.toLowerCase().includes(searchCameraSanitized)
            ? {
                ...acc,
                [value.group]: {
                  ...acc[value.group],
                  [key]: value,
                },
              }
            : acc,
        {} as Record<string, Partial<typeof cameras>>,
      ),
    [searchCameraSanitized],
  );

  const [selectedCamera, setSelectedCamera] = useState<Camera>(
    typeSafeObjectKeys(cameras)[0]!,
  );
  const selectedData = cameras[selectedCamera] as CameraPTZ | CameraMulti;
  const [selectedPosition, setSelectedPosition] = useState<number>();

  const [searchPresets, setSearchPresets] = useState("");
  const searchPresetsSanitized = searchPresets.trim().toLowerCase();
  useEffect(() => {
    // Reset the search presets when the selected camera changes
    setSearchPresets("");
  }, [selectedCamera]);

  // Allow the sidebar to be resized with a draggable handle
  const [twitchEmbed, setTwitchEmbed] = useLocalStorage(
    "presets:twitch-embed",
    useMemo(
      () =>
        z.number().transform((val) => (val === -1 ? -1 : sidebarClamp(val))),
      [],
    ),
    sidebarDefault(),
  );
  const sidebarDrag = useRef(false);
  const sidebarContainer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!sidebarDrag.current) return;

      const container = sidebarContainer.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      setTwitchEmbed(sidebarClamp(rect.right - e.clientX));
    };

    const handleMouseUp = () => {
      sidebarDrag.current = false;
      window.document.documentElement.style.cursor = "";
      window.document.body.style.pointerEvents = "";
    };

    const handleResize = () => {
      setTwitchEmbed((prev) => (prev === -1 ? -1 : sidebarClamp(prev)));
    };
    handleResize();

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("resize", handleResize);
    };
  }, [setTwitchEmbed]);

  const sidebar =
    subscription.isSuccess && subscription.data && twitchEmbed !== -1;

  return (
    <>
      <Meta
        title="Camera Presets at Alveus"
        description="Control the cameras on the Alveus Sanctuary livestream by loading preset positions. Preview all the available camera presets and run chat commands directly from this page to change the camera views."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <div className="relative">
        <Image
          src={leafLeftImage1}
          alt=""
          className="pointer-events-none absolute -top-8 right-0 z-10 hidden h-full max-h-80 w-auto -scale-x-100 drop-shadow-md select-none lg:block"
        />

        <Section dark className="py-24">
          <div className="w-full lg:w-3/5">
            <Heading level={1}>Camera Presets at Alveus</Heading>
            <p className="text-lg text-balance">
              Control the cameras on the livestream by loading preset positions
              for the cameras if you&apos;re subscribed to{" "}
              <Link href="/live/twitch" external dark>
                Alveus Sanctuary on Twitch
              </Link>
              .
            </p>
          </div>
        </Section>
      </div>

      {/* Grow the last section to cover the page */}
      <div
        className={classes(
          "flex bg-alveus-green py-4",
          zen ? "fixed inset-0 z-100 h-screen" : "relative lg:h-screen",
        )}
      >
        <Section
          className={classes(
            "@container z-10 grow py-0 pt-4",
            sidebar && "rounded-r-xl",
          )}
          containerClassName="h-full flex flex-col"
        >
          {!zen && (
            <Image
              src={leafLeftImage3}
              alt=""
              className="pointer-events-none absolute right-0 -bottom-24 z-10 hidden h-auto w-1/2 max-w-48 -scale-x-100 drop-shadow-md select-none lg:block"
            />
          )}

          <div className="scrollbar-none flex h-full max-h-full flex-col overflow-x-hidden overflow-y-auto">
            <div className="grid grid-cols-1 gap-x-8 gap-y-4 @3xl:grid-cols-5">
              {!zen && (
                <div className="grid w-full grid-cols-1 gap-2 @3xl:col-span-3">
                  <p>
                    If you&apos;re subscribed, you can run these commands
                    directly from this page by clicking the{" "}
                    <span className="font-semibold text-alveus-green">
                      Run command{" "}
                      <IconVideoCamera className="mb-0.5 inline-block size-4" />
                    </span>{" "}
                    button in each preset card. This will automatically send the
                    command to the{" "}
                    <Link
                      href={`https://twitch.tv/${channels.alveusgg.username}`}
                      external
                    >
                      {channels.alveusgg.username} Twitch chat
                    </Link>{" "}
                    as if you had typed it in the chat yourself.
                  </p>

                  <p className="hidden lg:block">
                    Next to each camera in the menu you&apos;ll also find a{" "}
                    <span className="font-semibold text-alveus-green">
                      Run swap command{" "}
                      <IconVideoCamera className="mb-0.5 inline-block size-4" />
                    </span>{" "}
                    button if the camera is in the same enclosure as the
                    currently selected camera, allowing you to swap which camera
                    is shown on stream if you&apos;re subscribed.
                  </p>

                  <p>
                    Make sure to enable the embedded stream player, or have the{" "}
                    <Link href="/live/twitch" external>
                      livestream
                    </Link>{" "}
                    open in another tab, to see the cameras change as you load
                    presets
                    <span className="hidden lg:inline">
                      {" "}
                      and swap which cameras are on stream
                    </span>
                    .
                  </p>
                </div>
              )}

              <div
                className={classes(
                  "grid w-full grid-cols-1 gap-x-8 gap-y-2",
                  zen ? "col-span-full @3xl:grid-cols-2" : "@3xl:col-span-2",
                )}
              >
                <ProvideAuth scopeGroup="chat" className="mb-4" />

                {!subscription.isPaused && (
                  <div
                    className={classes(
                      "mb-auto flex items-center justify-between rounded-xl p-3 text-lg text-alveus-tan",
                      subscription.isSuccess &&
                        (subscription.data ? "bg-alveus-green" : "bg-red"),
                      subscription.isLoading && "bg-twitch",
                      subscription.isError && "bg-red",
                    )}
                  >
                    <p>
                      {subscription.isSuccess &&
                        (subscription.data
                          ? `@${session?.user?.name} is subscribed at Tier ${subscription.data.tier.replace(/0+$/, "")}`
                          : `@${session?.user?.name} is not subscribed`)}

                      {subscription.isLoading &&
                        "Checking subscription status..."}
                      {subscription.isError &&
                        "Failed to check subscription status"}
                    </p>

                    {subscription.isSuccess &&
                      (subscription.data ? (
                        <IconCheck className="size-6" />
                      ) : (
                        <IconX className="size-6" />
                      ))}

                    {subscription.isLoading && (
                      <IconLoading className="size-6 animate-spin" />
                    )}
                    {subscription.isError && <IconX className="size-6" />}
                  </div>
                )}

                {subscription.isSuccess && subscription.data && (
                  <>
                    {/* Use a viewport media query, not a container media query, as we don't want the focused + sidebar layouts available on mobile */}
                    <div
                      className={classes(
                        zen
                          ? "order-first row-span-2 grid grid-rows-subgrid"
                          : "hidden lg:contents",
                      )}
                    >
                      <Field className="flex flex-wrap items-center justify-between gap-2">
                        <Label className="flex grow cursor-pointer flex-col leading-tight">
                          <span>Enable embedded Twitch stream player</span>
                          <span className="text-sm text-alveus-green-400 italic">
                            (also embeds the {channels.alveusgg.username} stream
                            chat)
                          </span>
                        </Label>

                        <Switch
                          checked={twitchEmbed !== -1}
                          onChange={(val) =>
                            setTwitchEmbed(val ? sidebarDefault() : -1)
                          }
                          className="group inline-flex h-6 w-11 shrink-0 items-center rounded-full bg-alveus-green-300 transition-colors data-checked:bg-alveus-green"
                        >
                          <span className="size-4 translate-x-1 rounded-full bg-alveus-tan transition-transform group-data-checked:translate-x-6" />
                        </Switch>
                      </Field>

                      <Field className="flex flex-wrap items-center justify-between gap-2">
                        <Label className="flex grow cursor-pointer flex-col leading-tight">
                          <span>Enable zen control mode</span>
                          <span className="text-sm text-alveus-green-400 italic">
                            (hides all other page UI elements)
                          </span>
                        </Label>

                        <Switch
                          checked={focused}
                          onChange={setFocused}
                          className="group inline-flex h-6 w-11 shrink-0 items-center rounded-full bg-alveus-green-300 transition-colors data-checked:bg-alveus-green"
                        >
                          <span className="size-4 translate-x-1 rounded-full bg-alveus-tan transition-transform group-data-checked:translate-x-6" />
                        </Switch>
                      </Field>
                    </div>

                    <Field className="flex flex-wrap items-center justify-between gap-2">
                      <Label className="flex flex-col leading-tight">
                        <span>Swap camera positions on stream</span>
                        <span className="text-sm text-alveus-green-400 italic">
                          (select two grid positions to swap them)
                        </span>
                      </Label>

                      <div className="flex">
                        {Array.from({ length: 6 }).map((_, i) =>
                          !selectedPosition || selectedPosition === i + 1 ? (
                            <ActionButton
                              key={i}
                              onClick={() =>
                                setSelectedPosition(
                                  selectedPosition === i + 1
                                    ? undefined
                                    : i + 1,
                                )
                              }
                              icon={getPositionIcon(i + 1)}
                              tooltip={{
                                text:
                                  selectedPosition === i + 1
                                    ? "Cancel position swap"
                                    : `Swap position ${i + 1} with another`,
                              }}
                            />
                          ) : (
                            <RunCommandButton
                              key={i}
                              command="swap"
                              args={[
                                selectedPosition.toString(),
                                (i + 1).toString(),
                              ]}
                              tooltip={`Run swap command for positions ${selectedPosition} and ${i + 1}`}
                              icon={getPositionIcon(i + 1)}
                              onClick={() => setSelectedPosition(undefined)}
                              className="text-highlight hover:text-black"
                            />
                          ),
                        )}
                      </div>
                    </Field>
                  </>
                )}
              </div>
            </div>

            <div className="mt-6 grid min-h-0 shrink grow grid-cols-1 items-start gap-6 @3xl:grid-cols-3 @5xl:grid-cols-4">
              {/* Camera List */}
              <div className="col-span-1 space-y-2 @3xl:sticky @3xl:top-0 @3xl:flex @3xl:max-h-full @3xl:min-h-0 @3xl:flex-col">
                {/* Mobile: Dropdown */}
                <div className="mb-2 block @3xl:hidden">
                  <label htmlFor="camera-select" className="sr-only">
                    Select Camera
                  </label>
                  <select
                    id="camera-select"
                    value={selectedCamera}
                    onChange={(e) =>
                      setSelectedCamera(e.target.value as Camera)
                    }
                    className="w-full rounded border border-alveus-green-200 bg-alveus-green-50 px-3 py-2 text-lg font-semibold focus:ring-2 focus:ring-alveus-green focus:outline-none"
                  >
                    {Object.values(groupedCameras)
                      .flatMap((group) => typeSafeObjectKeys(group))
                      .map((camera) => (
                        <option key={camera} value={camera}>
                          {cameras[camera].title} ({camera.toLowerCase()})
                        </option>
                      ))}
                  </select>
                </div>

                {/* Desktop: Button List */}
                <div className="relative hidden @3xl:contents">
                  <Image
                    src={leafRightImage2}
                    alt=""
                    className="pointer-events-none absolute top-0 right-0 -z-10 h-96 max-h-full w-auto drop-shadow-md select-none"
                  />

                  <Input
                    type="text"
                    placeholder="Search cameras..."
                    aria-label="Search cameras"
                    value={searchCamera}
                    onChange={(e) => setSearchCamera(e.target.value)}
                    className="w-full rounded border border-alveus-green-200 bg-alveus-green-50/75 px-2 py-1 font-semibold shadow-md backdrop-blur-sm focus:ring-2 focus:ring-alveus-green focus:outline-none"
                  />

                  <div className="scrollbar-none flex shrink grow flex-col gap-1 overflow-y-auto pt-2">
                    {typeSafeObjectEntries(groupedCameras)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([name, group]) => {
                        const groupEntries =
                          typeSafeObjectEntries(group).filter(isDefinedEntry);
                        if (groupEntries.length === 0) return null;

                        if (groupEntries.length === 1) {
                          const [camera, { title, group }] = groupEntries[0]!;
                          return (
                            <Button
                              key={camera}
                              camera={camera}
                              title={title}
                              group={group}
                              onClick={() => setSelectedCamera(camera)}
                              selected={{
                                camera: selectedCamera,
                                group: selectedData.group,
                              }}
                            />
                          );
                        }

                        return (
                          <Disclosure key={name}>
                            <DisclosureButton
                              ref={disclosureRef}
                              className={classes(
                                "group flex w-full shrink-0 items-center justify-between rounded px-3 py-2 text-left text-lg font-semibold shadow-md backdrop-blur-sm",
                                selectedData.group === name
                                  ? "bg-alveus-green/75 text-white"
                                  : "bg-alveus-green-50/75 hover:bg-alveus-green-100/90",
                              )}
                            >
                              <span>
                                {camelToTitle(name)} Cameras
                                <span className="text-sm text-alveus-green-400 italic">
                                  {` (${groupEntries.length})`}
                                </span>
                              </span>
                              <IconChevronDown className="ml-auto size-5 group-data-[open]:-scale-y-100" />
                            </DisclosureButton>
                            <DisclosurePanel className="ml-4 flex flex-col gap-1">
                              {groupEntries.map(
                                ([camera, { title, group }]) => (
                                  <Button
                                    key={camera}
                                    camera={camera}
                                    title={title}
                                    group={group}
                                    onClick={() => setSelectedCamera(camera)}
                                    selected={{
                                      camera: selectedCamera,
                                      group: selectedData.group,
                                    }}
                                  />
                                ),
                              )}
                            </DisclosurePanel>
                          </Disclosure>
                        );
                      })}

                    <div className="pointer-events-none sticky bottom-0 z-10 -mt-2 h-16 shrink-0 mask-t-from-25% backdrop-blur-sm" />
                  </div>
                </div>
              </div>

              {/* Preset List */}
              <div className="col-span-1 flex max-h-full min-h-64 flex-col @3xl:sticky @3xl:top-0 @3xl:col-span-2 @5xl:col-span-3">
                {selectedCamera && (
                  <Fragment key={selectedCamera}>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <Heading
                        level={3}
                        className="my-0 shrink-0 scroll-mt-14 text-2xl"
                        id={`presets:${camelToKebab(selectedCamera)}`}
                      >
                        {selectedData.title}
                        <span className="text-sm text-alveus-green-400 italic">
                          {` (${selectedCamera.toLowerCase()})`}
                        </span>
                      </Heading>

                      {"presets" in selectedData && (
                        <>
                          {subscription.isSuccess && subscription.data && (
                            <div className="flex items-center">
                              <RunCommandButton
                                command="ptzzoom"
                                args={[selectedCamera.toLowerCase(), "80"]}
                                tooltip="Run zoom out command"
                                icon={IconZoomOut}
                              />

                              <div className="pointer-events-none -ml-0.5 h-0.5 w-4 rounded bg-alveus-green-400" />

                              <RunCommandButton
                                command="ptzzoom"
                                args={[selectedCamera.toLowerCase(), "120"]}
                                tooltip="Run zoom in command"
                                icon={IconZoomIn}
                              />
                            </div>
                          )}

                          <Input
                            type="text"
                            placeholder="Search presets..."
                            aria-label="Search presets"
                            value={searchPresets}
                            onChange={(e) => setSearchPresets(e.target.value)}
                            className="grow rounded border border-alveus-green-200 bg-alveus-green-50/75 px-2 py-1 font-semibold shadow-md focus:ring-2 focus:ring-alveus-green focus:outline-none focus:ring-inset"
                          />
                        </>
                      )}
                    </div>

                    <div className="scrollbar-none shrink grow overflow-y-auto">
                      <div className="mt-3 grid grid-cols-2 gap-4 @3xl:grid-cols-3 @5xl:grid-cols-4">
                        {"presets" in selectedData &&
                          typeSafeObjectEntries(selectedData.presets)
                            .filter(
                              ([name, preset]) =>
                                !searchPresetsSanitized.length ||
                                name
                                  .toLowerCase()
                                  .includes(searchPresetsSanitized) ||
                                preset.description
                                  .toLowerCase()
                                  .includes(searchPresetsSanitized),
                            )
                            .map(([name, preset]) => (
                              <Card
                                key={name}
                                title={name}
                                image={preset.image}
                                command={{
                                  command: "ptzload",
                                  args: [selectedCamera.toLowerCase(), name],
                                }}
                              >
                                {preset.description}
                              </Card>
                            ))}

                        {"multi" in selectedData && (
                          <Card
                            title={selectedData.multi.cameras.join(" + ")}
                            image={selectedData.multi.image}
                            className="col-span-2"
                          >
                            {selectedData.multi.description}
                          </Card>
                        )}
                      </div>

                      <div className="pointer-events-none sticky bottom-0 z-10 -mt-2 h-16 mask-t-from-25% backdrop-blur-sm" />
                    </div>
                  </Fragment>
                )}
              </div>
            </div>
          </div>
        </Section>

        {sidebar && (
          <div className="flex" ref={sidebarContainer}>
            <div
              className="group flex cursor-ew-resize items-center justify-center px-2 py-4 select-none"
              onMouseDown={() => {
                sidebarDrag.current = true;
                window.document.documentElement.style.cursor = "ew-resize";
                window.document.body.style.pointerEvents = "none";
              }}
            >
              <div className="h-1/3 max-h-full w-1 rounded bg-alveus-green-200 transition-colors group-hover:bg-alveus-green-400 group-active:bg-alveus-green-400" />
            </div>
            <div
              className="overflow-hidden rounded-l-xl bg-alveus-green-900 text-alveus-tan"
              style={{ width: twitchEmbed }}
            >
              <Consent item="stream player" consent="twitch" className="h-full">
                <Twitch channel="alveussanctuary" />
                <TwitchChat channel="alveusgg" dark />
              </Consent>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AboutTechPresetsPage;
