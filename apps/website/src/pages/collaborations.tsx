import { type NextPage } from "next"
import Head from "next/head"
import Image from "next/image"
import Link from "next/link"
import React from "react"

import Section from "../components/content/Section"
import Heading from "../components/content/Heading"

import leafRightImage1 from "../assets/floral/leaf-right-1.png"
import leafRightImage2 from "../assets/floral/leaf-right-2.png"
import leafLeftImage3 from "../assets/floral/leaf-left-3.png"
import leafLeftImage1 from "../assets/floral/leaf-left-1.png"

const collaborations = {
  alinity: {
    name: "Alinity",
    date: "9th February 2023",
    video: "https://www.youtube.com/watch?v=qJpZzDMotmc",
    vod: "https://www.youtube.com/watch?v=XHTEs94Cf4s&list=PLtQafKoimfLd6dM9CQqiLm79khNgxsoN3",
  },
  connorEatsPants: {
    name: "ConnorEatsPants",
    date: "25th January 2023",
    video: "https://www.youtube.com/watch?v=SMEyEfVlzlM",
  },
  botezSisters: {
    name: "The Botez Sisters",
    date: "30th August 2022",
    video: "https://www.youtube.com/watch?v=QgvNy11kU6E",
  },
  knut: {
    name: "Knut",
    date: "9th August 2022",
    video: "https://www.youtube.com/watch?v=lFhFx6kf2E4",
  },
  moistCr1tikal: {
    name: "MoistCr1TiKaL",
    date: "30th April 2022",
    video: "https://www.youtube.com/watch?v=pb7MR59s1Z0",
    vod: "https://www.youtube.com/watch?v=x-OPvwjGHEU&list=PLtQafKoimfLd6dM9CQqiLm79khNgxsoN3",
  },
  jackManifold: {
    name: "Jack Manifold",
    date: "22nd April 2022",
    video: "https://www.youtube.com/watch?v=jzyxhnODe2g",
  },
};

const parseYouTubeUrl = (url: string) => {
  const match = url.match(/^https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)$/);
  if (!match) throw new Error(`Invalid YouTube URL: ${url}`);
  return match[1];
};

type CollaborationsSectionProps = {
  items: Record<string, Optional<{ name: string, date: string, video: string, vod: string }, 'vod'>>,
};

const CollaborationsSection: React.FC<CollaborationsSectionProps> = ({ items }) => {
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
            src={`https://www.youtube-nocookie.com/embed/${parseYouTubeUrl(value.video)}?modestbranding=1`}
            title="YouTube video player"
            frameBorder="0"
            allow="encrypted-media"
            allowFullScreen
            className="mx-auto w-full max-w-2xl aspect-video rounded-2xl shadow-xl"
          />

          {value.vod && (
            <Link
              href={value.vod}
              target="_blank"
              rel="noreferrer"
              className="mt-2 text-alveus-green-600 hover:underline"
            >
              (Full stream VoD)
            </Link>
          )}
        </div>
      ))}
    </>
  );
};

const CollaborationsPage: NextPage = () => {
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
        <Image
          src={leafLeftImage3}
          alt=""
          className="hidden lg:block absolute z-10 -bottom-40 left-0 w-1/2 h-auto max-w-[16rem] select-none pointer-events-none"
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
          className="hidden lg:block absolute z-10 -bottom-48 right-0 w-1/2 h-auto max-w-[12rem] select-none pointer-events-none"
        />

        <Section className="flex-grow" containerClassName="flex flex-wrap">
          <CollaborationsSection items={collaborations} />
        </Section>
      </div>
    </>
  );
};

export default CollaborationsPage;
