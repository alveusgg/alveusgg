import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { Fragment, useMemo } from "react";
import type { Episode } from "schema-dts";
import { Stream } from "@cloudflare/stream-react";

import animalQuest, {
  hosts,
  type AnimalQuestWithEpisode,
} from "@alveusgg/data/build/animal-quest";
import ambassadors from "@alveusgg/data/build/ambassadors/core";
import { isActiveAmbassadorKey } from "@alveusgg/data/build/ambassadors/filters";
import {
  getAmbassadorBadgeImage,
  getAmbassadorEmoteImage,
  getAmbassadorIconImage,
  getAmbassadorImages,
  type AmbassadorImage,
} from "@alveusgg/data/build/ambassadors/images";

import { env } from "@/env";

import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Button from "@/components/content/Button";
import Carousel from "@/components/content/Carousel";
import Link from "@/components/content/Link";
import Box from "@/components/content/Box";
import JsonLD from "@/components/content/JsonLD";
import Consent from "@/components/Consent";

import { ambassadorImageHover } from "@/pages/ambassadors";

import { camelToKebab, sentenceToKebab } from "@/utils/string-case";
import { formatDateTime, formatSeconds } from "@/utils/datetime";
import { typeSafeObjectEntries, typeSafeObjectKeys } from "@/utils/helpers";
import { createImageUrl } from "@/utils/image";
import { mapFirst } from "@/utils/array";

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

const posterUrl =
  env.NEXT_PUBLIC_BASE_URL +
  createImageUrl({ src: animalQuestFull.src, width: 1200 });

const getCloudflareEmbed = (
  customer: string,
  video: string,
  {
    start,
    autoPlay = true,
    muted = false,
    poster,
    title,
    link,
  }: Partial<{
    start: string | number;
    autoPlay: boolean;
    muted: boolean;
    poster: string;
    title?: string;
    link?: string;
  }> = {},
): string => {
  const url = new URL(
    `https://customer-${customer}.cloudflarestream.com/${video}/iframe`,
  );
  url.searchParams.set("autoplay", autoPlay.toString());
  url.searchParams.set("muted", muted.toString());
  if (start) url.searchParams.set("startTime", start.toString());
  if (poster) url.searchParams.set("poster", poster);
  if (title) url.searchParams.set("title", title);
  if (link) {
    url.searchParams.set("channel-link", link);
    url.searchParams.set("share-link", link);
  }
  return url.toString();
};

const getCloudflareVideo = (customer: string, video: string): string =>
  `https://customer-${customer}.cloudflarestream.com/${video}/downloads/default.mp4`;

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
  icon?: AmbassadorImage;
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

  const featuredKeys = typeSafeObjectKeys(featured);
  const icon =
    mapFirst(featuredKeys, getAmbassadorIconImage) ??
    mapFirst(featuredKeys, getAmbassadorBadgeImage) ??
    mapFirst(featuredKeys, getAmbassadorEmoteImage);

  return {
    props: {
      episode,
      featured,
      related,
      icon,
    },
  };
};

const AnimalQuestEpisodePage: NextPage<AnimalQuestEpisodePageProps> = ({
  episode,
  featured,
  related,
  icon,
}) => {
  const router = useRouter();

  const start = useMemo(() => {
    const queryString = Array.isArray(router.query.t)
      ? router.query.t[0]
      : router.query.t;
    return stringToSeconds(queryString || "") ?? 0;
  }, [router.query.t]);

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
            <Heading level={3} className="mt-4 mb-0 text-2xl">
              {ambassador.name}
            </Heading>
            <p
              title={
                relation === "featured"
                  ? "Featured in this episode"
                  : "Related to this episode"
              }
              className="text-sm font-bold text-alveus-green-900 uppercase"
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
        icon={icon?.src?.src}
      >
        <meta
          key="twitter:player"
          property="twitter:player"
          content={getCloudflareVideo(episode.video.cu, episode.video.id)}
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
          content={getCloudflareVideo(episode.video.cu, episode.video.id)}
        />
        <meta
          key="og:video:secure_url"
          property="og:video:secure_url"
          content={getCloudflareVideo(episode.video.cu, episode.video.id)}
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
          content="video/mp4"
        />
        <meta key="og:video:width" property="og:video:width" content="640" />
        <meta key="og:video:height" property="og:video:height" content="360" />

        <meta
          key="canonical"
          property="canonical"
          content={`${env.NEXT_PUBLIC_BASE_URL}/animal-quest/${sentenceToKebab(
            episode.edition,
          )}`}
        />
        <meta
          key="og:url"
          property="og:url"
          content={`${env.NEXT_PUBLIC_BASE_URL}/animal-quest/${sentenceToKebab(
            episode.edition,
          )}`}
        />
      </Meta>

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <div className="relative">
        <Image
          src={leafLeftImage1}
          alt=""
          className="pointer-events-none absolute right-0 -bottom-32 z-10 hidden h-auto w-1/2 max-w-40 -scale-x-100 drop-shadow-md select-none lg:block"
        />

        <Section dark className="pt-4">
          <Heading className="mb-6 text-3xl">
            <span className="text-2xl">
              Animal Quest Episode {episode.episode}:
            </span>{" "}
            {episode.edition}
          </Heading>

          <Box className="z-0 p-0" ringClassName="lg:ring-8" dark>
            <Image
              src={animalQuestFull}
              alt=""
              className="absolute inset-0 -z-10 h-full w-full object-cover"
              width={1200}
            />
            <Stream
              src={episode.video.id}
              customerCode={episode.video.cu}
              poster={posterUrl}
              autoplay
              preload
              controls
              muted={false}
              currentTime={start}
              letterboxColor="transparent"
              height="100%"
              width="100%"
              className="my-auto aspect-video h-auto w-full bg-transparent"
            />
          </Box>

          <div className="mt-4 flex flex-wrap items-center justify-between lg:flex-nowrap">
            <div className="flex flex-wrap items-start gap-x-8 gap-y-2 py-4">
              <h2 className="sr-only">Episode Information</h2>

              <div>
                <Heading level={3} className="my-0 text-lg">
                  Broadcast:
                </Heading>
                <p className="text-xl">
                  {formatDateTime(episode.broadcast, { style: "long" })}
                </p>
              </div>

              <div>
                <Heading level={3} className="my-0 text-lg">
                  Featuring:
                </Heading>
                <p className="text-xl">
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

              <div>
                <Heading level={3} className="my-0 text-lg">
                  Host:
                </Heading>
                <p className="text-xl">
                  <Link href={host.link} external={host.external} dark>
                    {host.name}
                  </Link>
                </p>
              </div>

              <div>
                <Heading level={3} className="my-0 text-lg">
                  Length:
                </Heading>
                <p className="text-xl">
                  {formatSeconds(episode.length, {
                    style: "long",
                    seconds: false,
                  })}
                </p>
              </div>
            </div>

            <Button href="/animal-quest" dark>
              Discover more episodes
            </Button>
          </div>

          <div className="mt-4 w-full space-y-4">
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
          className="pointer-events-none absolute -bottom-22 left-0 z-10 hidden h-auto w-1/2 max-w-48 drop-shadow-md select-none lg:block"
        />

        <Section>
          {Object.keys(featuredAmbassadors).length > 0 && (
            <>
              <Heading level={2} className="mt-0 mb-8" id="ambassadors" link>
                Meet the Ambassadors
              </Heading>
              <Carousel
                items={featuredAmbassadors}
                auto={10000}
                className="mt-4 mb-16"
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
      <div className="relative flex grow flex-col">
        <Image
          src={leafLeftImage3}
          alt=""
          className="pointer-events-none absolute -top-16 right-0 z-10 hidden h-auto w-1/2 max-w-48 -scale-x-100 drop-shadow-md select-none lg:block"
        />
        <Image
          src={leafRightImage2}
          alt=""
          className="pointer-events-none absolute -bottom-56 left-0 z-10 hidden h-auto w-1/2 max-w-40 -scale-x-100 drop-shadow-md select-none lg:block"
        />

        <Section className="grow">
          <Heading level={2} className="mt-0 mb-8" id="presentation" link>
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
            ></iframe>
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
            thumbnailUrl: posterUrl,
            uploadDate: episode.broadcast.toISOString(),
            duration: secondsToIso8601(episode.length),
            embedUrl: getCloudflareEmbed(episode.video.cu, episode.video.id, {
              start,
              poster: posterUrl,
              title: `Animal Quest Episode ${episode.episode}: ${episode.edition}`,
              link: `${env.NEXT_PUBLIC_BASE_URL}/animal-quest/${sentenceToKebab(
                episode.edition,
              )}`,
            }),
            contentUrl: getCloudflareVideo(episode.video.cu, episode.video.id),
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
