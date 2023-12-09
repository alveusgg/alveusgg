import { type NextPage } from "next";
import Image from "next/image";

import { Fragment } from "react";
import { classes } from "@/utils/classes";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Link from "@/components/content/Link";
import Network from "@/components/tech/Network";

import leafRightImage1 from "@/assets/floral/leaf-right-1.png";
import leafRightImage2 from "@/assets/floral/leaf-right-2.png";
import leafLeftImage1 from "@/assets/floral/leaf-left-1.png";
import leafLeftImage2 from "@/assets/floral/leaf-left-2.png";
import leafLeftImage3 from "@/assets/floral/leaf-left-3.png";
import commands, { type Argument, type Command } from "@/data/commands";
import { typeSafeObjectEntries } from "@/utils/helpers";

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

const signature = (command: NamedCommand) => {
  const { name, args } = command;
  const cmd = `!${name}`;
  if (!args) return cmd;

  const cmdArgs = args.map((arg) => {
    const { name, type, required, variadic } = arg;

    const core =
      type === "choice"
        ? arg.choices.map((choice) => `'${choice}'`).join("|")
        : type;

    return [
      required ? "<" : "[",
      name,
      ":",
      core,
      variadic ? "..." : "",
      required ? ">" : "]",
    ].join("");
  });

  return `${cmd} ${cmdArgs.join(" ")}`;
};

const example: NamedCommand = {
  name: "example",
  args: [
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
  description: "This is an example command.",
  category: "Example",
};

const AboutTechPage: NextPage = () => {
  return (
    <>
      <Meta
        title="Commands | Tech at Alveus"
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

      {/* Grow the last section to cover the page */}
      <div className="relative flex flex-grow flex-col">
        <Image
          src={leafLeftImage3}
          alt=""
          className="pointer-events-none absolute -bottom-24 left-0 z-10 hidden h-auto w-1/2 max-w-[12rem] select-none lg:block"
        />

        <Section className="flex-grow">
          <Heading level={2} className="mb-2 mt-0" id="commands" link>
            Commands
          </Heading>

          <dl>
            <dt>Syntax:</dt>
            <dd className="mx-2">
              <code className="text-sm">{signature(example)}</code>
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
              </ul>
            </dd>
          </dl>

          <dl>
            {typeSafeObjectEntries(grouped).map(([category, commands]) => (
              <Fragment key={category}>
                <dt className="mt-6">
                  <Heading level={3} className="text-2xl">
                    {category}
                  </Heading>
                </dt>
                <dd className="mx-2">
                  <dl>
                    {commands.map((command) => (
                      <div key={command.name} className="flex flex-row gap-2">
                        <dt>
                          <code className="text-sm">{signature(command)}</code>
                        </dt>

                        <dd>
                          <p className="inline-block text-sm italic text-alveus-green-400">
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
    </>
  );
};

export default AboutTechPage;
