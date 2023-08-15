import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Image from "next/image";
import React, { Fragment, useEffect, useMemo, useState } from "react";

import animalQuest, {
  hosts,
  type AnimalQuestWithEpisode,
} from "@alveusgg/data/src/animal-quest";
import ambassadors from "@alveusgg/data/src/ambassadors/core";
import { isActiveAmbassadorKey } from "@alveusgg/data/src/ambassadors/filters";
import { getAmbassadorImages } from "@alveusgg/data/src/ambassadors/images";

import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Carousel from "@/components/content/Carousel";
import Link from "@/components/content/Link";
import Consent from "@/components/Consent";
import { ambassadorImageHover } from "@/pages/ambassadors";

import { camelToKebab, sentenceToKebab } from "@/utils/string-case";
import { formatDateTime, formatSeconds } from "@/utils/datetime";
import { typeSafeObjectEntries } from "@/utils/helpers";

import animalQuestFull from "@/assets/animal-quest/full.png";

import leafLeftImage1 from "@/assets/floral/leaf-left-1.png";
import leafLeftImage2 from "@/assets/floral/leaf-left-2.png";
import leafLeftImage3 from "@/assets/floral/leaf-left-3.png";
import leafRightImage2 from "@/assets/floral/leaf-right-2.png";

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
    {},
  );

const getTwitchEmbed = (
  video: number,
  parent: string,
  {
    start,
    player,
    autoPlay = false,
  }: Partial<{ start: string; player: string; autoPlay: boolean }> = {},
): string => {
  const url = new URL("https://player.twitch.tv");
  url.searchParams.set("video", video.toString());
  url.searchParams.set("parent", parent);
  url.searchParams.set("autoplay", autoPlay.toString());
  url.searchParams.set("muted", "false");
  url.searchParams.set("allowfullscreen", "true");
  url.searchParams.set("width", "100%");
  url.searchParams.set("height", "100%");
  if (start) url.searchParams.set("time", start);
  if (player) url.searchParams.set("player", player);
  return url.toString();
};

const getPreziEmbed = (id: string): string => {
  const url = new URL(`https://prezi.com/p/embed/${encodeURIComponent(id)}`);
  url.searchParams.set("autoplay", "1");
  return url.toString();
};

type AnimalQuestEpisodePageProps = {
  episode: AnimalQuestWithEpisode;
  featured: {
    [key in (typeof animalQuest)[number]["ambassadors"]["featured"][number]]: (typeof ambassadors)[key];
  };
  related: {
    [key in (typeof animalQuest)[number]["ambassadors"]["related"][number]]: (typeof ambassadors)[key];
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

  const featured = episode.ambassadors.featured.reduce(
    (obj, ambassador) => ({
      ...obj,
      [ambassador]: ambassadors[ambassador],
    }),
    {},
  ) as AnimalQuestEpisodePageProps["featured"];

  const related = episode.ambassadors.related.reduce(
    (obj, ambassador) => ({
      ...obj,
      [ambassador]: ambassadors[ambassador],
    }),
    {},
  ) as AnimalQuestEpisodePageProps["related"];

  return {
    props: {
      episode,
      featured,
      related,
    },
  };
};

const AnimalQuestEpisodePage: NextPage<AnimalQuestEpisodePageProps> = ({
  episode,
  featured,
  related,
}) => {
  const [twitchEmbed, setTwitchEmbed] = useState<string | null>(null);
  useEffect(() => {
    setTwitchEmbed(
      getTwitchEmbed(episode.video.id, window.location.hostname, {
        start: episode.video.start,
      }),
    );
  }, [episode.video.id, episode.video.start]);

  const description = useMemo(
    () =>
      [
        episode.description,
        "Each episode of Animal Quest introduces you to an ambassador at Alveus and teaches you about them as well as their species as a whole. We'll look at their importance to the world around us, the risks and misconceptions their species faces, and what we can do to help them.",
      ].filter(Boolean),
    [episode.description],
  );

  const featuredAmbassadors = [
    ...typeSafeObjectEntries(featured).map(([key, ambassador]) => ({
      key,
      ambassador,
      relation: "featured",
    })),
    ...typeSafeObjectEntries(related).map(([key, ambassador]) => ({
      key,
      ambassador,
      relation: "related",
    })),
  ]
    .filter(({ key }) => isActiveAmbassadorKey(key))
    .reduce((obj, { key, ambassador, relation }) => {
      const images = getAmbassadorImages(key);
      return {
        ...obj,
        [key]: (
          <Link
            href={`/ambassadors/${camelToKebab(key)}`}
            draggable={false}
            className="group text-center transition-colors hover:text-alveus-green-900"
            custom
          >
            <Image
              src={images[0].src}
              alt={images[0].alt}
              draggable={false}
              width={430}
              className={`mx-auto aspect-square h-auto w-full max-w-2/3 rounded-2xl object-cover ${ambassadorImageHover}`}
              style={{ objectPosition: images[0].position }}
            />
            <Heading level={3} className="mb-0 mt-4 text-2xl">
              {ambassador.name}
            </Heading>
            <p
              title={
                relation === "featured"
                  ? "Featured in this episode"
                  : "Related to this episode"
              }
              className="text-sm font-bold uppercase text-alveus-green-900"
            >
              {relation}
            </p>
            <p className="mt-2">{ambassador.story}</p>
            <p className="mt-2">{ambassador.mission}</p>
          </Link>
        ),
      };
    }, {});

  const host = useMemo(() => {
    const data = hosts[episode.host];
    const link = data.link.replace(
      /^https?:\/\/(www.)?alveussanctuary.org/,
      "",
    );
    return {
      ...data,
      link,
      external: /^https?:\/\//.test(link),
    };
  }, [episode.host]);

  return (
    <>
      <Meta
        title={`Episode ${episode.episode}: ${episode.edition} | Animal Quest`}
        description={description.join("\n\n")}
        image={animalQuestFull.src}
      >
        {/* This metadata is more-or-less copied from the Twitch VOD page */}

        <meta
          key="twitter:player"
          property="twitter:player"
          content={getTwitchEmbed(episode.video.id, "meta.tag", {
            start: episode.video.start,
            player: "twitter",
            autoPlay: true,
          })}
        />
        <meta key="twitter:card" property="twitter:card" content="player" />
        <meta
          key="twitter:player:width"
          property="twitter:player:width"
          content="640"
        />
        <meta
          key="twitter:player:height"
          property="twitter:player:height"
          content="360"
        />

        <meta
          key="og:video"
          property="og:video"
          content={getTwitchEmbed(episode.video.id, "meta.tag", {
            start: episode.video.start,
            player: "facebook",
            autoPlay: true,
          })}
        />
        <meta
          key="og:video:secure_url"
          property="og:video:secure_url"
          content={getTwitchEmbed(episode.video.id, "meta.tag", {
            start: episode.video.start,
            player: "facebook",
            autoPlay: true,
          })}
        />
        <meta
          key="og:video:release_date"
          property="og:video:release_date"
          content={episode.broadcast.toISOString()}
        />
        <meta key="og:type" property="og:type" content="video.other" />
        <meta
          key="og:video:type"
          property="og:video:type"
          content="text/html"
        />
        <meta key="og:video:width" property="og:video:width" content="620" />
        <meta key="og:video:height" property="og:video:height" content="378" />
      </Meta>

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <div className="relative">
        <Image
          src={leafLeftImage1}
          alt=""
          className="pointer-events-none absolute -bottom-32 right-0 z-10 hidden h-auto w-1/2 max-w-[10rem] -scale-x-100 select-none lg:block"
        />

        <Section
          dark
          className="py-0"
          containerClassName="flex flex-wrap items-center justify-between"
        >
          <div className="flex w-full flex-col gap-4 pb-16 pt-4 md:w-3/5 md:py-24">
            <Heading className="flex flex-col">
              <span className="text-lg">
                Animal Quest Episode {episode.episode}:{" "}
              </span>
              <span>{episode.edition}</span>
            </Heading>
            {description.map((paragraph) => (
              <p key={paragraph} className="text-lg">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="w-full pb-16 pt-4 md:w-2/5 md:py-24 md:pl-8">
            <div className="flex w-full flex-wrap">
              <h2 className="sr-only">Episode Information</h2>

              <div className="w-full min-[430px]:w-1/2 md:w-full lg:w-1/2">
                <Heading level={3} className="text-2xl">
                  Broadcast:
                </Heading>
                <p>{formatDateTime(episode.broadcast, { style: "long" })}</p>
              </div>

              <div className="w-full min-[430px]:w-1/2 md:w-full lg:w-1/2">
                <Heading level={3} className="text-2xl">
                  Featuring:
                </Heading>
                <p>
                  {typeSafeObjectEntries(featured).map(
                    ([key, ambassador], idx, arr) => (
                      <Fragment key={key}>
                        {/* Retired ambassadors don't have pages */}
                        {isActiveAmbassadorKey(key) ? (
                          <Link href={`/ambassadors/${camelToKebab(key)}`} dark>
                            {ambassador.name}
                          </Link>
                        ) : (
                          ambassador.name
                        )}
                        {idx < arr.length - 2 && ", "}
                        {idx === arr.length - 2 && arr.length > 2 && ","}
                        {idx === arr.length - 2 && " and "}
                      </Fragment>
                    ),
                  )}
                </p>
              </div>

              <div className="w-full min-[430px]:w-1/2 md:w-full lg:w-1/2">
                <Heading level={3} className="text-2xl">
                  Host:
                </Heading>
                <p>
                  <Link href={host.link} external={host.external} dark>
                    {host.name}
                  </Link>
                </p>
              </div>

              <div className="w-full min-[430px]:w-1/2 md:w-full lg:w-1/2">
                <Heading level={3} className="text-2xl">
                  Length:
                </Heading>
                <p title="Video length may appear longer due to intro/outro screen segments">
                  {formatSeconds(episode.length, {
                    style: "long",
                    seconds: false,
                  })}
                </p>
              </div>
            </div>

            <Link
              href="/animal-quest"
              className="text-md mt-8 inline-block rounded-full border-2 border-white px-4 py-2 transition-colors hover:border-alveus-tan hover:bg-alveus-tan hover:text-alveus-green"
              custom
            >
              Discover more episodes
            </Link>
          </div>
        </Section>
      </div>

      <div className="relative">
        <Image
          src={leafLeftImage2}
          alt=""
          className="pointer-events-none absolute -bottom-22 left-0 z-10 hidden h-auto w-1/2 max-w-[12rem] select-none lg:block"
        />

        <Section>
          <h2 className="sr-only" id="video">
            Video
          </h2>

          <Consent
            item="episode video"
            consent="twitch"
            className="aspect-video h-auto w-full rounded-2xl bg-alveus-green text-alveus-tan"
          >
            {twitchEmbed && (
              <iframe
                src={twitchEmbed}
                title="Twitch video"
                referrerPolicy="no-referrer"
                allow="autoplay; encrypted-media; fullscreen"
                sandbox="allow-same-origin allow-scripts"
                className="aspect-video h-auto w-full rounded-2xl"
              ></iframe>
            )}
          </Consent>
        </Section>
      </div>

      <Section dark>
        {Object.keys(featuredAmbassadors).length > 0 && (
          <>
            <Heading level={2} className="mb-8 mt-0" id="ambassadors" link>
              Meet the ambassadors
            </Heading>
            <Carousel
              items={featuredAmbassadors}
              auto={10000}
              className="mb-16 mt-4"
              itemClassName="basis-full sm:basis-1/2 md:basis-full lg:basis-1/2 xl:basis-1/3 p-4"
            />
          </>
        )}

        <div className="flex flex-row flex-wrap items-center justify-evenly gap-4">
          <p className="text-xl">
            Learn about more of our ambassadors and their species in other
            episodes of Animal Quest.
          </p>

          <Link
            href="/animal-quest"
            className="text-md inline-block rounded-full border-2 border-white px-4 py-2 transition-colors hover:border-alveus-tan hover:bg-alveus-tan hover:text-alveus-green"
            custom
          >
            Discover more episodes
          </Link>
        </div>
      </Section>

      {/* Grow the last section to cover the page */}
      <div className="relative flex flex-grow flex-col">
        <Image
          src={leafLeftImage3}
          alt=""
          className="pointer-events-none absolute -top-16 right-0 z-10 hidden h-auto w-1/2 max-w-[12rem] -scale-x-100 select-none lg:block"
        />
        <Image
          src={leafRightImage2}
          alt=""
          className="pointer-events-none absolute -bottom-56 left-0 z-10 hidden h-auto w-1/2 max-w-[10rem] -scale-x-100 select-none lg:block"
        />

        <Section className="flex-grow">
          <Heading level={2} className="mb-8 mt-0" id="presentation" link>
            Presentation
          </Heading>
          <Consent
            item="episode presentation"
            consent="prezi"
            className="aspect-video h-auto w-full rounded-2xl bg-alveus-green text-alveus-tan"
          >
            <iframe
              src={getPreziEmbed(episode.prezi)}
              title="Prezi presentation"
              referrerPolicy="no-referrer"
              allow="autoplay; fullscreen"
              sandbox="allow-same-origin allow-scripts"
              className="aspect-video h-auto w-full rounded-2xl"
            ></iframe>
          </Consent>
        </Section>
      </div>
    </>
  );
};

export default AnimalQuestEpisodePage;
