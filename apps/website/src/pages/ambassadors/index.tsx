import { type NextPage } from "next"
import Head from "next/head"
import Image from "next/image"
import Link from "next/link"
import React from "react"

import ambassadors from "../../config/ambassadors"
import Section from "../../components/content/Section"
import Heading from "../../components/content/Heading"
import { camelToKebab } from "../../utils/string-case"

import leafRightImage1 from "../../assets/floral/leaf-right-1.png"
import leafLeftImage1 from "../../assets/floral/leaf-left-1.png"
import leafRightImage2 from "../../assets/floral/leaf-right-2.png"
import leafLeftImage2 from "../../assets/floral/leaf-left-2.png"

const AmbassadorsPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Ambassadors | Alveus.gg</title>
        <meta name="robots" content="noindex" />
      </Head>

      {/* Nav background */}
      <div className="hidden lg:block bg-alveus-green-900 h-40 -mt-40" />

      <div className="relative">
        <Image
          src={leafRightImage1}
          alt=""
          className="hidden lg:block absolute z-10 -bottom-24 right-0 w-1/2 h-auto max-w-md select-none pointer-events-none"
        />
        <Image
          src={leafLeftImage1}
          alt=""
          className="hidden lg:block absolute z-10 -bottom-48 left-0 w-1/2 h-auto max-w-[12rem] select-none pointer-events-none"
        />

        <Section dark className="py-24">
          <div className="w-full lg:w-3/5">
            <Heading>Alveus Ambassadors</Heading>
            <p className="text-lg">
              Association of Zoo and Aquariums (AZA) defines an Ambassador Animal as “an animal whose role includes
              handling and/or training by staff or volunteers for interaction with the public and in support of
              institutional education and conservation goals”.
            </p>
          </div>
        </Section>
      </div>

      {/* Grow the last section to cover the page */}
      <div className="flex flex-col flex-grow relative">
        <Image
          src={leafRightImage2}
          alt=""
          className="hidden lg:block absolute z-10 -bottom-80 right-0 w-1/2 h-auto max-w-[16rem] select-none pointer-events-none"
        />
        <Image
          src={leafLeftImage2}
          alt=""
          className="hidden lg:block absolute z-10 -bottom-24 left-0 w-1/2 h-auto max-w-[12rem] select-none pointer-events-none"
        />

        <Section className="flex-grow pt-0" containerClassName="flex flex-wrap">
          <p className="mt-8 mb-4 basis-full text-center text-xl font-semibold">
            Click each ambassador for information and highlights!
          </p>

          {Object.entries(ambassadors).map(([ key, { name, species, images } ]) => (
            <div
              key={key}
              className="basis-full md:basis-1/2 lg:basis-1/4 py-4 md:px-4"
            >
              <Link
                href={`/ambassadors/${camelToKebab(key)}`}
                className="group"
              >
                <Image
                  src={images[0].src}
                  alt={images[0].alt}
                  className="w-full h-auto aspect-4/3 object-cover rounded-xl group-hover:saturate-110 group-hover:brightness-105 group-hover:contrast-115 transition-filter"
                />
                <Heading
                  level={2}
                  className="text-center mt-2 mb-0 group-hover:text-alveus-green-700 transition-colors"
                >
                  {name}
                </Heading>
                <p
                  className="text-center text-xl text-alveus-green-700 group-hover:text-alveus-green-400 transition-colors"
                >
                  {species}
                </p>
              </Link>
            </div>
          ))}
        </Section>
      </div>
    </>
  );
};

export default AmbassadorsPage;
