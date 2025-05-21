import { type NextPage } from "next";
import Image from "next/image";
import { Fragment, useState } from "react";

import commands, {
  type CommandCategoryId,
  commandCategories,
} from "@/data/tech/commands";
import presets from "@/data/tech/presets";
import { channels, scopeGroups } from "@/data/twitch";

import { classes } from "@/utils/classes";
import { typeSafeObjectEntries } from "@/utils/helpers";
import { camelToKebab, sentenceToKebab } from "@/utils/string-case";
import { trpc } from "@/utils/trpc";

import Button from "@/components/content/Button";
import Commands, {
  type NamedCommand,
  signature,
} from "@/components/content/Commands";
import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import SubNav from "@/components/content/SubNav";
import ProvideAuth from "@/components/shared/LoginWithExtraScopes";
import CopyToClipboardButton from "@/components/shared/actions/CopyToClipboardButton";
import RunCommandButton from "@/components/shared/actions/RunCommandButton";

import IconVideoCamera from "@/icons/IconVideoCamera";

import leafLeftImage1 from "@/assets/floral/leaf-left-1.png";
import leafLeftImage3 from "@/assets/floral/leaf-left-3.png";
import leafRightImage1 from "@/assets/floral/leaf-right-1.png";

const grouped = typeSafeObjectEntries(commands).reduce(
  (obj, [name, command]) => ({
    ...obj,
    [command.category]: [
      ...(obj[command.category] || []),
      {
        name,
        ...command,
      },
    ],
  }),
  {} as Record<CommandCategoryId, NamedCommand[]>,
);

const sectionLinks = [
  { name: "Commands", href: "#commands" },
  { name: "Presets", href: "#presets" },
];

const AboutTechPage: NextPage = () => {
  const { data: session } = trpc.auth.getSession.useQuery();
  const subscription = trpc.stream.getSubscription.useQuery(undefined, {
    enabled: scopeGroups.chat.every((scope) =>
      session?.user?.scopes?.includes(scope),
    ),
  });

  const [selectedCamera, setSelectedCamera] = useState<keyof typeof presets>(
    Object.keys(presets)[0] as keyof typeof presets,
  );

  return (
    <>
      <Meta
        title="Chat Commands at Alveus"
        description="Documentation for the commands available in the Alveus Sanctuary Twitch chat, allowing members of the community to control the live cameras on stream."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <div className="relative">
        <Image
          src={leafRightImage1}
          alt=""
          className="pointer-events-none absolute -top-8 right-0 z-30 hidden h-auto w-1/2 max-w-sm drop-shadow-md select-none lg:block xl:max-w-md"
        />

        <Section dark className="py-24">
          <div className="w-full lg:w-3/5">
            <Heading level={1}>Chat Commands at Alveus</Heading>
            <p className="text-lg">
              Moderators and members of the community in the Alveus Sanctuary
              Twitch live chat have varying levels of access to run commands in
              chat that can control what live cameras are shown on stream, what
              can be seen on each of the cameras, and what audio can be heard.
            </p>
          </div>
        </Section>
      </div>

      <SubNav links={sectionLinks} className="z-20" />

      <div className="relative">
        <Image
          src={leafLeftImage1}
          alt=""
          className="pointer-events-none absolute right-0 -bottom-32 z-10 hidden h-auto w-1/2 max-w-40 -scale-x-100 drop-shadow-md select-none lg:block"
        />

        <Section>
          <Heading
            level={2}
            className="mt-0 mb-2 scroll-mt-14"
            id="commands"
            link
          >
            Commands
          </Heading>

          <dl className="max-w-full overflow-x-auto">
            <dt>Syntax:</dt>
            <dd className="mx-2">
              <pre>
                <code className="text-sm">
                  {signature({
                    name: "example",
                    args: [
                      [
                        {
                          name: "required",
                          type: "string",
                          required: true,
                          variadic: false,
                        },
                        {
                          name: "optional",
                          type: "number",
                          required: false,
                          variadic: false,
                        },
                        {
                          name: "literal",
                          type: "choice",
                          required: false,
                          variadic: false,
                          choices: ["on", "off"],
                        },
                        {
                          name: "multiple",
                          type: "string",
                          required: false,
                          variadic: true,
                        },
                      ],
                      [
                        {
                          name: "overloaded",
                          type: "choice",
                          required: true,
                          variadic: false,
                          choices: ["up", "down"],
                        },
                        {
                          name: "values",
                          type: "number",
                          required: true,
                          variadic: true,
                        },
                        {
                          name: "flag",
                          type: "number",
                          required: false,
                          variadic: false,
                          prefix: "--speed=",
                        },
                      ],
                      [],
                    ],
                    description: "This is an example command.",
                    category: "Example",
                  })}
                </code>
              </pre>
            </dd>

            <dt>Usage:</dt>
            <dd className="mx-2">
              <ul>
                <li>
                  <code className="text-sm">!example foo</code>
                </li>
                <li>
                  <code className="text-sm">!example foo 10</code>
                </li>
                <li>
                  <code className="text-sm">!example foo 20 on</code>
                </li>
                <li>
                  <code className="text-sm">!example foo 30 off bar baz</code>
                </li>
                <li>
                  <code className="text-sm">!example up 40 50</code>
                </li>
                <li>
                  <code className="text-sm">!example</code>
                </li>
              </ul>
            </dd>
          </dl>

          <dl>
            {typeSafeObjectEntries(grouped).map(([categoryId, commands]) => {
              const category = commandCategories[categoryId];

              return (
                <Fragment key={categoryId}>
                  <dt className="mt-6">
                    <Heading
                      level={3}
                      className="scroll-mt-14 text-2xl"
                      id={`commands:${sentenceToKebab(categoryId)}`}
                      link
                    >
                      {category.heading}
                    </Heading>

                    {"description" in category && (
                      <p className="mb-4">{category.description}</p>
                    )}
                  </dt>
                  <dd className="mx-2">
                    <Commands commands={commands} />
                  </dd>
                </Fragment>
              );
            })}
          </dl>
        </Section>
      </div>

      <Section className="bg-alveus-green-100">
        <Heading
          level={2}
          className="mt-0 mb-2 scroll-mt-14"
          id="fossabot"
          link
        >
          Fossabot
        </Heading>

        <div className="flex flex-row flex-wrap items-center gap-x-16 gap-y-4 lg:flex-nowrap">
          <p className="text-lg">
            Alongside the custom chat bot for all the commands above, Fossabot
            is also used in the Twitch chat to provide a set of commands that
            anyone can access, providing easy access to a bunch of common
            information and links.
          </p>

          <Button
            href="https://fossabot.com/alveussanctuary/commands"
            external
            className="shrink-0"
          >
            Explore Fossabot Commands
          </Button>
        </div>
      </Section>

      {/* Grow the last section to cover the page */}
      <div className="relative flex grow flex-col">
        <Image
          src={leafLeftImage3}
          alt=""
          className="pointer-events-none absolute -bottom-24 left-0 z-10 hidden h-auto w-1/2 max-w-48 drop-shadow-md select-none lg:block"
        />

        <Section className="grow">
          <Heading
            level={2}
            className="mt-0 mb-2 scroll-mt-14"
            id="presets"
            link
          >
            Presets
          </Heading>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <p>
              These commands will pan, tilt and zoom the respective camera to a
              preset view described below. Anyone who is subscribed to{" "}
              <Link href="/live/twitch" external>
                Alveus Sanctuary on Twitch
              </Link>{" "}
              can run these commands in the chat.
            </p>

            <div>
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
                as if you had typed it in the chat yourself.
              </p>

              <ProvideAuth scopeGroup="chat" className="mt-4" />

              {subscription.isSuccess && (
                <p className="mt-4">
                  Subscription status:{" "}
                  <span
                    className={classes(
                      "mx-1 rounded-md px-1.5 py-0.5 text-sm leading-tight text-alveus-tan",
                      subscription.data ? "bg-alveus-green" : "bg-red",
                    )}
                  >
                    {subscription.data
                      ? `Subscribed at Tier ${subscription.data.tier.replace(/0+$/, "")}`
                      : "Not subscribed"}
                  </span>
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
            {/* Camera List */}
            <div className="col-span-1 space-y-2">
              {/* Mobile: Dropdown */}
              <div className="mb-2 block lg:hidden">
                <label htmlFor="camera-select" className="sr-only">
                  Select Camera
                </label>
                <select
                  id="camera-select"
                  value={selectedCamera}
                  onChange={(e) =>
                    setSelectedCamera(e.target.value as keyof typeof presets)
                  }
                  className="w-full rounded border border-alveus-green-200 bg-alveus-green-50 px-3 py-2 text-lg font-semibold focus:ring-2 focus:ring-alveus-green focus:outline-none"
                >
                  {typeSafeObjectEntries(presets).map(([camera, { title }]) => (
                    <option key={camera} value={camera}>
                      {title} ({camera.toLowerCase()})
                    </option>
                  ))}
                </select>
              </div>
              {/* Desktop: Button List */}
              <div className="hidden space-y-2 lg:block">
                {typeSafeObjectEntries(presets).map(([camera, { title }]) => (
                  <button
                    key={camera}
                    onClick={() => setSelectedCamera(camera)}
                    className={classes(
                      "w-full rounded px-3 py-2 text-left text-lg font-semibold",
                      selectedCamera === camera
                        ? "bg-alveus-green text-white"
                        : "bg-alveus-green-50 hover:bg-alveus-green-100",
                    )}
                  >
                    {title}
                    <span className="text-sm text-alveus-green-400 italic">
                      {` (${camera.toLowerCase()})`}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Preset List */}
            <div className="col-span-1 lg:col-span-3">
              {selectedCamera && (
                <Fragment key={selectedCamera}>
                  <Heading
                    level={3}
                    className="scroll-mt-14 text-2xl"
                    id={`presets:${camelToKebab(selectedCamera)}`}
                  >
                    {presets[selectedCamera]?.title}
                    <span className="text-sm text-alveus-green-400 italic">
                      {` (${selectedCamera.toLowerCase()})`}
                    </span>
                  </Heading>

                  <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {typeSafeObjectEntries(
                      presets[selectedCamera]?.presets ?? {},
                    ).map(([name, preset]) => {
                      return (
                        <div
                          key={name}
                          className="overflow-hidden rounded-lg border shadow-lg"
                        >
                          <div className="group relative aspect-video">
                            {preset.image ? (
                              <Image
                                src={preset.image}
                                alt={preset.description}
                                fill
                                className="object-cover transition-transform group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-alveus-green-50 text-xs text-alveus-green-300">
                                No Image
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-1 bg-alveus-tan p-2">
                            <div className="flex items-center justify-between">
                              <h4 className="text-lg font-semibold">{name}</h4>
                              <div className="flex gap-1">
                                <CopyToClipboardButton
                                  text={`!ptzload ${selectedCamera.toLowerCase()} ${name}`}
                                />
                                <RunCommandButton
                                  command="ptzload"
                                  args={[selectedCamera.toLowerCase(), name]}
                                  subOnly
                                />
                              </div>
                            </div>
                            <p className="text-sm text-alveus-green-600 italic">
                              {preset.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
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

export default AboutTechPage;
