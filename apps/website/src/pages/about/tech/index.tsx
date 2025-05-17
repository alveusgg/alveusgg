import { type NextPage } from "next";
import Image from "next/image";

import { classes } from "@/utils/classes";

import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import Network, { NetworkStats } from "@/components/tech/Network";
import Overview from "@/components/tech/Overview";

import leafLeftImage1 from "@/assets/floral/leaf-left-1.png";
import leafLeftImage2 from "@/assets/floral/leaf-left-2.png";
import leafLeftImage3 from "@/assets/floral/leaf-left-3.png";
import leafRightImage1 from "@/assets/floral/leaf-right-1.png";

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

const List = ({ items, className, itemClassName, dark }: ListProps) => (
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
          className="pointer-events-none absolute -top-8 right-0 z-10 hidden h-auto w-1/2 max-w-sm drop-shadow-md select-none lg:block xl:max-w-md"
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
          className="pointer-events-none absolute bottom-1/2 -left-8 z-10 hidden h-auto w-1/2 max-w-40 -rotate-45 drop-shadow-md select-none lg:block 2xl:max-w-48"
        />
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
