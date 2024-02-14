import { useEffect, useState } from "react";
import { type NextPage } from "next";
import Image from "next/image";

import { formatDateTime } from "@/utils/datetime";
import { camelToKebab, kebabToCamel } from "@/utils/string-case";
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
  link: string | null;
  date: Date;
  videoId: string;
  vodId?: string;
};

type Collaborations = Record<string, Collaboration>;

const collaborations = {
  emilyWang: {
    name: "Emily Wang",
    link: "https://www.twitch.tv/emilyywang",
    date: new Date("2024-02-13"),
    videoId: "CE-mNI_5eEI",
  },
  jinny: {
    name: "Jinny",
    link: "https://www.twitch.tv/jinnytty",
    date: new Date("2024-02-08"),
    videoId: "c-EoBOEr1_g",
  },
  jaidenAnimationsAlpharad: {
    name: "JaidenAnimations & Alpharad",
    link: null,
    date: new Date("2024-02-02"),
    videoId: "W74Ub2HR1Y4",
    vodId: "U2HqCEr5_e4",
  },
  cinna: {
    name: "Cinna",
    link: "https://www.twitch.tv/cinna",
    date: new Date("2024-01-28"),
    videoId: "URSbZwAqLNE",
  },
  hasan: {
    name: "Hasan",
    link: "https://www.twitch.tv/hasanabi",
    date: new Date("2024-01-26"),
    videoId: "E_iO1ZKlHyM",
    vodId: "MnPhxGBoY-I",
  },
  fanfan: {
    name: "Fanfan",
    link: "https://www.twitch.tv/fanfan",
    date: new Date("2023-11-13"),
    videoId: "OCf7356WlNo",
  },
  alluux: {
    name: "Alluux",
    link: "https://www.twitch.tv/alluux",
    date: new Date("2023-11-05"),
    videoId: "x1KMHDgmsR0",
  },
  filian: {
    name: "Filian",
    link: "https://www.twitch.tv/filian",
    date: new Date("2023-10-11"),
    videoId: "WaQcdQBrz0I",
  },
  trihex: {
    name: "Trihex",
    link: "https://www.twitch.tv/trihex",
    date: new Date("2023-09-21"),
    videoId: "lxks3skYeO4",
    vodId: "H0gaJrLY5X0",
  },
  esfand: {
    name: "Esfand",
    link: "https://www.twitch.tv/esfandtv",
    date: new Date("2023-08-26"),
    videoId: "9aXebCBRonA",
    vodId: "o7nyVU62rf8",
  },
  extraEmily: {
    name: "ExtraEmily",
    link: "https://www.twitch.tv/extraemily",
    date: new Date("2023-06-22"),
    videoId: "maJTBSkgA4Y",
    vodId: "qbxV8xgA7Vg",
  },
  zoil: {
    name: "Zoil",
    link: "https://www.twitch.tv/zoil",
    date: new Date("2023-06-13"),
    videoId: "8M_qtYuSrys",
    vodId: "n4KpVaUmrSE",
  },
  peachJars: {
    name: "PeachJars and Jessica Nigri",
    link: "https://www.twitch.tv/peachjars",
    date: new Date("2023-05-21"),
    videoId: "-HuS6wbpqzQ",
    vodId: "KF4HIypXiyc",
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
    videoId: "H5nV79y-Prg",
    vodId: "4MmCFJadSg8",
  },
  lacari: {
    name: "Lacari",
    link: "https://www.twitch.tv/lacari",
    date: new Date("2023-05-02"),
    videoId: "IssAfvy_bmo",
    vodId: "mVOypbE5YNs",
  },
  dailyDose: {
    name: "Daily Dose",
    link: "https://www.youtube.com/@DailyDoseOfInternet",
    date: new Date("2023-04-25"),
    videoId: "M9BBwvR3i-E",
    vodId: "j8GxD4adNyk",
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
    videoId: "kqKnhu5zBIY",
    vodId: "RCzMJs9uDSI",
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
  year: number;
};

const CollaborationsSection = ({ items, year }: CollaborationsSectionProps) => {
  const [open, setOpen] = useState<string>();
  useEffect(() => {
    const hash = kebabToCamel(window.location.hash.slice(1));
    if (hash && items[hash]) setOpen(hash);
  }, [items]);

  return (
    <Lightbox
      id={`collaborations-${year}`}
      className="flex flex-wrap"
      value={open}
      onChange={setOpen}
    >
      {({ Trigger }) => (
        <>
          {Object.entries(items).map(([key, value]) => (
            <div
              key={key}
              className="mx-auto flex basis-full flex-col items-center justify-start py-8 md:px-8 lg:basis-1/2"
            >
              <Heading
                level={2}
                className="flex flex-wrap items-end justify-center gap-x-8 gap-y-2 text-center"
                id={camelToKebab(key)}
              >
                {value.link !== null ? (
                  <Link
                    href={value.link}
                    className="hover:text-alveus-green-600 hover:underline"
                    external
                    custom
                  >
                    {value.name}
                  </Link>
                ) : (
                  value.name
                )}
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
                triggerId={key}
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
              <CollaborationsSection items={collaborations} year={year} />
            </div>
          ))}
        </Section>
      </div>
    </>
  );
};

export default CollaborationsPage;
