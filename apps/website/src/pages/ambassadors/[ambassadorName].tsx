import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import React, { useEffect, useId, useMemo } from "react";

import ambassadors, {
  type Ambassador,
  iucnFlags,
  iucnStatuses,
} from "@/config/ambassadors";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Carousel from "@/components/content/Carousel";
import Meta from "@/components/content/Meta";
import { Lightbox, Preview } from "@/components/content/YouTube";

import { camelToKebab, kebabToCamel } from "@/utils/string-case";
import { getDefaultPhotoswipeLightboxOptions } from "@/utils/photoswipe";

const parseIucnStatus = (rawStatus: string): string => {
  const [status, flag] = rawStatus.split("/");

  if (
    !Object.prototype.hasOwnProperty.call(iucnStatuses, status as PropertyKey)
  )
    throw new Error(`Invalid IUCN status: ${status}`);
  if (!flag) return iucnStatuses[status as keyof typeof iucnStatuses];

  if (!Object.prototype.hasOwnProperty.call(iucnFlags, flag as PropertyKey))
    throw new Error(`Invalid IUCN flag: ${flag}`);
  return `${iucnStatuses[status as keyof typeof iucnStatuses]} ${
    iucnFlags[flag as keyof typeof iucnFlags]
  }`;
};

const parseDate = (date: string | null): string => {
  if (!date) return "Unknown";

  const [year, month, day] = date.split("-");
  const parsed = new Date(
    Number(year),
    Number(month || 1) - 1,
    Number(day || 1)
  );

  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: month ? "long" : undefined,
    day: day ? "numeric" : undefined,
  });
};

type AmbassadorPageProps = {
  ambassador: Ambassador;
};

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: Object.keys(ambassadors).map((slug) => ({
      params: { ambassadorName: camelToKebab(slug) },
    })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<AmbassadorPageProps> = async (
  context
) => {
  const ambassadorName = context.params?.ambassadorName;
  if (typeof ambassadorName !== "string") return { notFound: true };

  const ambassador = ambassadors[kebabToCamel(ambassadorName)];
  if (!ambassador) return { notFound: true };

  return {
    props: {
      ambassador,
    },
  };
};

const AmbassadorPage: NextPage<AmbassadorPageProps> = ({ ambassador }) => {
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
      ambassador.images.reduce((obj, { src, alt }) => {
        const srcObj =
          typeof src === "object"
            ? "default" in src
              ? src.default
              : src
            : null;
        const srcLink = srcObj ? srcObj.src : (src as string);
        return {
          ...obj,
          [srcLink]: (
            <a
              href={srcLink}
              target="_blank"
              rel="noreferrer"
              draggable={false}
              data-pswp-width={srcObj ? srcObj.width : undefined}
              data-pswp-height={srcObj ? srcObj.height : undefined}
            >
              <Image
                src={src}
                alt={alt}
                draggable={false}
                width={300}
                className="aspect-square h-auto w-full rounded-xl object-cover"
              />
            </a>
          ),
        };
      }, {}),
    [ambassador]
  );

  return (
    <>
      <Meta
        title={`${ambassador.name} | Ambassadors`}
        description={`${ambassador.name} is an Alveus Ambassador. ${ambassador.story} ${ambassador.mission}`}
        image={
          typeof ambassador.images[0].src === "string"
            ? ambassador.images[0].src
            : "default" in ambassador.images[0].src
            ? ambassador.images[0].src.default.src
            : ambassador.images[0].src.src
        }
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
              src={ambassador.images[0].src}
              alt={ambassador.images[0].alt}
              placeholder="blur"
              className="absolute inset-x-0 top-0 h-full w-full object-cover md:sticky md:h-screen md:max-h-full"
            />
          </div>

          <div className="basis-full md:basis-1/2" />

          <div className="flex basis-full flex-col py-4 md:max-w-1/2 md:basis-1/2 md:p-8">
            <Heading className="text-5xl">{ambassador.name}</Heading>

            <div className="my-2 text-xl">
              <p className="my-2">{ambassador.story}</p>
              <p className="my-2">{ambassador.mission}</p>
            </div>

            <div className="flex flex-wrap">
              <div className="basis-full py-2 lg:basis-1/2 lg:px-2">
                <Heading level={2}>IUCN Status:</Heading>

                <div className="ml-4">
                  <p className="text-xl">{parseIucnStatus(ambassador.iucn)}</p>
                </div>
              </div>

              <div className="basis-full py-2 lg:basis-1/2 lg:px-2">
                <Heading level={2}>Species:</Heading>

                <div className="ml-4">
                  <p className="text-xl">{ambassador.species}</p>
                  <p className="text-xl italic text-alveus-green-700">
                    {ambassador.scientific}
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
                  <p className="text-xl">{parseDate(ambassador.birth)}</p>
                </div>
              </div>

              <div className="basis-full py-2 lg:basis-1/2 lg:px-2">
                <Heading level={2}>Arrived at Alveus:</Heading>

                <div className="ml-4">
                  <p className="text-xl">{parseDate(ambassador.arrival)}</p>
                </div>
              </div>
            </div>

            <div className="pswp-gallery mt-8" id={photoswipe}>
              <Carousel
                items={carousel}
                auto={null}
                itemClassName="basis-1/2 md:basis-full lg:basis-1/2 xl:basis-1/3 p-2 2xl:p-4"
              />
            </div>

            {ambassador.plush && "link" in ambassador.plush && (
              <Link
                href={ambassador.plush.link}
                target="_blank"
                rel="noreferrer"
                className="group mx-auto mt-12 -mb-8"
              >
                <Image
                  src={ambassador.plush.image}
                  width={512}
                  alt={`${ambassador.name} Plush`}
                  className="h-auto w-full max-w-lg rounded-2xl shadow-xl transition-shadow transition-transform group-hover:scale-105 group-hover:shadow-2xl"
                />
              </Link>
            )}
          </div>
        </Section>
      </div>

      {ambassador.clips.length > 0 && (
        <Section dark>
          <Heading level={2} className="text-center text-4xl">
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
