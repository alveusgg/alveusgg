import { type NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import React from "react";

import animalQuest, { type AnimalQuestWithEpisode } from "@/data/animal-quest";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";

import leafRightImage1 from "@/assets/floral/leaf-right-1.png";
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
    <>
      {items.map((episode) => (
        <div
          key={episode.episode}
          className="mx-auto flex basis-full flex-col items-center justify-start py-8 md:px-8 lg:basis-1/2"
        >
          <Heading
            level={2}
            className="flex flex-wrap items-end justify-center gap-x-8 gap-y-2"
          >
            <Link
              href={episode.link}
              target="_blank"
              rel="noreferrer"
              className="hover:text-alveus-green-600 hover:underline"
            >
              Animal Quest Ep. {episode.episode}: {episode.edition}
            </Link>
          </Heading>
        </div>
      ))}
    </>
  );
};

const AnimalQuestPage: NextPage = () => {
  return (
    <>
      <Meta
        title="Animal Quest"
        description="Learn about different animals, their risks and what you can do to help them through the Animal Quest livestream series."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <div className="relative">
        <Image
          src={leafRightImage1}
          alt=""
          className="pointer-events-none absolute -bottom-24 right-0 z-10 hidden h-auto w-1/2 max-w-md select-none lg:block"
        />
        <Image
          src={leafLeftImage3}
          alt=""
          className="pointer-events-none absolute -bottom-40 left-0 z-10 hidden h-auto w-1/2 max-w-[16rem] select-none lg:block"
        />

        <Section dark className="py-24">
          <div className="w-full lg:w-3/5">
            <Heading>Animal Quest</Heading>
            <p className="text-lg">
              Learn about different animals, their risks and what you can do to
              help them through the Animal Quest livestream series. Each episode
              is hosted live by Maya with a focus on a specific animal.
            </p>
          </div>
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
