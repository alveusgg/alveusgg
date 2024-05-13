import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { Fragment, useMemo } from "react";
import type { Episode } from "schema-dts";

import ambassadors from "@alveusgg/data/src/ambassadors/core";
import { isActiveAmbassadorKey } from "@alveusgg/data/src/ambassadors/filters";
import { getAmbassadorImages } from "@alveusgg/data/src/ambassadors/images";
import animalQuest, {
  hosts,
  type AnimalQuestWithEpisode,
} from "@alveusgg/data/src/animal-quest";

import { env } from "@/env";

import Consent from "@/components/Consent";
import Button from "@/components/content/Button";
import Carousel from "@/components/content/Carousel";
import Heading from "@/components/content/Heading";
import JsonLD from "@/components/content/JsonLD";
import Link from "@/components/content/Link";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import { TwitchEmbed } from "@/components/content/TwitchEmbed";

import { ambassadorImageHover } from "@/pages/ambassadors";

import { formatDateTime, formatSeconds } from "@/utils/datetime";
import { typeSafeObjectEntries } from "@/utils/helpers";
import { createImageUrl } from "@/utils/image";
import { camelToKebab, sentenceToKebab } from "@/utils/string-case";

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
    autoPlay = true,
    muted = false,
  }: Partial<{
    start: string;
    player: string;
    autoPlay: boolean;
    muted: boolean;
  }> = {},
): string => {
  const url = new URL("https://player.twitch.tv");
  url.searchParams.set("video", video.toString());
  url.searchParams.set("parent", parent);
  url.searchParams.set("autoplay", autoPlay.toString());
  url.searchParams.set("muted", muted.toString());
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

const stringToSeconds = (time: string): number | undefined => {
  // Attempt to parse as 00h00m00s, or 00:00:00
  const match =
    time.match(/^(?:(?:(\d+)h)?(\d+)m)?(\d+)s$/) ??
    time.match(/^(?:(?:(\d+):)?(\d+):)?(\d+)$/);
  if (match) {
    const [, hours, minutes, seconds] = match;
    return (
      Number(hours ?? 0) * 3600 + Number(minutes ?? 0) * 60 + Number(seconds)
    );
  }
};

const secondsToString = (seconds: number): string => {
  const h = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const m = (Math.floor(seconds / 60) % 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${h}h${m}m${s}s`;
};

const secondsToIso8601 = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor(seconds / 60) % 60;
  const s = seconds % 60;
  return `PT${h}H${m}M${s}S`;
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

export const getStaticProps: GetStaticProps<AnimalQuestEpisodePageProps> =
  async (context) => {
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
  const router = useRouter();

  const start = useMemo(() => {
    const defaultSeconds = stringToSeconds(episode.video.start || "") ?? 0;
    const queryString = Array.isArray(router.query.t)
      ? router.query.t[0]
      : router.query.t;
    const querySeconds = stringToSeconds(queryString || "") ?? 0;
    return secondsToString(Math.max(defaultSeconds, querySeconds));
  }, [episode.video.start, router.query.t]);

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
            className="group text-center transition-colors hover:text-alveus-green"
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
          })}
        />
        <meta
          key="og:video:secure_url"
          property="og:video:secure_url"
          content={getTwitchEmbed(episode.video.id, "meta.tag", {
            start: episode.video.start,
            player: "facebook",
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

        <Section dark>
          <div className="flex flex-wrap lg:flex-nowrap">
            <div className="flex w-full flex-shrink-0 flex-col items-start justify-between py-4 lg:max-w-md lg:pl-8">
              <Heading className="flex flex-col">
                <span className="text-lg">
                  Animal Quest Episode {episode.episode}:{" "}
                </span>
                <span>{episode.edition}</span>
              </Heading>

              <div className="flex w-full flex-wrap">
                <h2 className="sr-only">Episode Information</h2>

                <div className="w-full sm:w-1/2">
                  <Heading level={3} className="text-2xl">
                    Broadcast:
                  </Heading>
                  <p>{formatDateTime(episode.broadcast, { style: "long" })}</p>
                </div>

                <div className="w-full sm:w-1/2">
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
                              dark
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
                      ),
                    )}
                  </p>
                </div>

                <div className="w-full sm:w-1/2">
                  <Heading level={3} className="text-2xl">
                    Host:
                  </Heading>
                  <p>
                    <Link href={host.link} external={host.external} dark>
                      {host.name}
                    </Link>
                  </p>
                </div>

                <div className="w-full sm:w-1/2">
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

              <Button href="/animal-quest" className="mt-8" dark>
                Discover more episodes
              </Button>
            </div>

            {/* Move the video to the left/top of the flex container with order-first */}
            {/* Do this in CSS so the episode title is first in the DOM for screen-readers etc. */}
            <div className="order-first flex w-full flex-grow flex-col gap-4 lg:w-auto">
              <h2 className="sr-only" id="video">
                Video
              </h2>

              <Consent
                item="episode video"
                consent="twitch"
                indexable
                thumbnail={animalQuestFull}
                className="my-auto aspect-video h-auto w-full overflow-hidden rounded-2xl bg-alveus-green text-alveus-tan"
              >
                <TwitchEmbed
                  video={episode.video.id.toString()}
                  time={start}
                  className="aspect-video h-auto w-full"
                />
              </Consent>
            </div>
          </div>

          <div className="mt-8 w-full space-y-4">
            {description.map((paragraph) => (
              <p key={paragraph} className="text-lg">
                {paragraph}
              </p>
            ))}
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
          {Object.keys(featuredAmbassadors).length > 0 && (
            <>
              <Heading level={2} className="mb-8 mt-0" id="ambassadors" link>
                Meet the Ambassadors
              </Heading>
              <Carousel
                items={featuredAmbassadors}
                auto={10000}
                className="mb-16 mt-4"
                itemClassName="basis-full sm:basis-1/2 md:basis-full lg:basis-1/2 xl:basis-1/3 p-4"
              />
            </>
          )}
        </Section>
      </div>

      <Section dark>
        <div className="flex flex-row flex-wrap items-center justify-evenly gap-4">
          <p className="text-xl">
            Learn about more of our ambassadors and their species in other
            episodes of Animal Quest.
          </p>

          <Button href="/animal-quest" dark>
            Discover more episodes
          </Button>
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
            Episode Presentation
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
            />
          </Consent>
        </Section>
      </div>

      <JsonLD<Episode>
        data={{
          "@context": "https://schema.org",
          "@type": "Episode",
          name: `Animal Quest Episode ${episode.episode}: ${episode.edition}`,
          description: description.join("\n\n"),
          url: `${env.NEXT_PUBLIC_BASE_URL}/animal-quest/${sentenceToKebab(
            episode.edition,
          )}`,
          episodeNumber: episode.episode,
          video: {
            "@type": "VideoObject",
            name: `Animal Quest Episode ${episode.episode}: ${episode.edition}`,
            description: description.join("\n\n"),
            url: `${env.NEXT_PUBLIC_BASE_URL}/animal-quest/${sentenceToKebab(
              episode.edition,
            )}`,
            thumbnailUrl:
              env.NEXT_PUBLIC_BASE_URL +
              createImageUrl({ src: animalQuestFull.src, width: 1200 }),
            uploadDate: episode.broadcast.toISOString(),
            duration: secondsToIso8601(episode.length),
            // Copying the Twitch VOD page behaviour, as with the meta data
            // Twitch set their embedUrl to be their WWW page, not the player
            embedUrl: `${
              env.NEXT_PUBLIC_BASE_URL
            }/animal-quest/${sentenceToKebab(episode.edition)}`,
          },
          partOfSeries: {
            "@type": "CreativeWorkSeries",
            name: "Animal Quest",
            description:
              "Learn about the ambassadors at Alveus through Animal Quest, a series hosted by Maya Higa. Each episode introduces you to a new ambassador and their species' importance to the environment, the risks they face, and what you can do to help them.",
            url: `${env.NEXT_PUBLIC_BASE_URL}/animal-quest`,
          },
        }}
      />
    </>
  );
};

export default AnimalQuestEpisodePage;
