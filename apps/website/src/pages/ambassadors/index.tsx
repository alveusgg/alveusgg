import { type NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import React, { useMemo } from "react";

import ambassadors, {
  type AmbassadorKey,
} from "@alveusgg/data/src/ambassadors/core";
import { getAmbassadorImages } from "@alveusgg/data/src/ambassadors/images";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import { camelToKebab } from "@/utils/string-case";
import { typeSafeObjectKeys } from "@/utils/helpers";

import leafRightImage1 from "@/assets/floral/leaf-right-1.png";
import leafLeftImage1 from "@/assets/floral/leaf-left-1.png";
import leafRightImage2 from "@/assets/floral/leaf-right-2.png";
import leafLeftImage2 from "@/assets/floral/leaf-left-2.png";

const AmbassadorItem: React.FC<{ ambassador: AmbassadorKey }> = ({
  ambassador,
}) => {
  const data = useMemo(() => ambassadors[ambassador], [ambassador]);
  const images = useMemo(() => getAmbassadorImages(ambassador), [ambassador]);

  return (
    <div className="basis-full py-4 md:basis-1/2 md:px-4 lg:basis-1/4">
      <Link href={`/ambassadors/${camelToKebab(ambassador)}`} className="group">
        <Image
          src={images[0].src}
          alt={images[0].alt}
          placeholder="blur"
          width={700}
          className="aspect-4/3 h-auto w-full rounded-xl object-cover transition-filter group-hover:brightness-105 group-hover:contrast-115 group-hover:saturate-110"
        />
        <Heading
          level={2}
          className="mb-0 mt-2 text-center transition-colors group-hover:text-alveus-green-700"
        >
          {data.name}
        </Heading>
        <p className="text-center text-xl text-alveus-green-700 transition-colors group-hover:text-alveus-green-400">
          {data.species}
        </p>
      </Link>
    </div>
  );
};

const AmbassadorsPage: NextPage = () => {
  return (
    <>
      <Meta
        title="Ambassadors"
        description="Alveus Ambassadors are animals whose role includes handling and/or training by staff or volunteers for interaction with the public and in support of institutional education and conservation goals."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <div className="relative">
        <Image
          src={leafRightImage1}
          alt=""
          className="pointer-events-none absolute -top-8 right-0 z-10 hidden h-auto w-1/2 max-w-sm select-none lg:block"
        />
        <Image
          src={leafLeftImage1}
          alt=""
          className="pointer-events-none absolute -bottom-32 -left-8 z-10 hidden h-auto w-1/2 max-w-[10rem] -rotate-45 select-none lg:block"
        />

        <Section dark className="py-24">
          <div className="w-full lg:w-3/5">
            <Heading>Alveus Ambassadors</Heading>
            <p className="text-lg">
              Association of Zoo and Aquariums (AZA) defines an Ambassador
              Animal as “an animal whose role includes handling and/or training
              by staff or volunteers for interaction with the public and in
              support of institutional education and conservation goals”.
            </p>
          </div>
        </Section>
      </div>

      {/* Grow the last section to cover the page */}
      <div className="relative flex flex-grow flex-col">
        <Image
          src={leafRightImage2}
          alt=""
          className="pointer-events-none absolute -bottom-60 right-0 z-10 hidden h-auto w-1/2 max-w-[10rem] select-none lg:block 2xl:-bottom-64 2xl:max-w-[12rem]"
        />
        <Image
          src={leafLeftImage2}
          alt=""
          className="pointer-events-none absolute -bottom-24 left-0 z-10 hidden h-auto w-1/2 max-w-[12rem] select-none lg:block"
        />

        <Section className="flex-grow pt-0" containerClassName="flex flex-wrap">
          <p className="mb-4 mt-8 basis-full text-center text-xl font-semibold">
            Click each ambassador for information and highlights!
          </p>

          {typeSafeObjectKeys(ambassadors).map((key) => (
            <AmbassadorItem key={key} ambassador={key} />
          ))}
        </Section>
      </div>
    </>
  );
};

export default AmbassadorsPage;
