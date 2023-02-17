import { type NextPage } from "next"
import Head from "next/head"
import Link from "next/link"
import Image from "next/image"
import React, { useMemo } from "react"

import Section from "../components/content/Section"
import Heading from "../components/content/Heading"

import leafRightImage1 from "../assets/floral/leaf-right-1.png"
import leafRightImage2 from "../assets/floral/leaf-right-2.png"
import leafLeftImage3 from "../assets/floral/leaf-left-3.png"
import leafLeftImage1 from "../assets/floral/leaf-left-1.png"

export const collaborations = {
  alinity: {
    name: "Alinity",
    date: "9th February 2023",
    youtube: "https://www.youtube.com/watch?v=qJpZzDMotmc",
  },
  connorEatsPants: {
    name: "ConnorEatsPants",
    date: "25th January 2023",
    youtube: "https://www.youtube.com/watch?v=SMEyEfVlzlM", // TODO: This is an Alveus Highlights video
  },
  botezSisters: {
    name: "The Botez Sisters",
    date: "30th August 2022",
    youtube: "https://www.youtube.com/watch?v=GqjlZSn-n40", // TODO: This is a Maya Daily video
  },
  knut: {
    name: "Knut",
    date: "9th August 2022",
    youtube: "https://www.youtube.com/watch?v=-Qn6m6SxAME", // TODO: This is a Maya Daily video
  },
  moistCr1tikal: {
    name: "MoistCr1TiKaL",
    date: "30th April 2022",
    youtube: "https://www.youtube.com/watch?v=pb7MR59s1Z0",
  },
  jackManifold: {
    name: "Jack Manifold",
    date: "22nd April 2022",
    youtube: "https://www.youtube.com/watch?v=jzyxhnODe2g",
  },
};

const parseYouTubeUrl = (url: string) => {
  const match = url.match(/^https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)$/);
  if (!match) throw new Error(`Invalid YouTube URL: ${url}`);
  return match[1];
};

type CollaborationsSectionProps = {
  items: Record<string, { name: string, date: string, youtube: string }>,
};

export const CollaborationsSection: NextPage<CollaborationsSectionProps> = ({ items }) => {
  return (
    <>
      {Object.entries(items).map(([ key, value ]) => (
        <div key={key} className="mx-auto basis-full md:basis-1/2 py-8 md:px-8 flex flex-col items-center">
          <Heading level={3} className="flex flex-wrap gap-x-8 gap-y-2 items-end justify-center">
            {value.name}
            <small className="text-xl text-alveus-green-600">
              {value.date}
            </small>
          </Heading>

          <iframe
            src={`https://www.youtube-nocookie.com/embed/${parseYouTubeUrl(value.youtube)}`}
            title="YouTube video player"
            frameBorder="0"
            allow="encrypted-media"
            allowFullScreen
            className="mx-auto w-full max-w-2xl aspect-video rounded-2xl shadow-xl"
          />
        </div>
      ))}
    </>
  );
};

const CollaborationsPage: NextPage = () => {
  const highlight = useMemo(() => Object.fromEntries(Object.entries(collaborations).slice(0, 1)), []);
  const rest = useMemo(() => Object.fromEntries(Object.entries(collaborations).slice(1)), []);

  return (
    <>
      <Head>
        <title>Collaborations | Alveus.gg</title>
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

        <Section dark className="py-24">
          <div className="w-full lg:w-3/5">
            <Heading>Our Collaborations</Heading>
            <p className="text-lg">
              We work with other content creators to educate our combined audiences, introducing them to the educational
              ambassadors at Alveus and their conservation missions.
            </p>
          </div>
        </Section>
      </div>

      <div className="relative">
        <Image
          src={leafLeftImage3}
          alt=""
          className="hidden lg:block absolute z-10 -bottom-24 left-0 w-1/2 h-auto max-w-[16rem] select-none pointer-events-none"
        />

        <Section containerClassName="flex flex-wrap">
          <CollaborationsSection items={highlight} />
        </Section>
      </div>

      <Section dark containerClassName="flex flex-wrap items-center">
        <div className="basis-full md:basis-2/3 py-4 md:px-4 flex flex-col gap-4">
          <Heading level={2}>What is Alveus?</Heading>
          <p className="text-lg">
            Alveus is a non profit organization founded by Maya Higa that functions as an exotic animal sanctuary and as
            a virtual education center facility to provide permanent homes to non-releasable exotic animals. These
            animals function as ambassadors so viewers can watch their journeys, get to know the animals and gain an
            appreciation for their species.
          </p>
        </div>

        <div className="basis-full md:basis-1/3 py-4 md:px-4 flex flex-col items-center">
          <Link
            href="/about/alveus"
            className="text-xl px-6 py-4 rounded-full border-2 border-alveus-tan hover:bg-alveus-tan hover:text-alveus-green transition-colors"
          >
            About Alveus Sanctuary
          </Link>
        </div>
      </Section>

      {/* Grow the last section to cover the page */}
      <div className="flex flex-col flex-grow relative">
        <Image
          src={leafLeftImage1}
          alt=""
          className="hidden lg:block absolute z-10 -bottom-24 left-0 w-1/2 h-auto max-w-[12rem] select-none pointer-events-none"
        />
        <Image
          src={leafRightImage2}
          alt=""
          className="hidden lg:block absolute z-10 -top-24 right-0 w-1/2 h-auto max-w-[12rem] select-none pointer-events-none"
        />


        <Section className="flex-grow" containerClassName="flex flex-wrap">
          <CollaborationsSection items={rest} />
        </Section>
      </div>
    </>
  );
};

export default CollaborationsPage;
