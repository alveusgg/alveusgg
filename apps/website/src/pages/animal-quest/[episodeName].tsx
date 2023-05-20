import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import React from "react";

import animalQuest, {
  type AnimalQuestWithEpisode,
} from "@alveusgg/data/src/animal-quest";

import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";

import { sentenceToKebab } from "@/utils/string-case";
import { formatDateTime } from "@/utils/datetime";

import animalQuestFull from "@/assets/animal-quest/full.png";

import leafLeftImage3 from "@/assets/floral/leaf-left-3.png";

const episodes: Record<string, AnimalQuestWithEpisode> = animalQuest
  .map((episode, idx) => ({
    ...episode,
    episode: idx + 1,
  }))
  .reduce(
    (obj, episode) => ({
      ...obj,
      [sentenceToKebab(episode.edition)]: episode,
    }),
    {}
  );

type AnimalQuestEpisodePageProps = {
  episode: AnimalQuestWithEpisode;
};

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: Object.keys(episodes).map((key) => ({
      params: { episodeName: key },
    })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<
  AnimalQuestEpisodePageProps
> = async (context) => {
  const episodeName = context.params?.episodeName;
  if (typeof episodeName !== "string") return { notFound: true };

  const episode = episodes[episodeName];
  if (!episode) return { notFound: true };

  // TODO: Get the ambassador data and images for the episode

  return {
    props: {
      episode,
    },
  };
};

const AnimalQuestEpisodePage: NextPage<AnimalQuestEpisodePageProps> = ({
  episode,
}) => {
  return (
    <>
      <Meta
        title={`Episode ${episode.episode}: ${episode.edition} | Animal Quest`}
        description={``}
        image={animalQuestFull.src}
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <div className="relative">
        <Image
          src={leafLeftImage3}
          alt=""
          className="pointer-events-none absolute -bottom-20 left-0 z-10 hidden h-auto w-1/2 max-w-[12rem] select-none lg:block"
        />

        <Section
          dark
          className="py-0"
          containerClassName="flex flex-wrap-reverse items-center justify-between"
        >
          <div className="w-full pb-16 pt-4 md:w-3/5 md:py-24">
            <Heading>
              <span className="block text-lg">
                Animal Quest Episode {episode.episode}:{" "}
              </span>
              <span className="block">{episode.edition}</span>
            </Heading>
            <p className="text-lg"></p>
          </div>

          <div className="w-full pb-16 pt-4 md:w-2/5 md:py-24">
            <div className="flex w-full flex-wrap">
              <h2 className="sr-only">Episode Information</h2>

              <div className="w-full md:w-1/2">
                <Heading level={3} className="text-2xl">
                  Broadcast:
                </Heading>
                <p>{formatDateTime(episode.broadcast, { style: "long" })}</p>
              </div>

              <div className="w-full md:w-1/2">
                <Heading level={3} className="text-2xl">
                  Featuring:
                </Heading>
                <p>TODO</p>
              </div>

              <div className="w-full md:w-1/2">
                <Heading level={3} className="text-2xl">
                  Host:
                </Heading>
                <p>Maya Higa</p>
              </div>

              <div className="w-full md:w-1/2">
                <Heading level={3} className="text-2xl">
                  Length:
                </Heading>
                <p>TODO</p>
              </div>
            </div>

            <Link
              href="/animal-quest"
              className="text-md mt-6 inline-block rounded-full border-2 border-white px-4 py-2 transition-colors hover:border-alveus-tan hover:bg-alveus-tan hover:text-alveus-green"
            >
              Discover other episodes
            </Link>
          </div>
        </Section>
      </div>
    </>
  );
};

export default AnimalQuestEpisodePage;
