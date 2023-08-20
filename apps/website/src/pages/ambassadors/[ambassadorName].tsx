import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Image from "next/image";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import React, { useEffect, useId, useMemo } from "react";

import ambassadors, {
  type Ambassador,
} from "@alveusgg/data/src/ambassadors/core";
import { isActiveAmbassadorKey } from "@alveusgg/data/src/ambassadors/filters";
import {
  getAmbassadorImages,
  getAmbassadorMerchImage,
  type AmbassadorImage,
  type AmbassadorImages,
} from "@alveusgg/data/src/ambassadors/images";
import {
  getAmbassadorEpisode,
  type AnimalQuestWithRelation,
} from "@alveusgg/data/src/animal-quest";
import enclosures, { type Enclosure } from "@alveusgg/data/src/enclosures";
import { getIUCNStatus } from "@alveusgg/data/src/iucn";
import { getClassification } from "@alveusgg/data/src/ambassadors/classification";

import animalQuestImage from "@/assets/animal-quest/full.png";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Carousel from "@/components/content/Carousel";
import Meta from "@/components/content/Meta";
import Link from "@/components/content/Link";
import { Lightbox, Preview } from "@/components/content/YouTube";
import IconYouTube from "@/icons/IconYouTube";

import {
  camelToKebab,
  kebabToCamel,
  sentenceToKebab,
} from "@/utils/string-case";
import { getDefaultPhotoswipeLightboxOptions } from "@/utils/photoswipe";
import { typeSafeObjectKeys } from "@/utils/helpers";
import { convertToSlug } from "@/utils/slugs";
import { formatPartialDateString } from "@/utils/datetime";

type AmbassadorPageProps = {
  ambassador: Ambassador;
  enclosure: Enclosure;
  images: AmbassadorImages;
  merchImage?: AmbassadorImage;
  animalQuest?: AnimalQuestWithRelation;
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
      enclosure: enclosures[ambassador.enclosure],
      images: getAmbassadorImages(ambassadorKey),
      merchImage: getAmbassadorMerchImage(ambassadorKey),
      animalQuest: getAmbassadorEpisode(ambassadorKey), // featured + related
    },
  };
};

const AmbassadorPage: NextPage<AmbassadorPageProps> = ({
  ambassador,
  enclosure,
  images,
  merchImage,
  animalQuest,
}) => {
  const photoswipe = `photoswipe-${useId().replace(/\W/g, "")}`;
  useEffect(() => {
    const lightbox = new PhotoSwipeLightbox({
      ...getDefaultPhotoswipeLightboxOptions(),
      gallery: `#${photoswipe}`,
      children: "a",
      loop: true,
    });
    lightbox.init();

    return () => {
      lightbox.destroy();
    };
  }, [photoswipe]);

  const carousel = useMemo(
    () =>
      images.reduce((obj, { src, alt, position }) => {
        return {
          ...obj,
          [src.src]: (
            <a
              href={src.src}
              target="_blank"
              rel="noreferrer"
              draggable={false}
              data-pswp-width={src.width}
              data-pswp-height={src.height}
            >
              <Image
                src={src}
                alt={alt}
                draggable={false}
                width={300}
                className="aspect-square h-auto w-full rounded-xl object-cover"
                style={{ objectPosition: position }}
              />
            </a>
          ),
        };
      }, {}),
    [images],
  );

  return (
    <>
      <Meta
        title={`${ambassador.name} | Ambassadors`}
        description={`${ambassador.name} is an Alveus Ambassador. ${ambassador.story} ${ambassador.mission}`}
        image={images[0].src.src}
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <div className="relative">
        <Section
          className="min-h-[85vh] pt-64 md:pt-0"
          containerClassName="flex flex-wrap"
        >
          <div className="absolute inset-x-0 top-0 h-64 w-full md:bottom-0 md:h-full md:w-1/2">
            <Image
              src={images[0].src}
              alt={images[0].alt}
              placeholder="blur"
              className="absolute inset-x-0 top-0 h-full w-full object-cover md:sticky md:h-screen md:max-h-full"
              style={{ objectPosition: images[0].position }}
            />
          </div>

          <div className="basis-full md:basis-1/2" />

          <div className="flex basis-full flex-col py-4 md:max-w-1/2 md:basis-1/2 md:px-8 md:pt-8">
            <Heading className="text-5xl">{ambassador.name}</Heading>
            {!!ambassador.alternate.length && (
              <p className="-mt-1 mb-2 text-lg italic text-alveus-green-700">
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

            <div className="mb-4 flex flex-wrap">
              <div className="basis-full py-2 lg:basis-1/2 lg:px-2">
                <Heading level={2}>Species:</Heading>

                <div className="ml-4">
                  <p className="text-xl">{ambassador.species}</p>
                  <p className="text-xl italic text-alveus-green-700">
                    {ambassador.scientific} (
                    <Link
                      href={`/ambassadors#classification:${convertToSlug(
                        getClassification(ambassador.class),
                      )}`}
                    >
                      {getClassification(ambassador.class)}
                    </Link>
                    )
                  </p>
                </div>
              </div>

              <div className="basis-full py-2 lg:basis-1/2 lg:px-2">
                <Heading level={2}>Conservation Status:</Heading>

                <div className="ml-4">
                  <p className="text-xl">
                    {ambassador.iucn.id ? (
                      <Link
                        href={`https://apiv3.iucnredlist.org/api/v3/taxonredirect/${ambassador.iucn.id}`}
                        external
                      >
                        IUCN: {getIUCNStatus(ambassador.iucn.status)}
                      </Link>
                    ) : (
                      <>IUCN: {getIUCNStatus(ambassador.iucn.status)}</>
                    )}
                  </p>
                </div>
              </div>

              <div className="basis-full py-2 lg:basis-1/2 lg:px-2">
                <Heading level={2}>Sex:</Heading>

                <div className="ml-4">
                  <p className="text-xl">{ambassador.sex || "Unknown"}</p>
                </div>
              </div>

              <div className="basis-full py-2 lg:basis-1/2 lg:px-2">
                <Heading level={2}>Date of Birth:</Heading>

                <div className="ml-4">
                  <p className="text-xl">
                    {formatPartialDateString(ambassador.birth)}
                  </p>
                </div>
              </div>

              <div className="basis-full py-2 lg:basis-1/2 lg:px-2">
                <Heading level={2}>Arrived at Alveus:</Heading>

                <div className="ml-4">
                  <p className="text-xl">
                    {formatPartialDateString(ambassador.arrival)}
                  </p>
                </div>
              </div>

              <div className="basis-full py-2 lg:basis-1/2 lg:px-2">
                <Heading level={2}>Enclosure:</Heading>

                <div className="ml-4">
                  <p className="text-xl">
                    <Link
                      href={`/ambassadors#enclosures:${camelToKebab(
                        ambassador.enclosure,
                      )}`}
                    >
                      {enclosure.name}
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {animalQuest && (
              <Link
                href={`/animal-quest/${sentenceToKebab(animalQuest.edition)}`}
                className="group relative z-0 my-6 flex flex-wrap items-center justify-between gap-8 rounded-2xl bg-alveus-tan px-6 py-4 shadow-xl transition hover:scale-102 hover:shadow-2xl sm:flex-nowrap md:flex-wrap xl:flex-nowrap"
                custom
              >
                <Image
                  src={animalQuestImage}
                  alt=""
                  width={688}
                  className="absolute inset-0 -z-10 h-full w-full rounded-2xl bg-alveus-tan object-cover opacity-10"
                />

                <div>
                  <Heading
                    level={2}
                    className="transition-colors group-hover:text-alveus-green-800"
                  >
                    Learn more{" "}
                    {animalQuest.relation === "featured" &&
                      `about ${ambassador.name} `}
                    on{" "}
                    <span className="min-[320px]:whitespace-nowrap">
                      Animal Quest
                    </span>
                  </Heading>
                  <p className="text-xl text-alveus-green-800">
                    Animal Quest Ep. {animalQuest.episode}:{" "}
                    {animalQuest.edition}
                  </p>
                </div>

                <IconYouTube
                  size={48}
                  className="shrink-0 transition-colors group-hover:text-alveus-green-600"
                />
              </Link>
            )}

            <div className="pswp-gallery my-6" id={photoswipe}>
              <Carousel
                items={carousel}
                auto={null}
                itemClassName="basis-1/2 md:basis-full lg:basis-1/2 xl:basis-1/3 p-2 2xl:p-4"
              />
            </div>

            {ambassador.plush && "link" in ambassador.plush && merchImage && (
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
            )}
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

          <Lightbox id="highlights" className="flex flex-wrap">
            {({ Trigger }) => (
              <>
                {ambassador.clips.map(({ id, caption }) => (
                  <div
                    key={id}
                    className="mx-auto flex basis-full flex-col items-center justify-start py-8 md:px-8 lg:basis-1/2"
                  >
                    <Trigger
                      videoId={id}
                      caption={caption}
                      className="w-full max-w-2xl"
                    >
                      <Preview videoId={id} />
                    </Trigger>

                    <p className="mt-2 text-center text-xl">{caption}</p>
                  </div>
                ))}
              </>
            )}
          </Lightbox>
        </Section>
      )}
    </>
  );
};

export default AmbassadorPage;
