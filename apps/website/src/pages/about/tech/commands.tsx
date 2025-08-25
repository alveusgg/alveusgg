import { type NextPage } from "next";
import Image from "next/image";
import { Fragment } from "react";

import commands, {
  type CommandCategoryId,
  commandCategories,
} from "@/data/tech/commands";

import { typeSafeObjectEntries } from "@/utils/helpers";
import { sentenceToKebab } from "@/utils/string-case";

import Button from "@/components/content/Button";
import Commands, {
  type NamedCommand,
  signature,
} from "@/components/content/Commands";
import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";

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

const AboutTechCommandsPage: NextPage = () => {
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
        <Heading level={2} className="mt-0 mb-2 scroll-mt-14" id="presets" link>
          Presets
        </Heading>

        <div className="flex flex-row flex-wrap items-center gap-x-16 gap-y-4 lg:flex-nowrap">
          <p className="text-lg">
            Almost all of the cameras on the livestream have a set of saved
            preset positions that can be loaded through chat commands, or
            directly on the website. Anyone who is subscribed to{" "}
            <Link href="/live/twitch" external>
              Alveus Sanctuary on Twitch
            </Link>{" "}
            can load these presets to control what views are shown on stream.
          </p>

          <Button href="/about/tech/presets" className="shrink-0">
            View Camera Presets
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

        <Section className="grow bg-alveus-green-900" dark>
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
              dark
            >
              Explore Fossabot Commands
            </Button>
          </div>
        </Section>
      </div>
    </>
  );
};

export default AboutTechCommandsPage;
