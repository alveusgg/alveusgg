import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Image from "next/image";
import { Fragment, type ReactNode, useMemo, useState } from "react";

import { getClassification } from "@alveusgg/data/build/ambassadors/classification";
import ambassadors, {
  type Ambassador,
  type AmbassadorKey,
} from "@alveusgg/data/build/ambassadors/core";
import { isActiveAmbassadorKey } from "@alveusgg/data/build/ambassadors/filters";
import {
  type AmbassadorImage,
  type AmbassadorImages,
  getAmbassadorBadgeImage,
  getAmbassadorEmoteImage,
  getAmbassadorIconImage,
  getAmbassadorImages,
  getAmbassadorMerchImage,
} from "@alveusgg/data/build/ambassadors/images";
import { getSpecies } from "@alveusgg/data/build/ambassadors/species";
import {
  type AnimalQuestWithRelation,
  getAmbassadorEpisodes,
} from "@alveusgg/data/build/animal-quest";
import enclosures from "@alveusgg/data/build/enclosures";
import { getIUCNStatus } from "@alveusgg/data/build/iucn";

import { classes } from "@/utils/classes";
import { formatPartialDateString } from "@/utils/datetime-partial";
import { typeSafeObjectKeys } from "@/utils/helpers";
import { convertToSlug } from "@/utils/slugs";
import { camelToKebab, kebabToCamel } from "@/utils/string-case";

import AnimalQuest from "@/components/content/AnimalQuest";
import Box from "@/components/content/Box";
import Carousel from "@/components/content/Carousel";
import Heading from "@/components/content/Heading";
import Lightbox from "@/components/content/Lightbox";
import Link from "@/components/content/Link";
import Meta from "@/components/content/Meta";
import PartialDateDiff from "@/components/content/PartialDateDiff";
import Section from "@/components/content/Section";
import { YouTubeEmbed, YouTubePreview } from "@/components/content/YouTube";

type Stat = {
  title: string;
  value: React.ReactNode;
};

type Stats = (Stat | Stat[])[];

const getStats = (ambassador: Ambassador): Stats => {
  const species = getSpecies(ambassador.species);
  const enclosure = enclosures[ambassador.enclosure];

  return [
    {
      title: "Species",
      value: (
        <>
          <p>{species.name}</p>
          <p className="text-base text-alveus-green-700 italic">
            {species.scientificName} (
            <Link
              href={`/ambassadors#classification:${convertToSlug(
                getClassification(species.class),
              )}`}
            >
              {getClassification(species.class)}
            </Link>
            )
          </p>
        </>
      ),
    },
    {
      title: "Conservation Status",
      value: (
        <p>
          {species.iucn.id ? (
            <Link
              href={`https://www.iucnredlist.org/species/${species.iucn.id}/${species.iucn.assessment}`}
              external
            >
              IUCN: {getIUCNStatus(species.iucn.status)}
            </Link>
          ) : (
            <>IUCN: {getIUCNStatus(species.iucn.status)}</>
          )}
        </p>
      ),
    },
    {
      title: "Native To",
      value: <p>{species.native.text}</p>,
    },
    {
      title: "Species Lifespan",
      value: (
        <div className="flex flex-col flex-nowrap gap-x-4 gap-y-2 md:flex-row md:items-center lg:flex-col lg:items-start xl:flex-row xl:items-center">
          <p>
            Wild:{" "}
            {species.lifespan.wild
              ? `${stringifyLifespan(species.lifespan.wild)} years`
              : "Unknown"}
          </p>
          <div className="hidden h-4 w-px bg-alveus-green opacity-75 md:block lg:hidden xl:block" />
          <p>
            Captivity:{" "}
            {species.lifespan.captivity
              ? `${stringifyLifespan(species.lifespan.captivity)} years`
              : "Unknown"}
          </p>
        </div>
      ),
    },
    [
      {
        title: `Date of ${
          { live: "Birth", egg: "Hatching", seed: "Planting" }[species.birth]
        }`,
        value: (
          <>
            <p>{formatPartialDateString(ambassador.birth)}</p>
            {ambassador.birth && (
              <p className="text-base text-alveus-green-700 italic">
                <PartialDateDiff date={ambassador.birth} suffix="old" />
              </p>
            )}
          </>
        ),
      },
      {
        title: "Sex",
        value: <p>{ambassador.sex || "Unknown"}</p>,
      },
      {
        title: "Arrived at Alveus",
        value: (
          <>
            <p>{formatPartialDateString(ambassador.arrival)}</p>
            {ambassador.arrival && (
              <p className="text-base text-alveus-green-700 italic">
                <PartialDateDiff date={ambassador.arrival} suffix="ago" />
              </p>
            )}
          </>
        ),
      },
      {
        title: "Enclosure",
        value: (
          <p>
            <Link
              href={`/ambassadors#enclosures:${camelToKebab(
                ambassador.enclosure,
              )}`}
            >
              {enclosure.name}
            </Link>
          </p>
        ),
      },
    ],
  ];
};

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: typeSafeObjectKeys(ambassadors)
      .filter(isActiveAmbassadorKey)
      .map((key) => ({
        params: { ambassadorName: camelToKebab(key) },
      })),
    fallback: false,
  };
};

type AmbassadorPageProps = {
  ambassador: Ambassador;
  ambassadorKey: AmbassadorKey;
  images: AmbassadorImages;
  merchImage?: AmbassadorImage;
  iconImage?: AmbassadorImage;
  animalQuest?: AnimalQuestWithRelation[];
};

export const getStaticProps: GetStaticProps<AmbassadorPageProps> = async (
  context,
) => {
  const ambassadorName = context.params?.ambassadorName;
  if (typeof ambassadorName !== "string") return { notFound: true };

  const ambassadorKey = kebabToCamel(ambassadorName);
  if (!isActiveAmbassadorKey(ambassadorKey)) return { notFound: true };

  const ambassador = ambassadors[ambassadorKey];
  return {
    props: {
      ambassador,
      ambassadorKey,
      images: getAmbassadorImages(ambassadorKey),
      merchImage: getAmbassadorMerchImage(ambassadorKey),
      iconImage:
        getAmbassadorIconImage(ambassadorKey) ??
        getAmbassadorBadgeImage(ambassadorKey) ??
        getAmbassadorEmoteImage(ambassadorKey),
      animalQuest: getAmbassadorEpisodes(ambassadorKey),
    },
  };
};

const stringifyLifespan = (value: number | { min: number; max: number }) => {
  return typeof value === "number" ? `${value}` : `${value.min}-${value.max}`;
};

const AmbassadorPage: NextPage<AmbassadorPageProps> = ({
  ambassador,
  ambassadorKey,
  images,
  merchImage,
  iconImage,
  animalQuest,
}) => {
  const stats = useMemo(() => getStats(ambassador), [ambassador]);

  const [carouselLightboxOpen, setCarouselLightboxOpen] = useState<string>();

  const carouselLightboxItems = useMemo(
    () =>
      images.reduce<Record<string, ReactNode>>(
        (acc, image) => ({
          ...acc,
          [image.src.src]: (
            <div className="flex h-full flex-col">
              <div
                className="mx-auto flex max-h-full max-w-full grow"
                style={{
                  aspectRatio: `${image.src.width} / ${image.src.height}`,
                }}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  quality={90}
                  className="my-auto h-auto max-h-full w-full rounded-xl bg-alveus-green-800 shadow-xl"
                  style={{
                    aspectRatio: `${image.src.width} / ${image.src.height}`,
                  }}
                  draggable={false}
                />
              </div>
            </div>
          ),
        }),
        {},
      ),
    [images],
  );

  const carouselItems = useMemo(
    () =>
      images.reduce<Record<string, ReactNode>>(
        (acc, image) => ({
          ...acc,
          [image.src.src]: (
            <Link
              href={image.src.src}
              external
              onClick={(e) => {
                e.preventDefault();
                setCarouselLightboxOpen(image.src.src);
              }}
              draggable={false}
              className="group/trigger"
              custom
            >
              <Image
                src={image.src}
                alt={image.alt}
                width={300}
                className="group/trigger-hover:scale-102 group/trigger-hover:shadow-xs aspect-square h-auto w-full rounded-xl object-cover transition"
                style={{ objectPosition: image.position }}
                draggable={false}
              />
            </Link>
          ),
        }),
        {},
      ),
    [images],
  );

  const [clipsLightboxOpen, setClipsLightboxOpen] = useState<string>();

  const clipsLightboxItems = useMemo(
    () =>
      ambassador.clips.reduce<Record<string, ReactNode>>(
        (acc, clip) => ({
          ...acc,
          [clip.id]: <YouTubeEmbed videoId={clip.id} caption={clip.caption} />,
        }),
        {},
      ),
    [ambassador.clips],
  );

  return (
    <>
      <Meta
        title={`${ambassador.name} | Ambassadors`}
        description={`${ambassador.name} is an Alveus Ambassador. ${ambassador.story} ${ambassador.mission}`}
        image={images[0].src.src}
        icon={iconImage?.src?.src}
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <div className="relative">
        <Section
          className="min-h-[85vh] pt-64 lg:pt-0"
          containerClassName="flex flex-wrap"
        >
          <div className="absolute inset-x-0 top-0 h-64 w-full lg:bottom-0 lg:h-full lg:w-1/2">
            <Image
              src={images[0].src}
              alt={images[0].alt}
              placeholder="blur"
              className="absolute inset-x-0 top-0 size-full object-cover lg:sticky lg:h-screen lg:max-h-full"
              style={{ objectPosition: images[0].position }}
            />
          </div>

          <div className="basis-full lg:basis-1/2" />

          <div className="flex basis-full flex-col py-4 lg:max-w-1/2 lg:basis-1/2 lg:px-8 lg:pt-8">
            <Heading className="text-5xl">{ambassador.name}</Heading>
            {!!ambassador.alternate.length && (
              <p className="-mt-1 mb-2 text-lg text-alveus-green-700 italic">
                also:{" "}
                <span className="text-xl">
                  {ambassador.alternate.join("; ")}
                </span>
              </p>
            )}

            <div className="my-2 text-xl">
              <p className="my-2">{ambassador.story}</p>
              <p className="my-2">{ambassador.mission}</p>
            </div>

            <dl className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-auto-2 lg:grid-cols-auto-2">
              {stats.map((item) => {
                const nested = Array.isArray(item);
                const items = nested ? item : [item];
                return (
                  <div
                    key={items.map((i) => i.title).join(",")}
                    className={classes(
                      "contents",
                      nested &&
                        "col-span-full grid-cols-auto-4 gap-4 md:grid lg:contents xl:grid",
                    )}
                  >
                    {items.map(({ title, value }, idx) => (
                      <Fragment key={title}>
                        <div
                          className={classes(
                            "col-span-full h-px bg-alveus-green opacity-10",
                            nested &&
                              idx % 2 !== 0 &&
                              "md:hidden lg:block xl:hidden",
                          )}
                        />
                        <dt className="self-center text-2xl font-bold">
                          {title}
                        </dt>
                        <dd className="self-center text-xl text-balance">
                          {value}
                        </dd>
                      </Fragment>
                    ))}
                  </div>
                );
              })}
            </dl>

            {ambassador.fact ? (
              <Box dark className="my-6 flex flex-col gap-2 p-4">
                <Heading
                  level={2}
                  id="did-you-know"
                  link
                  className="my-0 text-2xl"
                >
                  Did you know?
                </Heading>

                {ambassador.fact.split("\n\n").map((fact, idx) => (
                  <p key={idx} className="text-lg">
                    {fact}
                  </p>
                ))}

                {animalQuest?.map((aq) => (
                  <AnimalQuest
                    key={aq.episode}
                    episode={aq}
                    ambassador={ambassadorKey}
                    className="mt-2 hover:translate-y-1"
                  />
                ))}
              </Box>
            ) : (
              animalQuest?.map((aq) => (
                <AnimalQuest
                  key={aq.episode}
                  episode={aq}
                  ambassador={ambassadorKey}
                  className="my-6"
                />
              ))
            )}

            <Carousel
              items={carouselItems}
              auto={null}
              className="my-6"
              itemClassName="basis-1/2 md:basis-1/3 lg:basis-1/2 xl:basis-1/3 p-2 2xl:p-4"
            />

            <Lightbox
              open={carouselLightboxOpen}
              onClose={() => setCarouselLightboxOpen(undefined)}
              items={carouselLightboxItems}
            />

            {ambassador.plush &&
              merchImage &&
              ("link" in ambassador.plush ? (
                <Link
                  href={ambassador.plush.link}
                  className="group mx-auto my-6"
                  external
                  custom
                >
                  <Image
                    src={merchImage.src}
                    width={512}
                    alt={`${ambassador.name} Plush`}
                    className="h-auto w-full max-w-lg rounded-2xl bg-alveus-tan shadow-xl transition group-hover:scale-102 group-hover:shadow-2xl"
                  />
                </Link>
              ) : (
                <div className="group relative mx-auto my-6 cursor-pointer">
                  <Image
                    src={merchImage.src}
                    width={512}
                    alt={`${ambassador.name} Plush`}
                    className="h-auto w-full max-w-lg rounded-2xl bg-alveus-tan shadow-xl transition group-hover:scale-102 group-hover:shadow-2xl"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl bg-alveus-tan/75 font-bold text-alveus-green-800 opacity-0 transition group-hover:scale-102 group-hover:opacity-100 group-hover:backdrop-blur-xs">
                    <p className="text-3xl">Coming Soon</p>
                    <p className="text-2xl">{ambassador.plush.soon}</p>
                  </div>
                </div>
              ))}
          </div>
        </Section>
      </div>

      {ambassador.clips.length > 0 && (
        <Section dark className="bg-alveus-green-800">
          <Heading
            level={2}
            id="highlights"
            link
            className="text-center text-4xl"
          >
            {ambassador.name}
            &apos;s Highlights
          </Heading>

          <div className="flex flex-wrap">
            {ambassador.clips.map(({ id, caption }) => (
              <div
                key={id}
                className="mx-auto flex basis-full flex-col items-center justify-start py-8 md:px-8 lg:basis-1/2"
              >
                <Link
                  href={`https://www.youtube.com/watch?v=${id}`}
                  external
                  onClick={(e) => {
                    e.preventDefault();
                    setClipsLightboxOpen(id);
                  }}
                  className="group/trigger w-full max-w-2xl"
                  custom
                >
                  <YouTubePreview
                    videoId={id}
                    className="aspect-video h-auto w-full"
                  />
                </Link>

                <p className="mt-2 text-center text-xl">{caption}</p>
              </div>
            ))}
          </div>

          <Lightbox
            open={clipsLightboxOpen}
            onClose={() => setClipsLightboxOpen(undefined)}
            items={clipsLightboxItems}
          />
        </Section>
      )}
    </>
  );
};

export default AmbassadorPage;
