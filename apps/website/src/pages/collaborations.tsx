import { type NextPage } from "next";
import Image from "next/image";
import React from "react";

import { formatDateTime } from "@/utils/datetime";
import { camelToKebab } from "@/utils/string-case";
import { classes } from "@/utils/classes";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Link from "@/components/content/Link";
import { Lightbox, Preview } from "@/components/content/YouTube";

import leafRightImage1 from "@/assets/floral/leaf-right-1.png";
import leafRightImage2 from "@/assets/floral/leaf-right-2.png";
import leafLeftImage3 from "@/assets/floral/leaf-left-3.png";
import leafLeftImage1 from "@/assets/floral/leaf-left-1.png";

type Collaboration = {
  name: string;
  link: string;
  date: Date;
  videoId: string;
  vodId?: string;
};

type Collaborations = Record<string, Collaboration>;

const collaborations = {
  extraEmily: {
    name: "ExtraEmily",
    link: "https://www.twitch.tv/extraemily",
    date: new Date("2023-06-22"),
    videoId: "qbxV8xgA7Vg",
  },
  zoil: {
    name: "Zoil",
    link: "https://www.twitch.tv/zoil",
    date: new Date("2023-06-13"),
    videoId: "n4KpVaUmrSE",
  },
  peachJars: {
    name: "PeachJars and Jessica Nigri",
    link: "https://www.twitch.tv/peachjars",
    date: new Date("2023-05-21"),
    videoId: "KF4HIypXiyc",
  },
  squeex: {
    name: "Squeex",
    link: "https://www.twitch.tv/squeex",
    date: new Date("2023-05-19"),
    videoId: "oUJxCDGQDlY",
    vodId: "dCV8b8LcG-0",
  },
  caroline: {
    name: "Caroline Kwan",
    link: "https://www.twitch.tv/carolinekwan",
    date: new Date("2023-05-09"),
    videoId: "4MmCFJadSg8",
  },
  lacari: {
    name: "Lacari",
    link: "https://www.twitch.tv/lacari",
    date: new Date("2023-05-02"),
    videoId: "mVOypbE5YNs",
  },
  dailyDose: {
    name: "Daily Dose",
    link: "https://www.youtube.com/@DailyDoseOfInternet",
    date: new Date("2023-04-25"),
    videoId: "j8GxD4adNyk",
  },
  graycen: {
    name: "Graycen",
    link: "https://www.twitch.tv/graycen",
    date: new Date("2023-04-18"),
    videoId: "M3WBnThqRkg",
  },
  dareon: {
    name: "Dareon",
    link: "https://www.twitch.tv/dareon",
    date: new Date("2023-04-11"),
    videoId: "RCzMJs9uDSI",
  },
  yungJeff: {
    name: "YungJeff",
    link: "https://twitter.com/YUNGJEFF",
    date: new Date("2023-04-04"),
    videoId: "BXOEWQZ8C_Y",
  },
  pointCrow: {
    name: "PointCrow",
    link: "https://www.twitch.tv/pointcrow",
    date: new Date("2023-03-24"),
    videoId: "FhmkQkbV42U",
    vodId: "Qz1Iniho9-g",
  },
  russel: {
    name: "Russel",
    link: "https://www.twitch.tv/russel",
    date: new Date("2023-03-20"),
    videoId: "Xizgus_phn4",
    vodId: "OUaYjkkLeFQ",
  },
  ludwig: {
    name: "Ludwig",
    link: "https://www.youtube.com/@ludwig",
    date: new Date("2023-02-25"),
    videoId: "po1jytjDu4E",
    vodId: "vuLMTU8QHAU",
  },
  alinity: {
    name: "Alinity",
    link: "https://www.twitch.tv/alinity",
    date: new Date("2023-02-09"),
    videoId: "bak3RqjCzE0",
    vodId: "XHTEs94Cf4s",
  },
  connorEatsPants: {
    name: "ConnorEatsPants",
    link: "https://www.twitch.tv/connoreatspants",
    date: new Date("2023-01-25"),
    videoId: "nC8qlK3k96Q",
    vodId: "SMEyEfVlzlM",
  },
  botezSisters: {
    name: "The Botez Sisters",
    link: "https://www.twitch.tv/botezlive",
    date: new Date("2022-08-30"),
    videoId: "QgvNy11kU6E",
  },
  knut: {
    name: "Knut",
    link: "https://www.twitch.tv/knut",
    date: new Date("2022-08-09"),
    videoId: "lFhFx6kf2E4",
  },
  moistCr1tikal: {
    name: "MoistCr1TiKaL",
    link: "https://www.twitch.tv/moistcr1tikal",
    date: new Date("2022-04-30"),
    videoId: "pb7MR59s1Z0",
    vodId: "x-OPvwjGHEU",
  },
  jackManifold: {
    name: "Jack Manifold",
    link: "https://www.twitch.tv/jackmanifoldtv",
    date: new Date("2022-04-21"),
    videoId: "jzyxhnODe2g",
  },
} as const satisfies Collaborations;

const collaborationsByYear: { year: number; collaborations: Collaborations }[] =
  Object.entries(
    Object.entries(collaborations).reduce<Record<string, Collaborations>>(
      (acc, [key, value]) => ({
        ...acc,
        [value.date.getUTCFullYear()]: {
          ...(acc[value.date.getUTCFullYear()] || {}),
          [key]: value,
        },
      }),
      {},
    ),
  )
    .map(([year, collaborations]) => ({ year: Number(year), collaborations }))
    .sort((a, b) => b.year - a.year);

type CollaborationsSectionProps = {
  items: Collaborations;
};

const CollaborationsSection: React.FC<CollaborationsSectionProps> = ({
  items,
}) => {
  return (
    <Lightbox id="collaborations" className="flex flex-wrap">
      {({ Trigger }) => (
        <>
          {Object.entries(items).map(([key, value]) => (
            <div
              key={key}
              className="mx-auto flex basis-full flex-col items-center justify-start py-8 md:px-8 lg:basis-1/2"
            >
              <Heading
                level={2}
                className="flex flex-wrap items-end justify-center gap-x-8 gap-y-2"
                id={camelToKebab(key)}
              >
                <Link
                  href={value.link}
                  className="hover:text-alveus-green-600 hover:underline"
                  external
                  custom
                >
                  {value.name}
                </Link>
                <small className="text-xl text-alveus-green-600">
                  <Link href={`#${camelToKebab(key)}`} custom>
                    {formatDateTime(value.date, { style: "long" })}
                  </Link>
                </small>
              </Heading>

              <Trigger
                videoId={value.videoId}
                caption={`${value.name}: ${formatDateTime(value.date, {
                  style: "long",
                })}`}
                className="w-full max-w-2xl"
              >
                <Preview videoId={value.videoId} />
              </Trigger>

              {value.vodId && (
                <p className="mt-2">
                  (
                  <Link
                    href={`https://www.youtube.com/watch?v=${value.vodId}&list=PLtQafKoimfLd6dM9CQqiLm79khNgxsoN3`}
                    external
                  >
                    Full stream VoD
                  </Link>
                  )
                </p>
              )}
            </div>
          ))}
        </>
      )}
    </Lightbox>
  );
};

const CollaborationsPage: NextPage = () => {
  return (
    <>
      <Meta
        title="Collaborations"
        description="We work with other content creators to educate our combined audiences, introducing them to the educational ambassadors at Alveus and their conservation missions."
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
          src={leafLeftImage3}
          alt=""
          className="pointer-events-none absolute -bottom-20 left-0 z-10 hidden h-auto w-1/2 max-w-[12rem] select-none lg:block"
        />

        <Section dark className="py-24">
          <div className="w-full lg:w-3/5">
            <Heading>Our Collaborations</Heading>
            <p className="text-lg">
              We work with other content creators to educate our combined
              audiences, introducing them to the educational ambassadors at
              Alveus and their conservation missions.
            </p>
          </div>
        </Section>
      </div>

      {/* Grow the last section to cover the page */}
      <div className="relative flex flex-grow flex-col">
        <Image
          src={leafLeftImage1}
          alt=""
          className="pointer-events-none absolute -bottom-32 left-0 z-10 hidden h-auto w-1/2 max-w-[10rem] select-none lg:block 2xl:-bottom-48 2xl:max-w-[12rem]"
        />
        <Image
          src={leafRightImage2}
          alt=""
          className="pointer-events-none absolute -bottom-60 right-0 z-10 hidden h-auto w-1/2 max-w-[10rem] select-none lg:block 2xl:-bottom-64 2xl:max-w-[12rem]"
        />

        <Section className="flex-grow">
          {collaborationsByYear.map(({ year, collaborations }, idx) => (
            <div key={year}>
              <Heading
                level={-1}
                className={classes(
                  "alveus-green-800 mb-6 mt-8 border-b-2 border-alveus-green-300/25 pb-2 text-4xl",
                  idx === 0 && "sr-only",
                )}
                id={year.toString()}
                link
              >
                {year}
              </Heading>
              <CollaborationsSection items={collaborations} />
            </div>
          ))}
        </Section>
      </div>
    </>
  );
};

export default CollaborationsPage;
