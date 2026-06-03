import Image from "next/image";
import type { FC, ReactNode } from "react";

import { getAmbassadorImages } from "@alveusgg/data/build/ambassadors/images";

import { camelToKebab } from "@/utils/string-case";

import Button from "@/components/content/Button";
import Carousel from "@/components/content/Carousel";
import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";
import Section from "@/components/content/Section";

import { ambassadorImageHover } from "@/pages/ambassadors";

import type { AmbassadorsCarouselData } from "./types";

type AmbassadorKey = Parameters<typeof getAmbassadorImages>[0];

export const AmbassadorsCarousel: FC<{ data: AmbassadorsCarouselData }> = ({
  data,
}) => {
  const items: Record<string, ReactNode> = {};
  for (const ambassador of data.featured) {
    const images = getAmbassadorImages(ambassador.key as AmbassadorKey);
    const image = images?.[0];
    if (!image) continue;

    items[ambassador.key] = (
      <Link
        href={`/ambassadors/${camelToKebab(ambassador.key)}`}
        draggable={false}
        custom
        className="group hover:text-alveus-green"
      >
        <Image
          src={image.src}
          alt={image.alt}
          draggable={false}
          width={200}
          className={`mx-auto aspect-square h-auto w-full max-w-40 rounded-xl object-cover ${ambassadorImageHover}`}
          style={{ objectPosition: image.position }}
        />
        <Heading level={3} className="text-center text-xl transition-colors">
          {ambassador.title}
        </Heading>
        <p className="text-center transition-colors">{ambassador.description}</p>
      </Link>
    );
  }

  return (
    <Section>
      <div className="flex flex-wrap items-center gap-y-8">
        <div className="max-w-full basis-full md:max-w-1/2 md:basis-1/2 xl:max-w-2/3 xl:basis-2/3">
          <div className="flex flex-wrap items-center justify-between">
            <Heading level={2} id="ambassadors" link>
              {data.heading}
            </Heading>
            <Link
              href={data.seeAllHref}
              custom
              className="group relative inline-block text-lg text-alveus-green-900 uppercase transition-colors hover:text-alveus-green"
            >
              See All
              <span className="absolute inset-x-0 bottom-0 block h-0.5 max-w-0 bg-alveus-green transition-all group-hover:max-w-full" />
            </Link>
          </div>

          <Carousel
            items={items}
            auto={10000}
            className="mt-4"
            itemClassName="basis-full sm:basis-1/2 md:basis-full lg:basis-1/2 xl:basis-1/3 p-4"
          />
        </div>

        <div className="basis-full md:basis-1/2 md:px-16 xl:basis-1/3">
          <Heading level={3}>{data.support.heading}</Heading>
          <p className="my-4">{data.support.body}</p>
          <Button href={data.support.cta.href}>{data.support.cta.label}</Button>
        </div>
      </div>
    </Section>
  );
};
