import { type NextPage } from "next";
import Image from "next/image";
import React from "react";

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

const broadcastStudio: ListItems = {
  software: {
    title: "Software",
    description: "OBS + Psynaps Cloud Server",
  },
  camera: {
    title: "Camera",
    items: {
      dslr: {
        title: "DSLR",
        description: "Sony Alpha a6400",
      },
      lens: {
        title: "Studio Lens",
        description: "Sony SELP1650 16-50mm Power Zoom Lens",
      },
      telephoto: {
        title: "Telephoto Lens",
        description: "Tamron 70-180mm f/2.8 Di III VXD Lens",
      },
      flipLens: {
        title: "Studio Lens (Station3Media)",
        description: "Sony Vario-Tessar T* FE 16-35mm f/4 ZA OSS Lens",
      },
      flipTripod: {
        title: "Tripod (Station3Media)",
        description: "Manfrotto MVT502AM Tripod and MVH500A Fluid Head",
      },
    },
  },
  audio: {
    title: "Audio",
    items: {
      wirelessMics: {
        title: "Wireless Mics",
        description: "4x Sennheiser XSW 1-ME3-A Wireless Headmic Set",
      },
      overheadMic: {
        title: "Overhead Mic",
        description: "Audio Technica PRO45",
      },
      monitoring: {
        title: "Monitoring",
        description: "Xvive U4 Wireless in-Ear Monitor System",
      },
      audioInterface: {
        title: "Audio Interface",
        description: "Focusrite Scarlett 18i8 3rd Gen",
      },
    },
  },
  lighting: {
    title: "Lighting",
    items: {
      keyLight: {
        title: "Key Light",
        description: "Elgato Ring Light",
      },
      fillLight: {
        title: "Fill Light",
        description:
          '2x Godox SL150WII w/ Neewer 32"x32" Octagon Flash Softbox',
      },
    },
  },
  streamingPc: {
    title: "Streaming PC",
    items: {
      cpu: {
        title: "CPU",
        description: "AMD Ryzen 9 5900X",
      },
      gpu: {
        title: "GPU",
        description: "Nvidia RTX 3070",
      },
      ram: {
        title: "RAM",
        description: "32GB",
      },
      storage: {
        title: "Storage",
        description: "CORSAIR Force MP600 1TB SSD",
      },
      control: {
        title: "Control",
        description: "Elgato Stream Deck",
      },
      videoOutput: {
        title: "Video Output",
        description: "OREI HDMI Splitter UHDS-102C",
      },
    },
  },
};

const broadcastSystem: ListItems = {
  localPc: {
    title: "Local PC",
    description: "MINISFORUM EliteMini TH80",
    items: {
      cpu: {
        title: "CPU",
        description: "Intel Core i7-11800H",
      },
      ram: {
        title: "RAM",
        description: "32GB",
      },
      storage: {
        title: "Storage",
        description: "512GB SSD",
      },
    },
  },
  remotePc: {
    title: "Remote PC",
    description: "ROG Strix G10 Gaming Desktop PC",
    items: {
      cpu: {
        title: "CPU",
        description: "Intel Core i7-11700",
      },
      gpu: {
        title: "GPU",
        description: "Nvidia RTX 3060",
      },
      ram: {
        title: "RAM",
        description: "16GB DDR4",
      },
      storage: {
        title: "Storage",
        description: "1TB SSD",
      },
    },
  },
  software: {
    title: "Software",
    items: {
      obs: {
        title: "OBS",
        description: "Used with assorted plugins",
        items: {
          transitionTable: "Transition Table",
          sourceCopy: "Source Copy",
          advancedSceneSwitcher: "Advanced Scene Switcher",
        },
      },
      chatBot: {
        title: "Chat Control",
        description: "Custom Node.js app for Twitch.tv chat features",
        items: {
          obs: "Controls local and cloud OBS instances",
          cams: "Controls Axis PTZ cameras",
        },
      },
    },
  },
  nutritionHouse: {
    title: "Nutrition House",
    items: {
      pc: {
        title: "PC",
        description: "Beelink Mini PC w/ AMD Ryzen 5 5500U",
      },
      cam: {
        title: "Camera",
        description: "OBSBot",
      },
    },
  },
};

const outsideBroadcasts: { backpack: ListItems; animals: ListItems } = {
  backpack: {
    connectivity: {
      title: "Connectivity",
      items: {
        liveU: "LiveU Solo",
        nighthawk: "Verizon Netgear Nighthawk MR1100-100NAS",
        inseego: "2 x Inseego MC800 Modems",
      },
    },
    power: {
      title: "Power",
      items: {
        maxoak: "MAXOAK Laptop Power Bank 185Wh/50000mAh",
        krisdonia: "Krisdonia 50000mAh Laptop Power Bank",
      },
    },
    dslr: {
      title: "DSLR",
      items: {
        dslr: "Sony a7R III Camera",
        lens: "Tamron 28-75mm F/2.8 Di III RXD Lens",
        flipLens: "Sigma 24-70mm F2.8 DG DN | Art Lens (Station3Media)",
        flipFilter:
          "K&F Concept Nano-X 82mm Circular Polarizer + Variable ND2-32 Filter (1- to 5-Stop) (Station3Media)",
      },
    },
    goPro: {
      title: "GoPro",
      items: {
        camera: "GoPro 11 + MediaMod w/ GoPro Labs firmware (clean HDMI out)",
        quickRelease: "ULANZI GP-4 Magnetic Quick Release for GoPro",
        shoulderMount: "STUNTMAN Pack Mount Shoulder Mount for GoPro",
      },
    },
    audio: {
      title: "Audio",
      items: {
        lav: "Rode Wireless GO II",
        mic: "Rode VideoMicro I Mic (for DSLR)",
        flipTx:
          "Rode RodeLink TX-BELT Wireless Beltpack Transmitter (for DSLR; Station3Media)",
        flipRx:
          "Rode RodeLink RX-Cam Camera Mounted Wireless Receiver (for DSLR; Station3Media)",
        flipRecorder: "H6 Audio Recorder (for DSLR; Station3Media)",
      },
    },
  },
  animals: {
    device: {
      title: "Device",
      description: "Google Pixel 7",
    },
    apps: {
      title: "Apps",
      items: {
        larixBroadcaster: "Larix Broadcaster (broadcasting)",
        speedify: "Speedify (internet bonding)",
        irlChat: "IRL Chat (alerts + chat)",
      },
    },
  },
};

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
};

type ListItems = {
  [key: string]:
    | string
    | { title: string; description?: string; link?: string; items?: ListItems };
};

type ListProps = {
  items: ListItems;
  className?: string;
  itemClassName?: string;
  dark?: boolean;
};

const List: React.FC<ListProps> = ({
  items,
  className,
  itemClassName,
  dark,
}) => (
  <ul className={className}>
    {Object.entries(items).map(([key, item], idx) => (
      <li
        key={key}
        className={classes(
          // Add whitespace above if we're nested and not the first item
          idx !== 0 && typeof item === "object" && item.items && "mt-2",
          itemClassName,
        )}
      >
        {typeof item === "string" ? (
          <p>{item}</p>
        ) : (
          <>
            <p>
              <span className="font-bold">
                {item.description || !item.link ? (
                  item.title
                ) : (
                  <Link href={item.link} dark={dark} external>
                    {item.title}
                  </Link>
                )}
                {item.description && ": "}
              </span>
              {item.description &&
                (item.link ? (
                  <Link href={item.link} dark={dark} external>
                    {item.description}
                  </Link>
                ) : (
                  item.description
                ))}
            </p>
            {item.items && (
              <List items={item.items} dark={dark} className="ml-4" />
            )}
          </>
        )}
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
          className="pointer-events-none absolute -top-8 right-0 z-10 hidden h-auto w-1/2 max-w-sm select-none lg:block xl:max-w-md"
        />

        <Section dark className="py-24">
          <div className="w-full lg:w-3/5">
            <Heading level={1}>Tech at Alveus</Heading>
            <p className="text-lg">
              Alveus Sanctuary is a virtual education center, and with that
              comes the need for a lot of technology to make it all work, from
              livestream broadcast systems to PTZ cameras and microphones in the
              ambassador enclosures.
            </p>
          </div>
        </Section>
      </div>

      <div className="relative">
        <Image
          src={leafLeftImage1}
          alt=""
          className="pointer-events-none absolute -bottom-28 -left-8 z-10 hidden h-auto w-1/2 max-w-[10rem] -rotate-45 select-none lg:block 2xl:max-w-[12rem]"
        />

        <Section containerClassName="flex flex-wrap -mx-4">
          <div className="basis-full p-4 lg:basis-1/2">
            <Heading level={2} className="mb-4 mt-0" id="studio" link>
              Broadcast Studio
            </Heading>
            <List items={broadcastStudio} />
          </div>

          <div className="basis-full p-4 lg:basis-1/2">
            <Heading level={2} className="mb-4 mt-0" id="system" link>
              Broadcast System
            </Heading>
            <List items={broadcastSystem} />
          </div>
        </Section>
      </div>

      <div className="relative">
        <Image
          src={leafRightImage2}
          alt=""
          className="pointer-events-none absolute -bottom-24 right-0 z-10 hidden h-auto w-1/2 max-w-[12rem] select-none lg:block"
        />

        <Section dark>
          <Heading level={2} id="outside" link>
            Outside Broadcasts
          </Heading>

          <div className="flex flex-wrap">
            <div className="basis-full p-4 lg:basis-1/2">
              <Heading level={3} className="mb-4 mt-0 text-2xl">
                Livestream Backpack
              </Heading>
              <List items={outsideBroadcasts.backpack} />
            </div>

            <div className="basis-full p-4 lg:basis-1/2">
              <Heading level={3} className="mb-4 mt-0 text-2xl">
                Roaming Animal Cam
              </Heading>
              <List items={outsideBroadcasts.animals} />
            </div>
          </div>
        </Section>
      </div>

      <div className="relative">
        <Image
          src={leafLeftImage2}
          alt=""
          className="pointer-events-none absolute -bottom-20 right-0 z-10 hidden h-auto w-1/2 max-w-[12rem] -scale-x-100 select-none lg:block"
        />

        <Section>
          <Heading level={2} className="mb-4 mt-0" id="cameras" link>
            Network + Enclosure Cameras
          </Heading>
          <Network />
        </Section>
      </div>

      {/* Grow the last section to cover the page */}
      <div className="relative flex flex-grow flex-col">
        <Image
          src={leafLeftImage3}
          alt=""
          className="pointer-events-none absolute -bottom-24 left-0 z-10 hidden h-auto w-1/2 max-w-[12rem] select-none lg:block"
        />

        <Section dark className="flex-grow bg-alveus-green-800">
          <Heading level={2} className="mb-2 mt-0" id="open-source" link>
            Open-source
          </Heading>
          <p className="mb-4">
            This website, and our Twitch extension, are open-source on GitHub.
            We&apos;re always looking for contributors to help us improve them!
          </p>
          <List
            items={openSource}
            className="flex flex-wrap md:gap-y-4"
            itemClassName="basis-full md:basis-1/2 lg:basis-1/3"
            dark
          />
        </Section>
      </div>
    </>
  );
};

export default AboutTechPage;
