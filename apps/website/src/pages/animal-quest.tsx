import { type NextPage } from "next";
import Image from "next/image";
import React, { Fragment } from "react";

import { formatDateUTC } from "@/utils/datetime";
import { camelToKebab } from "@/utils/string-case";

import animalQuest, { type AnimalQuestWithEpisode } from "@/data/animal-quest";
import ambassadors, { type AmbassadorKey } from "@/data/ambassadors";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Link from "@/components/content/Link";
import IconYouTube from "@/icons/IconYouTube";

import animalQuestLogo from "@/assets/animal-quest/logo.png";
import animalQuestFull from "@/assets/animal-quest/full.png";

import leafRightImage2 from "@/assets/floral/leaf-right-2.png";
import leafLeftImage3 from "@/assets/floral/leaf-left-3.png";
import leafLeftImage1 from "@/assets/floral/leaf-left-1.png";

const episodes: AnimalQuestWithEpisode[] = animalQuest
  .map((episode, idx) => ({
    ...episode,
    episode: idx + 1,
  }))
  .reverse();

type AnimalQuestSectionProps = {
  items: AnimalQuestWithEpisode[];
};

const AnimalQuestSection: React.FC<AnimalQuestSectionProps> = ({ items }) => {
  return (
    <div className="flex flex-wrap">
      {items.map((episode) => (
        <div
          key={episode.episode}
          className="mx-auto flex basis-full flex-wrap items-center gap-4 py-8 sm:flex-nowrap md:px-8 xl:basis-1/2"
        >
          <div className="relative flex-shrink-0 rounded-full bg-alveus-tan">
            <Image
              src={
                episode.ambassadors.length > 0
                  ? ambassadors[episode.ambassadors[0] as AmbassadorKey]
                      .images[0].src
                  : animalQuestFull
              }
              alt=""
              className={[
                episode.ambassadors.length === 0 && "opacity-10",
                "h-32 w-32 rounded-full object-cover shadow",
              ]
                .filter(Boolean)
                .join(" ")}
              width={256}
            />

            {episode.ambassadors.length > 1 && (
              <Image
                src={
                  ambassadors[
                    episode.ambassadors[
                      episode.ambassadors.length > 2 ? 2 : 1
                    ] as AmbassadorKey
                  ].images[0].src
                }
                alt=""
                className="absolute -bottom-2 -right-2 h-16 w-16 rounded-full object-cover shadow-[-10px_-10px_25px_-10px_rgba(0,0,0,0.5)]"
                width={256}
              />
            )}

            {episode.ambassadors.length > 2 && (
              <Image
                src={
                  ambassadors[episode.ambassadors[1] as AmbassadorKey].images[0]
                    .src
                }
                alt=""
                className="absolute -bottom-2 -left-2 h-16 w-16 rounded-full object-cover shadow-[10px_-10px_25px_-10px_rgba(0,0,0,0.5)]"
                width={256}
              />
            )}
          </div>

          <div className="flex-grow">
            <Link
              href={episode.link}
              className="group flex items-end justify-between gap-x-8 transition-colors hover:text-alveus-green-600"
              external
              custom
            >
              <Heading level={2} className="my-0 mb-1.5">
                <span className="block text-lg">
                  Episode {episode.episode}:{" "}
                </span>
                <span className="block group-hover:underline">
                  {episode.edition}
                </span>
              </Heading>

              <IconYouTube size={48} className="shrink-0" />
            </Link>
            <p className="text-lg">
              <span className="text-base opacity-80">Broadcast: </span>
              {formatDateUTC(episode.broadcast, "long")}
            </p>
            {episode.ambassadors.length > 0 && (
              <p className="text-lg">
                <span className="text-base opacity-80">Featuring: </span>
                {episode.ambassadors.map((ambassador, idx) => (
                  <Fragment key={ambassador}>
                    <Link href={`/ambassadors/${camelToKebab(ambassador)}`}>
                      {ambassadors[ambassador].name}
                    </Link>
                    {idx < episode.ambassadors.length - 2 && ", "}
                    {idx === episode.ambassadors.length - 2 &&
                      episode.ambassadors.length > 2 &&
                      ","}
                    {idx === episode.ambassadors.length - 2 && " and "}
                  </Fragment>
                ))}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const AnimalQuestPage: NextPage = () => {
  return (
    <>
      <Meta
        title="Animal Quest"
        description="Learn about the ambassadors at Alveus through Animal Quest, a series hosted by Maya Higa."
        image={animalQuestFull.src}
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <div className="relative">
        <Image
          src={leafLeftImage3}
          alt=""
          className="pointer-events-none absolute -bottom-40 left-0 z-10 hidden h-auto w-1/2 max-w-[16rem] select-none lg:block"
        />

        <Section
          dark
          className="py-0"
          containerClassName="flex flex-wrap-reverse items-center justify-between"
        >
          <div className="w-full pb-16 pt-4 md:w-3/5 md:py-24">
            <Heading>Animal Quest</Heading>
            <p className="text-lg">
              Learn about the ambassadors at Alveus through Animal Quest, a
              series hosted by Maya Higa. Each episode introduces you to a new
              ambassador and their species&apos; importance to the environment,
              the risks they face, and what you can do to help them.
            </p>
          </div>

          <Image
            src={animalQuestLogo}
            width={576}
            alt=""
            className="mx-auto w-full max-w-xl p-4 pt-8 md:mx-0 md:w-2/5 md:pt-4"
          />
        </Section>
      </div>

      {/* Grow the last section to cover the page */}
      <div className="relative flex flex-grow flex-col">
        <Image
          src={leafLeftImage1}
          alt=""
          className="pointer-events-none absolute -bottom-24 left-0 z-10 hidden h-auto w-1/2 max-w-[12rem] select-none lg:block"
        />
        <Image
          src={leafRightImage2}
          alt=""
          className="pointer-events-none absolute -bottom-48 right-0 z-10 hidden h-auto w-1/2 max-w-[12rem] select-none lg:block"
        />

        <Section className="flex-grow">
          <AnimalQuestSection items={episodes} />
        </Section>
      </div>
    </>
  );
};

export default AnimalQuestPage;
