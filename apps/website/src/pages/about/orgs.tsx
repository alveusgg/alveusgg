import { type NextPage } from "next";
import Image from "next/image";
import { type ReactNode, useMemo, useState } from "react";

import { classes } from "@/utils/classes";

import Heading from "@/components/content/Heading";
import { Preview as InstagramPreview } from "@/components/content/Instagram";
import Lightbox from "@/components/content/Lightbox";
import Link from "@/components/content/Link";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import { YouTubeEmbed, YouTubePreview } from "@/components/content/YouTube";

import leafLeftImage1 from "@/assets/floral/leaf-left-1.png";
import leafLeftImage2 from "@/assets/floral/leaf-left-2.png";
import leafLeftImage3 from "@/assets/floral/leaf-left-3.png";
import leafLeftImage4 from "@/assets/floral/leaf-left-4.png";
import leafRightImage1 from "@/assets/floral/leaf-right-1.png";
import leafRightImage2 from "@/assets/floral/leaf-right-2.png";
import leafRightImage3 from "@/assets/floral/leaf-right-3.png";

type Video = {
  title: string;
} & ({ youtube: string } | { instagram: string });
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
      "Documenting SDZWA's California Condor Center and exploring themes of diversity in both nature and across conservation related careers.",
    videos: [
      {
        title: "Touring San Diego Zoo Safari Park",
        youtube: "ShneHneCqlE",
      },
      {
        title: "Working In Conservation with San Diego Zoo Safari Park",
        youtube: "heNAUMbq-ls",
      },
      {
        title: "San Diego Zoo Wildlife Alliance Condor Breeding Program Reel",
        instagram: "DHgYQRtueYV",
      },
    ],
  },
  {
    key: "whale-and-dolphin-conservation",
    title: "Whale and Dolphin Conservation",
    description: "Documenting the plight of the North Atlantic Right Whale.",
    videos: [
      {
        title: "Finding Whales with WDC",
        youtube: "uIoI4na-gUs",
      },
      {
        title: "North Atlantic Right Whales Reel",
        instagram: "CrWi1tMrde9",
      },
      {
        title: "Icelandic Whale Hunting Call to Action Reel",
        instagram: "CsrxAJ-PPBA",
      },
    ],
  },
  {
    key: "purple-martin-conservation-association",
    title: "Purple Martin Conservation Association",
    description:
      "Travelling to the Amazon Rainforest alongside PMCA to follow and document purple martins on their 5000 mile migration.",
    videos: [
      {
        title: "Travelling to Brazil with PMCA",
        youtube: "6EC0xP7GVzc",
      },
    ],
  },
  {
    key: "rainforest-alliance",
    title: "Rainforest Alliance",
    description:
      "Travelling to the Amazon Rainforest and amplifying Rainforest Alliance's mission work to protect rainforests from deforestation, mitigating climate change, and promoting the rights and livelihoods of rural communities.",
    videos: [
      {
        title: "Exploring the Amazon (Part 1)",
        youtube: "WoTHrtz2aQk",
      },
      {
        title: "Exploring the Amazon (Part 2)",
        youtube: "dqGXrDMXEWk",
      },
      {
        title: "Amazon Rainforest Conservation Reel",
        instagram: "C48mQYnrX5r",
      },
    ],
  },
  {
    key: "world-bird-sanctuary",
    title: "World Bird Sanctuary",
    description:
      "Promoting vulture conservation and fundraising for World Bird Sanctuary's education, breeding, and recovery programs.",
    videos: [
      {
        title: "Meeting Birds at World Bird Sanctuary",
        youtube: "vp6NeFTib4I",
      },
    ],
  },
  {
    key: "bat-conservation-international",
    title: "Bat Conservation International",
    description:
      "Visiting the largest colony of bats in the world and fundraising for Bat Conservation International's education, research, and conservation work.",
    videos: [
      {
        title: "Visiting the Largest Bat Colony in the World",
        youtube: "55kwlp1aVw0",
      },
      {
        title: "Bracken Cave Bat Colony Reel",
        instagram: "DIE3UjSPWmc",
      },
    ],
  },
  {
    key: "austin-pets-alive",
    title: "Austin Pets Alive!",
    description:
      "Fundraising for an animal shelter focusing on saving animals at risk of euthanasia.",
    videos: [
      {
        title: "Meeting Cats and Dogs at Austin Pets Alive!",
        youtube: "tjarFJ6CH3U",
      },
    ],
  },
  {
    key: "world-wildlife-fund",
    title: "World Wildlife Fund",
    description:
      "Amplifying various initiatives for World Wildlife Fund to direct action towards sustainable palm oil consumption, environmental advocacy, combating the wildlife trade, and more.",
    videos: [
      {
        title: "Reporting the Illegal Wildlife Trade Reel",
        instagram: "Cwqo1uCv3T3",
      },
      {
        title: "Purchasing Sustainable Palm Oil Products Reel",
        instagram: "C3tLbtovGqN",
      },
      {
        title: "Tropical Deforestation TREES Act Call to Action Reel",
        instagram: "C_jGH9KP4uo",
      },
      {
        title: "Give an Hour for Earth Campaign Reel",
        instagram: "DH_e8lEOJPe",
      },
    ],
  },
  {
    key: "xerces-society",
    title: "Xerces Society",
    description:
      "Partnering with Xerces society to promote the protection of our natural world via invertebrate conservation and invertebrate habitat conservation.",
    videos: [
      {
        title: "Be Kind to Bugs Reel",
        instagram: "C5lyfrqvP3M",
      },
      {
        title: "Monarch Butterfly Endangered Species Act Call to Action Reel",
        instagram: "DGTmtGvvDKx",
      },
    ],
  },
  {
    key: "natural-resources-defense-council",
    title: "Natural Resources Defense Council",
    description:
      "Promoting environmental advocacy in partnership with the Natural Resources Defense Council by encouraging viewers to use their political voice and voting power to safeguard nature.",
    videos: [
      {
        title: "Offshore Drilling Call to Action Reel",
        instagram: "DKsAkGtuERk",
      },
      {
        title: "Western Arctic Drilling Call to Action Reel",
        instagram: "DLVDp43MKOM",
      },
    ],
  },
  {
    key: "carnivero-plant-nursery",
    title: "Carnivero Carnivorous Plant & Rare Plant Nursery",
    description:
      "Documenting and promoting plant conservation via captive breeding efforts to combat plant poaching.",
    videos: [
      {
        title: "Touring Behind the Scenes at Carnivero",
        youtube: "D5Iij3qD6_s",
      },
    ],
  },
  {
    key: "wolf-conservation-center",
    title: "Wolf Conservation Center",
    description:
      "Fundraising for and promoting Wolf Conservation Center's education, research, and recovery programs for Red Wolves and Mexican Gray Wolves.",
    videos: [
      {
        title: "Meeting Wolves at Wolf Conservation Center",
        youtube: "-T8JYRKMilk",
      },
    ],
  },
  {
    key: "associacao-amigos-do-peixe-boi",
    title: "Associação Amigos do Peixe-Boi",
    description:
      "Visiting Associação Amigos do Peixe-Boi in Brazil and documenting their rehabilitation program for Amazonian Manatees and Pink River Dolphins.",
    videos: [
      {
        title: "Visiting a Manatee Rehab Center in Brazil",
        youtube: "gpwQcfLmVgg",
      },
    ],
  },
];

const Org = ({
  key,
  title,
  description,
  videos,
  idx,
}: Organization & { idx: number }) => {
  const [lightboxOpen, setLightboxOpen] = useState<string>();

  const lightboxItems = useMemo(
    () =>
      videos.reduce<Record<string, ReactNode>>(
        (acc, video) =>
          "youtube" in video
            ? {
                ...acc,
                [video.youtube]: (
                  <YouTubeEmbed videoId={video.youtube} caption={video.title} />
                ),
              }
            : acc,
        {},
      ),
    [videos],
  );

  return (
    <div className="relative">
      {idx === 1 && (
        <Image
          src={leafRightImage2}
          alt=""
          className="pointer-events-none absolute -bottom-20 left-0 z-10 hidden h-auto w-1/2 max-w-24 -scale-x-100 drop-shadow-md select-none lg:block 2xl:-bottom-24 2xl:max-w-32"
        />
      )}

      {idx === 3 && (
        <Image
          src={leafLeftImage3}
          alt=""
          className="pointer-events-none absolute right-0 -bottom-20 z-30 hidden h-auto w-1/2 max-w-48 -scale-x-100 drop-shadow-md select-none lg:block"
        />
      )}

      {idx === 5 && (
        <Image
          src={leafLeftImage2}
          alt=""
          className="pointer-events-none absolute -bottom-20 left-0 z-30 hidden h-auto w-1/2 max-w-48 drop-shadow-md select-none lg:block"
        />
      )}

      {idx === 7 && (
        <Image
          src={leafRightImage3}
          alt=""
          className="pointer-events-none absolute right-0 -bottom-24 z-30 hidden h-auto w-1/2 max-w-32 drop-shadow-md select-none lg:block 2xl:max-w-40"
        />
      )}

      {idx === 9 && (
        <Image
          src={leafLeftImage4}
          alt=""
          className="pointer-events-none absolute -bottom-20 left-0 z-10 hidden h-auto w-1/2 max-w-24 drop-shadow-md select-none lg:block 2xl:-bottom-24 2xl:max-w-32"
        />
      )}

      {idx === 11 && (
        <Image
          src={leafLeftImage1}
          alt=""
          className="pointer-events-none absolute right-0 -bottom-32 z-10 hidden h-auto w-1/2 max-w-32 -scale-x-100 drop-shadow-md select-none lg:block 2xl:-bottom-48 2xl:max-w-40"
        />
      )}

      <Section
        dark={idx % 2 === 1}
        className={classes(idx === orgs.length - 1 && "grow")}
      >
        <div
          className={classes(
            "grid grid-cols-1 gap-4 lg:grid-cols-2",
            (videos.length === 3 || videos.length > 4) && "xl:grid-cols-3",
          )}
        >
          <div
            className={classes("mb-6", videos.length > 1 && "col-span-full")}
          >
            <Heading id={key} level={2} link className="text-balance">
              {title}
            </Heading>

            {videos.length === 1 && (
              <div className="my-4 h-2 max-w-3xs rounded-xs bg-alveus-green-300" />
            )}

            {description && (
              <p className="text-lg text-balance">{description}</p>
            )}
          </div>

          {videos.map((video) => {
            const isYouTube = "youtube" in video;
            return (
              <div
                key={
                  isYouTube ? `yt-${video.youtube}` : `ig-${video.instagram}`
                }
                className="flex flex-col"
              >
                <div
                  className={
                    isYouTube
                      ? "contents"
                      : "flex aspect-video items-center gap-4"
                  }
                >
                  <Heading
                    level={3}
                    className={classes(
                      "order-last font-sans text-2xl",
                      isYouTube
                        ? "text-center"
                        : "grow lg:order-first lg:text-right",
                    )}
                  >
                    {video.title}
                  </Heading>

                  {isYouTube ? (
                    <Link
                      href={`https://www.youtube.com/watch?v=${video.youtube}`}
                      external
                      onClick={(e) => {
                        e.preventDefault();
                        setLightboxOpen(video.youtube);
                      }}
                      custom
                      className="group/trigger"
                    >
                      <YouTubePreview
                        videoId={video.youtube}
                        alt={video.title}
                      />
                    </Link>
                  ) : (
                    <Link
                      href={`https://www.instagram.com/reel/${video.instagram}`}
                      external
                      custom
                      className="group/trigger h-full shrink-0"
                    >
                      <InstagramPreview
                        reelId={video.instagram}
                        className="h-0 min-h-full"
                      />
                    </Link>
                  )}
                </div>

                {!isYouTube && (
                  <div className="mt-4 ml-auto hidden h-2 w-full max-w-3xs rounded-xs bg-alveus-green-300 lg:block" />
                )}
              </div>
            );
          })}

          <Lightbox
            open={lightboxOpen}
            onClose={() => setLightboxOpen(undefined)}
            items={lightboxItems}
          />
        </div>
      </Section>
    </div>
  );
};

const AboutOrgsPage: NextPage = () => {
  return (
    <>
      <Meta
        title="Partnering with Organizations"
        description="Beyond our educational collaborations with content creators, Maya Higa and Alveus Sanctuary partner with various organizations to further our mission of conservation and education."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <div className="relative">
        <Image
          src={leafRightImage1}
          alt=""
          className="pointer-events-none absolute -top-8 right-0 z-10 hidden h-auto w-1/2 max-w-xs drop-shadow-md select-none lg:block xl:max-w-sm"
        />

        <Section dark>
          <div className="w-full lg:w-4/5 lg:py-8">
            <Heading>Partnering with Organizations</Heading>

            <p className="text-lg text-balance">
              Beyond our{" "}
              <Link href="/collaborations" dark>
                educational collaborations
              </Link>{" "}
              with content creators, Maya Higa and Alveus Sanctuary partner with
              various organizations to further our mission of conservation and
              education. These partnerships allow us to amplify their efforts
              and share their important work with our audience.
            </p>
          </div>
        </Section>
      </div>

      {orgs.map((org, idx) => (
        <Org {...org} key={org.key} idx={idx} />
      ))}

      {/* Grow the last section to cover the page */}
      <Section dark className="grow bg-alveus-green-900">
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
            with us. We are always looking for new ways to collaborate and share
            the important work being done in conservation and education.
          </p>
        </div>
      </Section>
    </>
  );
};

export default AboutOrgsPage;
