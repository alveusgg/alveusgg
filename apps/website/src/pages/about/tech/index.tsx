import { type NextPage } from "next";
import Image from "next/image";

import commands, {
  type OverloadedArguments,
  isOverloadedArguments,
} from "@/data/tech/commands";
import { channels } from "@/data/twitch";

import { classes } from "@/utils/classes";
import { typeSafeObjectEntries } from "@/utils/helpers";

import Button from "@/components/content/Button";
import Commands, { type NamedCommand } from "@/components/content/Commands";
import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import SubNav from "@/components/content/SubNav";
import Network, { NetworkStats } from "@/components/tech/Network";
import Overview from "@/components/tech/Overview";
import Blank from "@/components/tech/servers/Blank";
import Rack from "@/components/tech/servers/Rack";
import Storage from "@/components/tech/servers/Storage";
import Switch from "@/components/tech/servers/Switch";
import UPS from "@/components/tech/servers/UPS";

import leafLeftImage1 from "@/assets/floral/leaf-left-1.png";
import leafLeftImage2 from "@/assets/floral/leaf-left-2.png";
import leafLeftImage3 from "@/assets/floral/leaf-left-3.png";
import leafRightImage1 from "@/assets/floral/leaf-right-1.png";

const sectionLinks = [
  { name: "Live Cam Controls", href: "#controls" },
  { name: "System Overview", href: "#overview" },
  { name: "On-Site Compute", href: "#compute" },
  { name: "Open-source", href: "#open-source" },
];

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

const Bullet = () => (
  <span className="mx-1 my-auto inline-block h-0.5 w-2 shrink-0 rounded-xs bg-alveus-green-200" />
);

const Spec = ({
  items,
  className,
}: {
  items: [string, string[]][];
  className?: string;
}) => (
  <ul className={classes("text-sm", className)}>
    {items.map((item) => (
      <li key={item.join("-")} className="flex items-start">
        <span className="flex">
          <Bullet />
          <span className="mx-1 font-bold">{item[0]}: </span>
        </span>
        <span className="flex flex-wrap">
          {item[1].map((value, index) => (
            <span key={index} className="flex">
              {index !== 0 && <Bullet />}
              {value}
              {index < item[1].length - 1 && (
                <span className="sr-only">, </span>
              )}
            </span>
          ))}
        </span>
      </li>
    ))}
  </ul>
);

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
          className="pointer-events-none absolute -top-8 right-0 z-30 hidden h-auto w-1/2 max-w-sm drop-shadow-md select-none lg:block xl:max-w-md"
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

      <SubNav links={sectionLinks} className="z-20" />

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

      <Section className="bg-alveus-green-100 dark:bg-gray-800">
        <Heading level={2} className="mt-0 mb-2" id="presets" link>
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
        <Heading level={2} className="mt-0 mb-2" id="commands" link>
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
        <Heading level={2} className="mt-0 mb-2" id="compute" link>
          On-Site Compute
        </Heading>

        <p className="mb-4 text-lg text-balance lg:mb-8">
          Alongside the complex network of switches and cameras that feed the
          livestream for Alveus, we also make use of a number of servers on-site
          to handle the processing of the video feeds and running various bits
          of tooling to support the livestream and the sanctuary itself.
        </p>

        <div className="grid grid-cols-1 gap-x-8 gap-y-4 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <Heading level={3} className="text-xl">
                Core Network
              </Heading>

              <p>
                Living at the top of our main rack is our core networking
                equipment. This is where the fiber links from all the enclosures
                land, as well as the main uplink to the internet.
              </p>

              <Heading
                level={4}
                className="mb-0 font-sans text-sm text-alveus-green-200 uppercase"
              >
                Fiber Aggregation
              </Heading>
              <p>
                A USW Pro Aggregation switch from Ubiquiti offers us 28 SFP+ 10
                Gbps ports, and 4 SFP28 ports with 25 Gbps capability, for
                high-speed connections to the rest of the network. We use this
                to connect all the enclosure fiber links to the network, as well
                as our other core networking equipment and the servers below.
              </p>

              <Heading
                level={4}
                className="mb-0 font-sans text-sm text-alveus-green-200 uppercase"
              >
                Network Router
              </Heading>
              <p>
                A UDM Pro from Ubiquiti serves as our core router, handling all
                the routing and firewalling for the sanctuary. It provides the
                rest of the network with an uplink to the internet and is
                connected to the Pro Aggregation switch via a 10 Gbps direct
                attach copper cable (DAC) link.
              </p>

              <Heading
                level={4}
                className="mb-0 font-sans text-sm text-alveus-green-200 uppercase"
              >
                Network Switch
              </Heading>
              <p>
                Also connected to the Pro Aggregation switch over a 10 Gbps
                fiber link is a USW Pro Max 24 PoE switch from Ubiquiti, which
                provides 24 GbE RJ45 ports (8 of which are capable of 2.5 Gbps)
                for connections to the management ports of servers and other
                equipment in the rack, and miscellaneous other devices like our
                HomeAssistant server.
              </p>

              <Heading
                level={4}
                className="mb-0 font-sans text-sm text-alveus-green-200 uppercase"
              >
                Security Recording
              </Heading>
              <p>
                Finally, at the bottom of the networking section of the rack, is
                a UNVR Network Video Recorder from Ubiquiti, which handles the
                recording of security cameras around the sanctuary (enclosure
                camera feeds are recorded to the storage server below),
                connected to the Pro Max switch via a GbE link.
              </p>
            </div>

            <div>
              <Heading level={3} className="text-xl">
                Core Compute
              </Heading>

              <Heading
                level={4}
                className="mb-0 font-sans text-sm text-alveus-green-200 uppercase"
              >
                Development Server
              </Heading>
              <p>
                A 1U Dell PowerEdge R630 acts as our development server.
                It&apos;s connected to the network with a GbE link to the Pro
                Max switch, plus a second link for its management port. Proxmox
                is installed as the host OS acting as a hypervisor, with
                Tailscale running on the host for remote access. We have a
                development Kubernetes cluster running within Proxmox, as well
                as any other VMs that we need to test or develop on.
              </p>
              <Spec
                items={[
                  ["CPU", ["2x Intel Xeon E5-2650 v4 @ 2.2 GHz"]],
                  ["RAM", ["20x 32 GB DDR4 ECC @ 2400 MHz"]],
                  ["Storage", ["2x 120 GB Dell S3510 SATA SSD"]],
                  ["Networking", ["8x GbE RJ45", "1x BMC RJ45"]],
                ]}
                className="mt-1"
              />

              <Heading
                level={4}
                className="mb-0 font-sans text-sm text-alveus-green-200 uppercase"
              >
                Application Server
              </Heading>
              <p>
                A 2U SuperMicro AS-2024S-TR Mainstream A+ SuperServer acts as
                our production application server. The server is networked with
                a 10 Gbps fiber link to the Pro Aggregation switch, as well as a
                management port link to the Pro Max switch. As with the
                development server, Proxmox is installed as the host OS acting
                as a hypervisor, alongside Tailscale for remote access. A
                Kubernetes cluster is running within Proxmox, which hosts the
                majority of our applications. Additional VMs are also run in
                Proxmox for non-containerized applications, such as our database
                instances.
              </p>
              <Spec
                items={[
                  ["CPU", ["2x AMD EPYC™ 7313 16-Core @ 3.0 GHz"]],
                  ["RAM", ["4x 64 GB DDR4 ECC @ 3200 MHz"]],
                  ["Storage", ["3x 960 GB Micron 7450 PRO NVMe SSD"]],
                  [
                    "Networking",
                    ["2x 10 Gbps SFP+", "2x GbE RJ45", "1x BMC RJ45"],
                  ],
                ]}
                className="mt-1"
              />

              <Heading
                level={4}
                className="mb-0 font-sans text-sm text-alveus-green-200 uppercase"
              >
                Storage Server
              </Heading>
              <p>
                A 2U SuperMicro AS-2024S-TR Mainstream A+ SuperServer also acts
                as our storage server for all our enclosure camera feeds. Like
                the application server, this server is networked with a 10 Gbps
                fiber link to the Pro Aggregation switch and a link to the Pro
                Max switch for the management port. It also has Proxmox
                installed as the host OS with Tailscale for access. Two key VMs
                are deployed to the server, running MediaMTX which handles
                ingesting and re-broadcasting the camera feeds, and TrueNAS to
                expose the storage RAIDZ2 ZFS array as a network share for the
                cameras to record their feeds to continually. Additional VMs are
                run in Proxmox to utilize the spare compute available on the
                server, complementing the deployments on the application server.
              </p>
              <Spec
                items={[
                  ["CPU", ["2x AMD EPYC™ 7313 16-Core @ 3.0 GHz"]],
                  ["RAM", ["4x 64 GB DDR4 ECC @ 3200 MHz"]],
                  [
                    "Storage",
                    [
                      "8x 14 TB Seagate Exos™ 2X14 SAS HDD",
                      "1x 960 GB Samsung PM9A3 M.2 SSD",
                    ],
                  ],
                  [
                    "Networking",
                    ["2x 10 Gbps SFP+", "2x GbE RJ45", "1x BMC RJ45"],
                  ],
                ]}
                className="mt-1"
              />
            </div>
          </div>

          <Rack sticky="bottom" className="lg:order-first">
            <Switch rj45={0} sfp={32} rows={2} title="USW Pro Aggregation" />
            <Switch drives={1} rj45={9} rows={2} title="UDM Pro" />

            <Switch title="USW Pro Max 24 PoE" />
            <Switch
              screen={false}
              drives={4}
              rj45={0}
              sfp={0}
              title="UNVR Network Video Recorder"
            />

            <Blank />

            <Storage size={1} title="Dell PowerEdge R630 (development)" />
            <Storage
              drives={Array(3).fill(true)}
              title="SuperMicro AS-2024S-TR (application)"
            />
            <Storage
              drives={Array(8).fill(true)}
              title="SuperMicro AS-2024S-TR (storage)"
            />

            <Blank />

            <UPS size={2} title="Eaton 5P3000RT UPS" />
          </Rack>
        </div>
      </Section>

      {/* Grow the last section to cover the page */}
      <div className="relative flex grow flex-col">
        <Image
          src={leafLeftImage3}
          alt=""
          className="pointer-events-none absolute -bottom-24 left-0 z-10 hidden h-auto w-1/2 max-w-48 drop-shadow-md select-none lg:block"
        />

        <Section className="grow" containerClassName="space-y-2">
          <Heading level={2} className="mt-0" id="open-source" link>
            Open-source
          </Heading>

          <p className="text-balance">
            We believe in being transparent in all that we do, and that includes
            the code we&apos;re writing to power Alveus Sanctuary. This website,
            our Twitch extension, and even that chatbot used to control the
            cams, are all open-source on GitHub. We&apos;re not just building in
            public, we&apos;re also always looking for community contributors to
            help us improve them!
          </p>

          <ul className="my-4 grid grid-cols-1 lg:my-8 lg:grid-cols-2 lg:gap-4 xl:grid-cols-3">
            {typeSafeObjectEntries(openSource).map(([key, item]) => (
              <li key={key}>
                <p>
                  <span className="font-bold">
                    {item.title}
                    {": "}
                  </span>
                  <Link href={item.link} external>
                    {item.description}
                  </Link>
                </p>
              </li>
            ))}
          </ul>

          <p className="text-balance">
            If you discover a security vulnerability within the website, or any
            of our other open-source projects, please email us:{" "}
            <Link href="mailto:opensource@alveussanctuary.org">
              opensource@alveussanctuary.org
            </Link>
          </p>

          <p className="text-balance">
            Thanks to{" "}
            <Link href="https://vercel.com" external>
              Vercel
            </Link>{" "}
            (web hosting), and{" "}
            <Link href="https://cloudflare.com" external>
              Cloudflare
            </Link>{" "}
            (DNS, video streaming, and web hosting), for providing us their
            services free of charge as part of their open-source/non-profit
            programs.
          </p>
        </Section>
      </div>
    </>
  );
};

export default AboutTechPage;
