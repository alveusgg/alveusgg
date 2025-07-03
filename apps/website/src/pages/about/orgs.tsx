import { type NextPage } from "next";
import Image from "next/image";

import { classes } from "@/utils/classes";

import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import { Lightbox, Preview } from "@/components/content/YouTube";

import leafLeftImage1 from "@/assets/floral/leaf-left-1.png";
import leafLeftImage3 from "@/assets/floral/leaf-left-3.png";

type Video = {
  title: string;
  id: string;
};
type Organization = {
  key: string;
  title: string;
  description?: string;
  videos: Video[];
};

const orgs: Organization[] = [
  {
    key: "san-diego-zoo-wildlife-alliance",
    title: "San Diego Zoo Wildlife Alliance",
    description:
      "Meeting Marco Wendt, a wildlife ambassador from San Diego Zoo Wildlife Alliance, and learning about their conservation efforts.",
    videos: [
      {
        title: "Touring San Diego Zoo Safari Park",
        id: "ShneHneCqlE",
      },
      {
        title: "Working In Conservation with San Diego Zoo Safari Park",
        id: "heNAUMbq-ls",
      },
    ],
  },
  {
    key: "whale-and-dolphin-conservation",
    title: "Whale and Dolphin Conservation",
    description:
      "Learning about North Atlantic right whales and the conservation work that Whale and Dolphin Conservation does to protect them and other marine mammals.",
    videos: [
      {
        title: "Finding Whales with WDC",
        id: "uIoI4na-gUs",
      },
    ],
  },
  {
    key: "purple-martin-conservation-association",
    title: "Purple Martin Conservation Association",
    videos: [
      {
        title: "Travelling to Brazil with PMCA",
        id: "6EC0xP7GVzc",
      },
    ],
  },
  {
    key: "rainforest-alliance",
    title: "Rainforest Alliance",
    videos: [
      {
        title: "Exploring the Amazon (Part 1)",
        id: "WoTHrtz2aQk",
      },
      {
        title: "Exploring the Amazon (Part 2)",
        id: "dqGXrDMXEWk",
      },
    ],
  },
  {
    key: "world-bird-sanctuary",
    title: "World Bird Sanctuary",
    videos: [
      {
        title: "Meeting Birds at World Bird Sanctuary",
        id: "vp6NeFTib4I",
      },
    ],
  },
  {
    key: "bat-conservation-international",
    title: "Bat Conservation International",
    videos: [
      {
        title: "Visiting the Largest Bat Colony in the World",
        id: "55kwlp1aVw0",
      },
    ],
  },
  {
    key: "austin-pets-alive",
    title: "Austin Pets Alive!",
    videos: [
      {
        title: "Meeting Cats and Dogs at Austin Pets Alive!",
        id: "tjarFJ6CH3U",
      },
    ],
  },
];

const AboutOrgsPage: NextPage = () => {
  return (
    <>
      <Meta
        title="Partnering with Organizations"
        description="Beyond our educational collaborations with content creators, Alveus Sanctuary partners with various organizations to further our mission of conservation and education."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <div className="relative">
        <Image
          src={leafLeftImage3}
          alt=""
          className="pointer-events-none absolute right-0 -bottom-16 z-30 hidden h-auto w-1/2 max-w-48 -scale-x-100 select-none lg:block"
        />

        <Section dark className="pt-24 pb-12">
          <div className="w-full lg:w-4/5">
            <Heading>Partnering with Organizations</Heading>

            <p className="text-lg text-balance">
              Beyond our{" "}
              <Link href="/collaborations" dark>
                educational collaborations
              </Link>{" "}
              with content creators, Alveus Sanctuary partners with various
              organizations to further our mission of conservation and
              education. These partnerships allow us to amplify their efforts
              and share their important work with our audience.
            </p>
          </div>
        </Section>
      </div>

      {orgs.map((org, idx) => (
        <Section
          key={org.key}
          dark={idx % 2 === 1}
          className={classes(idx === orgs.length - 1 && "grow")}
        >
          <div
            className={classes(
              "grid grid-cols-1 gap-4 lg:grid-cols-2",
              (org.videos.length === 3 || org.videos.length > 4) &&
                "xl:grid-cols-3",
            )}
          >
            <div className={classes(org.videos.length > 1 && "col-span-full")}>
              <Heading id={org.key} level={2} link className="text-balance">
                {org.title}
              </Heading>

              {org.videos.length === 1 && (
                <div className="my-4 h-2 max-w-3xs rounded-xs bg-alveus-green-300" />
              )}

              {org.description && (
                <p className="text-lg text-balance">{org.description}</p>
              )}
            </div>

            <Lightbox id={org.key} className="mt-6 contents">
              {({ Trigger }) => (
                <>
                  {org.videos.map((video) => (
                    <div key={video.id}>
                      <Trigger videoId={video.id} caption={video.title}>
                        <Preview videoId={video.id} alt={video.title} />
                      </Trigger>

                      <Heading level={3} className="text-center text-2xl">
                        {video.title}
                      </Heading>
                    </div>
                  ))}
                </>
              )}
            </Lightbox>
          </div>
        </Section>
      ))}

      <div className="relative">
        <Image
          src={leafLeftImage1}
          alt=""
          className="pointer-events-none absolute -bottom-32 left-0 z-10 hidden h-auto w-1/2 max-w-32 drop-shadow-md select-none lg:block 2xl:-bottom-48 2xl:max-w-40"
        />

        <Section dark className="bg-alveus-green-900">
          <div className="w-full lg:w-4/5">
            <Heading id="work-with-us" level={2} link>
              Work with us
            </Heading>

            <p className="text-lg text-balance">
              If you are an organization that would like to partner with Alveus
              Sanctuary, please{" "}
              <Link href="/contact-us" dark>
                get in touch
              </Link>{" "}
              with us. We are always looking for new ways to collaborate and
              share the important work being done in conservation and education.
            </p>
          </div>
        </Section>
      </div>
    </>
  );
};

export default AboutOrgsPage;
