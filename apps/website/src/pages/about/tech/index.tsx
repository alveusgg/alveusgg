import { type NextPage } from "next";
import Image from "next/image";

import commands, {
  type OverloadedArguments,
  isOverloadedArguments,
} from "@/data/tech/commands";
import { channels } from "@/data/twitch";

import { typeSafeObjectEntries } from "@/utils/helpers";

import Button from "@/components/content/Button";
import Commands, { type NamedCommand } from "@/components/content/Commands";
import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import Network, { NetworkStats } from "@/components/tech/Network";
import Overview from "@/components/tech/Overview";
import Storage from "@/components/tech/servers/Storage";

import leafLeftImage1 from "@/assets/floral/leaf-left-1.png";
import leafLeftImage2 from "@/assets/floral/leaf-left-2.png";
import leafLeftImage3 from "@/assets/floral/leaf-left-3.png";
import leafRightImage1 from "@/assets/floral/leaf-right-1.png";

const subCommandNames: (keyof typeof commands)[] = [
  "ptzlist",
  "ptzload",
  "ptzhome",
  "ptzzoom",
  "ptzfocus",
  "ptzautofocus",
  "swap",
];

const subCommands: NamedCommand[] = subCommandNames.map((name) => ({
  name,
  ...commands[name],
  args:
    isOverloadedArguments(commands[name].args) && name === "swap"
      ? (commands[name].args.filter(
          (args) =>
            !args.some(
              (arg) => arg.type === "choice" && arg.choices.includes("blank"),
            ) && args.length,
        ) as OverloadedArguments)
      : commands[name].args,
}));

const openSource = {
  website: {
    title: "Website",
    description: "github.com/alveusgg/alveusgg",
    link: "https://github.com/alveusgg/alveusgg",
  },
  extension: {
    title: "Extension (Twitch)",
    description: "github.com/alveusgg/extension",
    link: "https://github.com/alveusgg/extension",
  },
  chatbot: {
    title: "Chatbot (Twitch)",
    description: "github.com/alveusgg/chatbot",
    link: "https://github.com/alveusgg/chatbot",
  },
};

const AboutTechPage: NextPage = () => {
  return (
    <>
      <Meta
        title="Tech at Alveus"
        description="Alveus Sanctuary is a virtual education center, and with that comes the need for a lot of technology to make it all work, from livestream broadcast systems to PTZ cameras and microphones in the ambassador enclosures."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <div className="relative">
        <Image
          src={leafRightImage1}
          alt=""
          className="pointer-events-none absolute -top-8 right-0 z-10 hidden h-auto w-1/2 max-w-sm drop-shadow-md select-none lg:block xl:max-w-md"
        />

        <Section dark className="py-24">
          <Heading level={1}>Tech at Alveus</Heading>
          <p className="text-lg text-balance lg:max-w-3/4">
            Alveus Sanctuary is a virtual education center, and with that comes
            the need for a lot of technology to make it all work, from
            livestream broadcast systems to PTZ cameras and microphones in the
            ambassador enclosures.
          </p>
        </Section>
      </div>

      <div className="relative">
        <Image
          src={leafLeftImage1}
          alt=""
          className="pointer-events-none absolute -bottom-20 -left-8 z-10 hidden h-auto w-1/2 max-w-24 -rotate-45 drop-shadow-md select-none lg:block 2xl:-bottom-24 2xl:max-w-32"
        />

        <Section>
          <Heading level={2} className="mt-0 mb-4" id="controls" link>
            Live Cam Controls
          </Heading>
          <p className="text-lg text-balance lg:max-w-3/4">
            Anyone subscribed to{" "}
            <Link href="/live/twitch" external>
              Alveus Sanctuary on Twitch
            </Link>{" "}
            can control the position of the cameras currently shown on the
            livestream! Use the commands below in the Twitch chat to load preset
            positions, change the layout of the stream, or even tweak the focus
            or zoom of the cameras.
          </p>

          <Commands commands={subCommands} className="my-8" />

          <p className="mt-2 text-balance text-alveus-green italic">
            Commands can be run from the{" "}
            <Link
              href={`https://twitch.tv/${channels.alveus.username}`}
              external
            >
              {channels.alveus.username} Twitch chat
            </Link>
            , or from the{" "}
            <Link
              href={`https://twitch.tv/${channels.alveusgg.username}`}
              external
            >
              {channels.alveusgg.username} Twitch chat
            </Link>{" "}
            instead to keep the main chat clean. In either case, you need to be
            a subscriber to the main Alveus Sanctuary Twitch channel to use the
            commands.
          </p>

          <p className="mt-2 text-balance text-alveus-green italic">
            Need help with moving the cameras to a position not covered by
            presets? Ask the moderators in Twitch chat as they have full access
            to control the cameras (and edit preset positions for you to use).
          </p>
        </Section>
      </div>

      <Section className="bg-alveus-green-100">
        <Heading level={2} className="mt-0 mb-2 scroll-mt-14" id="presets" link>
          Camera Presets
        </Heading>

        <div className="flex flex-row flex-wrap items-center gap-x-16 gap-y-4 lg:flex-nowrap">
          <p className="text-lg">
            Overwhelmed by the number of camera presets available, or just
            don&apos;t want to run commands by hand in chat? We&apos;ve got you
            covered with our camera presets page! View thumbnail previews and
            descriptions of all the camera presets available, and if you&apos;re
            signed in as a subscriber, you can load them directly from the page
            to control what views are shown on stream.
          </p>

          <Button href="/about/tech/presets" className="shrink-0">
            View Camera Presets
          </Button>
        </div>
      </Section>

      <Section dark>
        <Heading
          level={2}
          className="mt-0 mb-2 scroll-mt-14"
          id="commands"
          link
        >
          Chat Commands
        </Heading>

        <div className="flex flex-row flex-wrap items-center gap-x-16 gap-y-4 lg:flex-nowrap">
          <p className="text-lg text-balance">
            The bot that we use in our Twitch chat to control the cameras has
            many more commands available! Many of the commands are restricted to
            moderators only, but some of them are available to subscribers
            (beyond those documented above) or even everyone in chat.
          </p>

          <Button href="/about/tech/commands" className="shrink-0" dark>
            Explore More Commands
          </Button>
        </div>
      </Section>

      <div className="relative">
        <Image
          src={leafLeftImage2}
          alt=""
          className="pointer-events-none absolute right-0 -bottom-20 z-10 hidden h-auto w-1/2 max-w-48 -scale-x-100 drop-shadow-md select-none lg:block"
        />

        <Section>
          <Heading level={2} className="mt-0 mb-4" id="overview" link>
            System Overview
          </Heading>
          <Overview />

          <Heading level={2} className="mt-16 mb-1" id="cameras" link>
            Network + Enclosure Cameras
          </Heading>
          <NetworkStats className="mb-4" />
          <Network />
        </Section>
      </div>

      <Section dark>
        <Heading level={2} className="mt-0 mb-2 scroll-mt-14" id="compute" link>
          On-Site Compute
        </Heading>

        <div>
          <Storage drives={Array(3).fill(true)} />
          <Storage drives={Array(8).fill(true)} />
        </div>
      </Section>

      {/* Grow the last section to cover the page */}
      <div className="relative flex grow flex-col">
        <Image
          src={leafLeftImage3}
          alt=""
          className="pointer-events-none absolute -bottom-24 left-0 z-10 hidden h-auto w-1/2 max-w-48 drop-shadow-md select-none lg:block"
        />

        <Section dark className="grow bg-alveus-green-800">
          <Heading level={2} className="mt-0 mb-2" id="open-source" link>
            Open-source
          </Heading>
          <p className="mb-4 text-balance">
            We believe in being transparent in all that we do, and that includes
            the code we&apos;re writing to power Alveus Sanctuary. This website,
            our Twitch extension, and even that chatbot used to control the
            cams, are all open-source on GitHub. We&apos;re not just building in
            public, we&apos;re also always looking for community contributors to
            help us improve them!
          </p>

          <ul className="flex flex-wrap md:gap-y-4">
            {typeSafeObjectEntries(openSource).map(([key, item]) => (
              <li className="basis-full md:basis-1/2 lg:basis-1/3" key={key}>
                <p>
                  <span className="font-bold">
                    {item.title}
                    {": "}
                  </span>
                  <Link href={item.link} dark external>
                    {item.description}
                  </Link>
                </p>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </>
  );
};

export default AboutTechPage;
