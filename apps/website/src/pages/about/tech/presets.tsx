import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { type NextPage } from "next";
import Image, { type StaticImageData } from "next/image";
import { Fragment, type ReactNode, useState } from "react";

import cameras, { type Camera } from "@/data/tech/cameras";
import { channels, scopeGroups } from "@/data/twitch";

import { classes } from "@/utils/classes";
import {
  isDefinedEntry,
  typeSafeObjectEntries,
  typeSafeObjectKeys,
} from "@/utils/helpers";
import { camelToKebab, camelToTitle } from "@/utils/string-case";
import { type RouterInputs, trpc } from "@/utils/trpc";

import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import ProvideAuth from "@/components/shared/LoginWithExtraScopes";
import CopyToClipboardButton from "@/components/shared/actions/CopyToClipboardButton";
import RunCommandButton from "@/components/shared/actions/RunCommandButton";

import IconCheck from "@/icons/IconCheck";
import IconChevronDown from "@/icons/IconChevronDown";
import IconLoading from "@/icons/IconLoading";
import IconVideoCamera from "@/icons/IconVideoCamera";
import IconX from "@/icons/IconX";

import leafLeftImage3 from "@/assets/floral/leaf-left-3.png";
import leafRightImage1 from "@/assets/floral/leaf-right-1.png";

const groupedCameras = typeSafeObjectEntries(cameras).reduce(
  (acc, [key, value]) => ({
    ...acc,
    [value.group]: {
      ...acc[value.group],
      [key]: value,
    },
  }),
  {} as Record<string, Partial<typeof cameras>>,
);

type Command = RouterInputs["stream"]["runCommand"];

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
  <div className="flex w-full overflow-hidden rounded">
    <button
      onClick={onClick}
      className={classes(
        "my-auto grow px-3 py-2 text-left text-lg font-semibold",
        camera === selected.camera
          ? "bg-alveus-green text-white"
          : "bg-alveus-green-50 hover:bg-alveus-green-100",
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
        className="flex items-center rounded-r bg-alveus-green px-2 text-alveus-tan transition-colors hover:bg-alveus-green-900"
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
  image?: { src: StaticImageData; alt: string };
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
    <div className="group relative aspect-video overflow-hidden rounded-t-lg">
      {image ? (
        <Image
          src={image.src}
          alt={image.alt}
          fill
          className="aspect-video w-full object-cover transition-transform"
        />
      ) : (
        <div className="flex aspect-video items-center justify-center bg-alveus-green-50 text-xs text-alveus-green-300">
          No Image
        </div>
      )}
    </div>
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

  const [selectedCamera, setSelectedCamera] = useState<Camera>(
    typeSafeObjectKeys(cameras)[0]!,
  );
  const selectedData = cameras[selectedCamera];

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
          src={leafRightImage1}
          alt=""
          className="pointer-events-none absolute -top-8 right-0 z-10 hidden h-auto w-1/2 max-w-xs drop-shadow-md select-none lg:block xl:max-w-sm"
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
      <div className="relative flex grow flex-col">
        <Image
          src={leafLeftImage3}
          alt=""
          className="pointer-events-none absolute -bottom-24 left-0 z-10 hidden h-auto w-1/2 max-w-48 drop-shadow-md select-none lg:block"
        />

        <Section className="grow">
          <div className="flex flex-col gap-y-4 lg:flex-row">
            <div className="w-full lg:w-3/5">
              <p>
                If you&apos;re subscribed, you can run these commands directly
                from this page by clicking the{" "}
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
                as if you had typed it in the chat yourself. Make sure you have
                the{" "}
                <Link href="/live/twitch" external>
                  livestream
                </Link>{" "}
                open in another tab to see the camera change as you load the
                presets.
              </p>

              <p className="hidden lg:mt-2 lg:block">
                Next to each camera in the menu you&apos;ll also find a{" "}
                <span className="font-semibold text-alveus-green">
                  Run swap command{" "}
                  <IconVideoCamera className="mb-0.5 inline-block size-4" />
                </span>{" "}
                button if the camera is in the same enclosure as the currently
                selected camera, allowing you to swap which camera is shown on
                stream if you&apos;re subscribed.
              </p>
            </div>

            <div className="w-full lg:w-2/5 lg:px-8">
              <ProvideAuth scopeGroup="chat" className="mb-4" />

              {!subscription.isPaused && (
                <div
                  className={classes(
                    "mx-1 flex items-center justify-between rounded-xl p-3 text-lg text-alveus-tan",
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
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-4">
            {/* Camera List */}
            <div className="col-span-1 space-y-2 lg:sticky lg:top-0 lg:pt-2">
              {/* Mobile: Dropdown */}
              <div className="mb-2 block lg:hidden">
                <label htmlFor="camera-select" className="sr-only">
                  Select Camera
                </label>
                <select
                  id="camera-select"
                  value={selectedCamera}
                  onChange={(e) => setSelectedCamera(e.target.value as Camera)}
                  className="w-full rounded border border-alveus-green-200 bg-alveus-green-50 px-3 py-2 text-lg font-semibold focus:ring-2 focus:ring-alveus-green focus:outline-none"
                >
                  {typeSafeObjectKeys(cameras).map((camera) => (
                    <option key={camera} value={camera}>
                      {cameras[camera].title} ({camera.toLowerCase()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Desktop: Button List */}
              <div className="hidden lg:flex lg:flex-col lg:gap-1">
                {typeSafeObjectEntries(groupedCameras).map(([name, group]) => {
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
                    <Disclosure
                      key={name}
                      defaultOpen={name === selectedData.group}
                    >
                      <DisclosureButton
                        className={classes(
                          "group flex w-full items-center justify-between rounded px-3 py-2 text-left text-lg font-semibold",
                          selectedData.group === name
                            ? "bg-alveus-green text-white"
                            : "bg-alveus-green-50 hover:bg-alveus-green-100",
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
                        {groupEntries.map(([camera, { title, group }]) => (
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
                        ))}
                      </DisclosurePanel>
                    </Disclosure>
                  );
                })}
              </div>
            </div>

            {/* Preset List */}
            <div className="col-span-1 lg:sticky lg:top-0 lg:col-span-3">
              {selectedCamera && (
                <Fragment key={selectedCamera}>
                  <Heading
                    level={3}
                    className="scroll-mt-14 text-2xl"
                    id={`presets:${camelToKebab(selectedCamera)}`}
                  >
                    {selectedData.title}
                    <span className="text-sm text-alveus-green-400 italic">
                      {` (${selectedCamera.toLowerCase()})`}
                    </span>
                  </Heading>

                  <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {"presets" in selectedData &&
                      typeSafeObjectEntries(selectedData.presets).map(
                        ([name, preset]) => (
                          <Card
                            key={name}
                            title={name}
                            image={
                              preset.image
                                ? { src: preset.image, alt: preset.description }
                                : undefined
                            }
                            command={{
                              command: "ptzload",
                              args: [selectedCamera.toLowerCase(), name],
                            }}
                          >
                            {preset.description}
                          </Card>
                        ),
                      )}

                    {"multi" in selectedData && (
                      <Card
                        title={selectedData.multi.cameras.join(" + ")}
                        image={
                          selectedData.multi.image
                            ? {
                                src: selectedData.multi.image,
                                alt:
                                  selectedData.multi.description ??
                                  selectedData.multi.cameras.join(" + "),
                              }
                            : undefined
                        }
                        className="col-span-2"
                      >
                        {selectedData.multi.description}
                      </Card>
                    )}
                  </div>
                </Fragment>
              )}
            </div>
          </div>
        </Section>
      </div>
    </>
  );
};

export default AboutTechPresetsPage;
