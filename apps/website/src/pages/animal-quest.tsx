import { type NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import React from "react";

import { formatDateUTC } from "@/utils/datetime";

import animalQuest, { type AnimalQuestWithEpisode } from "@/data/animal-quest";
import animalQuestLogo from "@/assets/animal-quest/logo.png";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";

import leafRightImage2 from "@/assets/floral/leaf-right-2.png";
import leafLeftImage3 from "@/assets/floral/leaf-left-3.png";
import leafLeftImage1 from "@/assets/floral/leaf-left-1.png";

const episodes: AnimalQuestWithEpisode[] = animalQuest.map((episode, idx) => ({
  ...episode,
  episode: idx + 1,
}));

type AnimalQuestSectionProps = {
  items: AnimalQuestWithEpisode[];
};

const AnimalQuestSection: React.FC<AnimalQuestSectionProps> = ({ items }) => {
  return (
    <div className="flex flex-wrap">
      {items.map((episode) => (
        <div
          key={episode.episode}
          className="mx-auto flex basis-full flex-col items-start justify-start py-8 md:px-8 lg:basis-1/2"
        >
          <Heading level={2}>
            <Link
              href={episode.link}
              target="_blank"
              rel="noreferrer"
              className="hover:text-alveus-green-600 hover:underline"
            >
              <span className="block text-lg">Episode {episode.episode}: </span>
              {episode.edition}
            </Link>
          </Heading>
          <p>Broadcast: {formatDateUTC(episode.broadcast, "long")}</p>
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
        description="Learn about the ambassadors at Alveus through the Animal Quest series, hosted by Maya Higa."
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
              Learn about the ambassadors at Alveus through the Animal Quest
              series, hosted by Maya Higa. Each episode introduces you to a new
              ambassador and their importance to the environment, the risks they
              face and what you can do to help them.
            </p>
          </div>

          <Image
            src={animalQuestLogo}
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
