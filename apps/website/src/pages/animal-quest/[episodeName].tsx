import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Image from "next/image";
import React, { Fragment, useEffect, useState } from "react";

import animalQuest, {
  type AnimalQuestWithEpisode,
} from "@alveusgg/data/src/animal-quest";
import ambassadors from "@alveusgg/data/src/ambassadors/core";
import { isActiveAmbassadorKey } from "@alveusgg/data/src/ambassadors/filters";

import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";
import Consent from "@/components/Consent";

import { camelToKebab, sentenceToKebab } from "@/utils/string-case";
import { formatDateTime, formatSeconds } from "@/utils/datetime";
import { typeSafeObjectEntries } from "@/utils/helpers";

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

const getTwitchEmbed = (
  video: number,
  parent: string,
  start?: string
): string => {
  const url = new URL("https://player.twitch.tv");
  url.searchParams.set("video", video.toString());
  url.searchParams.set("parent", parent);
  url.searchParams.set("autoplay", "false");
  url.searchParams.set("muted", "false");
  url.searchParams.set("allowfullscreen", "true");
  url.searchParams.set("width", "100%");
  url.searchParams.set("height", "100%");
  if (start) url.searchParams.set("time", start);
  return url.toString();
};

type AnimalQuestEpisodePageProps = {
  episode: AnimalQuestWithEpisode;
  featured: {
    [key in AnimalQuestWithEpisode["ambassadors"][number]]: (typeof ambassadors)[key];
  };
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

  const featured = episode.ambassadors.reduce(
    (obj, ambassador) => ({
      ...obj,
      [ambassador]: ambassadors[ambassador],
    }),
    {}
  ) as AnimalQuestEpisodePageProps["featured"];

  return {
    props: {
      episode,
      featured,
    },
  };
};

const AnimalQuestEpisodePage: NextPage<AnimalQuestEpisodePageProps> = ({
  episode,
  featured,
}) => {
  const [twitchEmbed, setTwitchEmbed] = useState<string | null>(null);
  useEffect(() => {
    setTwitchEmbed(
      getTwitchEmbed(
        episode.video.id,
        window.location.hostname,
        episode.video.start
      )
    );
  }, []);

  return (
    <>
      <Meta
        title={`Episode ${episode.episode}: ${episode.edition} | Animal Quest`}
        description={episode.description}
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
            <p className="text-lg">{episode.description}</p>
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
                <p>
                  {typeSafeObjectEntries(featured).map(
                    ([key, ambassador], idx, arr) => (
                      <Fragment key={key}>
                        {/* Retired ambassadors don't have pages */}
                        {isActiveAmbassadorKey(key) ? (
                          <Link
                            href={`/ambassadors/${camelToKebab(key)}`}
                            custom
                            className="hover:underline"
                          >
                            {ambassador.name}
                          </Link>
                        ) : (
                          ambassador.name
                        )}
                        {idx < arr.length - 2 && ", "}
                        {idx === arr.length - 2 && arr.length > 2 && ","}
                        {idx === arr.length - 2 && " and "}
                      </Fragment>
                    )
                  )}
                </p>
              </div>

              <div className="w-full md:w-1/2">
                <Heading level={3} className="text-2xl">
                  Host:
                </Heading>
                <p>{episode.host}</p>
              </div>

              <div className="w-full md:w-1/2">
                <Heading level={3} className="text-2xl">
                  Length:
                </Heading>
                <p>
                  {formatSeconds(episode.length, {
                    style: "long",
                    seconds: false,
                  })}
                </p>
              </div>
            </div>

            <Link
              href="/animal-quest"
              className="text-md mt-6 inline-block rounded-full border-2 border-white px-4 py-2 transition-colors hover:border-alveus-tan hover:bg-alveus-tan hover:text-alveus-green"
              custom
            >
              Discover other episodes
            </Link>
          </div>
        </Section>

        {/* Grow the last section to cover the page */}
        <div className="relative flex flex-grow flex-col">
          <Section className="flex-grow">
            <Consent
              item="episode video"
              consent="twitch"
              className="aspect-video h-auto w-full rounded-2xl"
            >
              {twitchEmbed && (
                <iframe
                  src={twitchEmbed}
                  title="Twitch video"
                  referrerPolicy="no-referrer"
                  allow="autoplay; encrypted-media; fullscreen"
                  sandbox="allow-same-origin allow-scripts"
                  className="aspect-video h-auto w-full rounded-2xl"
                  tabIndex={-1}
                ></iframe>
              )}
            </Consent>
          </Section>
        </div>
      </div>
    </>
  );
};

export default AnimalQuestEpisodePage;
