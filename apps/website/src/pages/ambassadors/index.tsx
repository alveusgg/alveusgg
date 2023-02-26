import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import React from "react";

import ambassadors from "@/config/ambassadors";
import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import { camelToKebab } from "@/utils/string-case";

import leafRightImage1 from "@/assets/floral/leaf-right-1.png";
import leafLeftImage1 from "@/assets/floral/leaf-left-1.png";
import leafRightImage2 from "@/assets/floral/leaf-right-2.png";
import leafLeftImage2 from "@/assets/floral/leaf-left-2.png";

const AmbassadorsPage: NextPage = () => {
  return (
    <>
      <Meta
        title="Ambassadors"
        description="Alveus Ambassadors are animals whose role includes handling and/or training by staff or volunteers for interaction with the public and in support of institutional education and conservation goals."
      />

      <Head>
        <meta name="robots" content="noindex" />
      </Head>

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <div className="relative">
        <Image
          src={leafRightImage1}
          alt=""
          className="pointer-events-none absolute -bottom-24 right-0 z-10 hidden h-auto w-1/2 max-w-md select-none lg:block"
        />
        <Image
          src={leafLeftImage1}
          alt=""
          className="pointer-events-none absolute -bottom-48 left-0 z-10 hidden h-auto w-1/2 max-w-[12rem] select-none lg:block"
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
          className="pointer-events-none absolute -bottom-80 right-0 z-10 hidden h-auto w-1/2 max-w-[16rem] select-none lg:block"
        />
        <Image
          src={leafLeftImage2}
          alt=""
          className="pointer-events-none absolute -bottom-24 left-0 z-10 hidden h-auto w-1/2 max-w-[12rem] select-none lg:block"
        />

        <Section className="flex-grow pt-0" containerClassName="flex flex-wrap">
          <p className="mt-8 mb-4 basis-full text-center text-xl font-semibold">
            Click each ambassador for information and highlights!
          </p>

          {Object.entries(ambassadors).map(
            ([key, { name, species, images }]) => (
              <div
                key={key}
                className="basis-full py-4 md:basis-1/2 md:px-4 lg:basis-1/4"
              >
                <Link
                  href={`/ambassadors/${camelToKebab(key)}`}
                  className="group"
                >
                  <Image
                    src={images[0].src}
                    alt={images[0].alt}
                    placeholder="blur"
                    width={700}
                    className="aspect-4/3 h-auto w-full rounded-xl object-cover transition-filter group-hover:brightness-105 group-hover:contrast-115 group-hover:saturate-110"
                  />
                  <Heading
                    level={2}
                    className="mt-2 mb-0 text-center transition-colors group-hover:text-alveus-green-700"
                  >
                    {name}
                  </Heading>
                  <p className="text-center text-xl text-alveus-green-700 transition-colors group-hover:text-alveus-green-400">
                    {species}
                  </p>
                </Link>
              </div>
            )
          )}
        </Section>
      </div>
    </>
  );
};

export default AmbassadorsPage;
