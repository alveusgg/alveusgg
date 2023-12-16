import { Fragment } from "react";
import { type NextPage } from "next";
import Image from "next/image";

import commands, {
  isOverloadedArguments,
  type Command,
  type Argument,
} from "@/data/commands";
import { typeSafeObjectEntries } from "@/utils/helpers";
import {
  camelToKebab,
  camelToTitle,
  sentenceToKebab,
} from "@/utils/string-case";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";

import leafRightImage1 from "@/assets/floral/leaf-right-1.png";
import leafLeftImage1 from "@/assets/floral/leaf-left-1.png";
import leafLeftImage3 from "@/assets/floral/leaf-left-3.png";
import presets from "@/data/presets";
import Link from "@/components/content/Link";

interface NamedCommand extends Command {
  name: string;
}

const grouped = typeSafeObjectEntries(commands).reduce<
  Record<string, NamedCommand[]>
>(
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
  {},
);

const signatureArg = (arg: Argument) =>
  [
    arg.required ? "<" : "[",
    arg.type !== "choice" || arg.choices.length > 1 ? `${arg.name}:` : "",
    arg.type === "choice"
      ? arg.choices.map((choice) => `'${choice}'`).join("|")
      : arg.type,
    arg.variadic ? "..." : "",
    arg.required ? ">" : "]",
  ].join("");

const signature = (command: NamedCommand) => {
  const { name, args } = command;
  const cmd = `!${name}`;
  if (!args) return cmd;

  const cmdArgs = isOverloadedArguments(args)
    ? args
        .map(
          (nestedArgs) =>
            nestedArgs.map((arg) => signatureArg(arg)).join(" ") || "[]",
        )
        .join(`\n${" ".repeat(cmd.length - 1)}| `)
    : args.map((arg) => signatureArg(arg)).join(" ");

  return `${cmd} ${cmdArgs}`;
};

const AboutTechPage: NextPage = () => {
  return (
    <>
      <Meta
        title="Chat Commands at Alveus"
        description="Documentation for the commands available in the Alveus Sanctuary Twitch chat, allowing trusted chat members and moderators to control the live cameras."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <div className="relative">
        <Image
          src={leafRightImage1}
          alt=""
          className="pointer-events-none absolute -top-8 right-0 z-10 hidden h-auto w-1/2 max-w-sm select-none lg:block xl:max-w-md"
        />

        <Section dark className="py-24">
          <div className="w-full lg:w-3/5">
            <Heading level={1}>Chat Commands at Alveus</Heading>
            <p className="text-lg">
              Moderators and trusted chat members in the Alveus Sanctuary Twitch
              live chat can use a variety of commands to control what live
              cameras are shown on stream, what can be seen on each of the
              cameras, and what audio can be heard.
            </p>
          </div>
        </Section>
      </div>

      <div className="relative">
        <Image
          src={leafLeftImage1}
          alt=""
          className="pointer-events-none absolute -bottom-28 -right-8 z-10 hidden h-auto w-1/2 max-w-[10rem] rotate-45 -scale-x-100 select-none lg:block 2xl:max-w-[12rem]"
        />

        <Section>
          <Heading level={2} className="mb-2 mt-0" id="commands" link>
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
            {typeSafeObjectEntries(grouped).map(([category, commands]) => (
              <Fragment key={category}>
                <dt className="mt-6">
                  <Heading
                    level={3}
                    className="text-2xl"
                    id={`commands-${sentenceToKebab(category)}`}
                    link
                  >
                    {category}
                  </Heading>
                </dt>
                <dd className="mx-2">
                  <dl className="max-w-full overflow-x-auto">
                    {commands.map((command) => (
                      <div
                        key={command.name}
                        className="mb-4 flex flex-col items-baseline lg:mb-0 lg:flex-row lg:gap-4"
                      >
                        <dt>
                          <pre>
                            <code className="text-sm">
                              {signature(command)}
                            </code>
                          </pre>
                        </dt>

                        <dd>
                          <p className="text-sm italic text-alveus-green-400">
                            {command.description}
                          </p>
                        </dd>
                      </div>
                    ))}
                  </dl>
                </dd>
              </Fragment>
            ))}
          </dl>
        </Section>
      </div>

      <Section dark>
        <Heading level={2} className="mb-2 mt-0" id="streamelements" link>
          StreamElements
        </Heading>

        <div className="flex flex-row flex-wrap items-center gap-x-16 gap-y-4 lg:flex-nowrap">
          <p className="text-lg">
            Alongside the custom chat bot for all the commands above,
            StreamElements is also used in the Twitch (and YouTube) chat to
            provide a set of commands that anyone can access, providing easy
            access to a bunch of common information and links.
          </p>

          <Link
            href="https://streamelements.com/alveussanctuary/commands"
            className="text-md mx-auto inline-block flex-shrink-0 rounded-full border-2 border-white px-4 py-2 transition-colors hover:border-alveus-tan hover:bg-alveus-tan hover:text-alveus-green"
            custom
            external
          >
            Explore StreamElements Commands
          </Link>
        </div>
      </Section>

      {/* Grow the last section to cover the page */}
      <div className="relative flex flex-grow flex-col">
        <Image
          src={leafLeftImage3}
          alt=""
          className="pointer-events-none absolute -bottom-24 left-0 z-10 hidden h-auto w-1/2 max-w-[12rem] select-none lg:block"
        />

        <Section className="flex-grow">
          <Heading level={2} className="mb-2 mt-0" id="presets" link>
            Presets
          </Heading>

          <p>
            These commands will pan, tilt and zoom the respective camera to a
            preset view described below.
          </p>

          <dl>
            {typeSafeObjectEntries(presets).map(
              ([camera, { title, presets }]) => (
                <Fragment key={camera}>
                  <dt className="mt-6">
                    <Heading
                      level={3}
                      className="text-2xl"
                      id={`presets-${camelToKebab(camera)}`}
                      link
                    >
                      {title}
                      <span className="text-sm italic text-alveus-green-400">
                        {` (${camera.toLowerCase()})`}
                      </span>
                    </Heading>
                  </dt>
                  <dd className="mx-2">
                    <dl className="max-w-full overflow-x-auto">
                      {typeSafeObjectEntries(presets).map(([name, preset]) => (
                        <div
                          key={name}
                          className="group/preset mb-4 flex flex-col items-baseline lg:mb-0 lg:flex-row lg:gap-4"
                        >
                          <dt>
                            <pre>
                              <code className="text-sm">
                                <span className="opacity-40 group-first/preset:opacity-100">
                                  {`!ptzload ${camera.toLowerCase()} `}
                                </span>
                                {name}{" "}
                              </code>
                            </pre>
                          </dt>

                          <dd>
                            <p className="text-sm italic text-alveus-green-400">
                              {preset.description}
                            </p>
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </dd>
                </Fragment>
              ),
            )}
          </dl>
        </Section>
      </div>
    </>
  );
};

export default AboutTechPage;
