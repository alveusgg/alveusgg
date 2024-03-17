import { forwardRef, useEffect, useMemo, useState } from "react";
import { type NextPage } from "next";
import Image from "next/image";

import useGrouped, { type GroupedItems, type Options } from "@/hooks/grouped";

import { formatDateTime } from "@/utils/datetime";
import { classes } from "@/utils/classes";
import { convertToSlug } from "@/utils/slugs";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Link from "@/components/content/Link";
import { Lightbox, Preview } from "@/components/content/YouTube";
import Grouped, { type GroupedProps } from "@/components/content/Grouped";

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

const collaborations: Collaboration[] = [
  {
    name: "Emily Wang",
    link: "https://www.twitch.tv/emilyywang",
    date: new Date("2024-02-13"),
    videoId: "CE-mNI_5eEI",
  },
  {
    name: "Jinny",
    link: "https://www.twitch.tv/jinnytty",
    date: new Date("2024-02-08"),
    videoId: "lpXtuG87BUM",
    vodId: "c-EoBOEr1_g",
  },
  {
    name: "JaidenAnimations & Alpharad",
    link: null,
    date: new Date("2024-02-02"),
    videoId: "W74Ub2HR1Y4",
    vodId: "U2HqCEr5_e4",
  },
  {
    name: "Cinna",
    link: "https://www.twitch.tv/cinna",
    date: new Date("2024-01-28"),
    videoId: "5YRrm5mDb6o",
    vodId: "URSbZwAqLNE",
  },
  {
    name: "Hasan",
    link: "https://www.twitch.tv/hasanabi",
    date: new Date("2024-01-26"),
    videoId: "E_iO1ZKlHyM",
    vodId: "MnPhxGBoY-I",
  },
  {
    name: "Fanfan",
    link: "https://www.twitch.tv/fanfan",
    date: new Date("2023-11-13"),
    videoId: "qHcy_sBJXmU",
    vodId: "OCf7356WlNo",
  },
  {
    name: "Alluux",
    link: "https://www.twitch.tv/alluux",
    date: new Date("2023-11-05"),
    videoId: "L5r1isGll2I",
    vodId: "x1KMHDgmsR0",
  },
  {
    name: "Filian",
    link: "https://www.twitch.tv/filian",
    date: new Date("2023-10-11"),
    videoId: "WaQcdQBrz0I",
  },
  {
    name: "Trihex",
    link: "https://www.twitch.tv/trihex",
    date: new Date("2023-09-21"),
    videoId: "lxks3skYeO4",
    vodId: "H0gaJrLY5X0",
  },
  {
    name: "Esfand",
    link: "https://www.twitch.tv/esfandtv",
    date: new Date("2023-08-26"),
    videoId: "9aXebCBRonA",
    vodId: "o7nyVU62rf8",
  },
  {
    name: "ExtraEmily",
    link: "https://www.twitch.tv/extraemily",
    date: new Date("2023-06-22"),
    videoId: "maJTBSkgA4Y",
    vodId: "qbxV8xgA7Vg",
  },
  {
    name: "Zoil",
    link: "https://www.twitch.tv/zoil",
    date: new Date("2023-06-13"),
    videoId: "8M_qtYuSrys",
    vodId: "n4KpVaUmrSE",
  },
  {
    name: "PeachJars and Jessica Nigri",
    link: "https://www.twitch.tv/peachjars",
    date: new Date("2023-05-21"),
    videoId: "-HuS6wbpqzQ",
    vodId: "KF4HIypXiyc",
  },
  {
    name: "Squeex",
    link: "https://www.twitch.tv/squeex",
    date: new Date("2023-05-19"),
    videoId: "oUJxCDGQDlY",
    vodId: "dCV8b8LcG-0",
  },
  {
    name: "Caroline Kwan",
    link: "https://www.twitch.tv/carolinekwan",
    date: new Date("2023-05-09"),
    videoId: "H5nV79y-Prg",
    vodId: "4MmCFJadSg8",
  },
  {
    name: "Lacari",
    link: "https://www.twitch.tv/lacari",
    date: new Date("2023-05-02"),
    videoId: "IssAfvy_bmo",
    vodId: "mVOypbE5YNs",
  },
  {
    name: "Daily Dose",
    link: "https://www.youtube.com/@DailyDoseOfInternet",
    date: new Date("2023-04-25"),
    videoId: "M9BBwvR3i-E",
    vodId: "j8GxD4adNyk",
  },
  {
    name: "Graycen",
    link: "https://www.twitch.tv/graycen",
    date: new Date("2023-04-18"),
    videoId: "M3WBnThqRkg",
  },
  {
    name: "Dareon",
    link: "https://www.twitch.tv/dareon",
    date: new Date("2023-04-11"),
    videoId: "kqKnhu5zBIY",
    vodId: "RCzMJs9uDSI",
  },
  {
    name: "YungJeff",
    link: "https://twitter.com/YUNGJEFF",
    date: new Date("2023-04-04"),
    videoId: "BXOEWQZ8C_Y",
  },
  {
    name: "PointCrow",
    link: "https://www.twitch.tv/pointcrow",
    date: new Date("2023-03-24"),
    videoId: "FhmkQkbV42U",
    vodId: "Qz1Iniho9-g",
  },
  {
    name: "Russel",
    link: "https://www.twitch.tv/russel",
    date: new Date("2023-03-20"),
    videoId: "Xizgus_phn4",
    vodId: "OUaYjkkLeFQ",
  },
  {
    name: "Ludwig",
    link: "https://www.youtube.com/@ludwig",
    date: new Date("2023-02-25"),
    videoId: "po1jytjDu4E",
    vodId: "vuLMTU8QHAU",
  },
  {
    name: "Alinity",
    link: "https://www.twitch.tv/alinity",
    date: new Date("2023-02-09"),
    videoId: "bak3RqjCzE0",
    vodId: "XHTEs94Cf4s",
  },
  {
    name: "ConnorEatsPants",
    link: "https://www.twitch.tv/connoreatspants",
    date: new Date("2023-01-25"),
    videoId: "nC8qlK3k96Q",
    vodId: "SMEyEfVlzlM",
  },
  {
    name: "The Botez Sisters",
    link: "https://www.twitch.tv/botezlive",
    date: new Date("2022-08-30"),
    videoId: "QgvNy11kU6E",
  },
  {
    name: "Knut",
    link: "https://www.twitch.tv/knut",
    date: new Date("2022-08-09"),
    videoId: "lFhFx6kf2E4",
  },
  {
    name: "MoistCr1TiKaL",
    link: "https://www.twitch.tv/moistcr1tikal",
    date: new Date("2022-04-30"),
    videoId: "pb7MR59s1Z0",
    vodId: "x-OPvwjGHEU",
  },
  {
    name: "Jack Manifold",
    link: "https://www.twitch.tv/jackmanifoldtv",
    date: new Date("2022-04-21"),
    videoId: "jzyxhnODe2g",
  },
];

const sortByOptions = {
  all: {
    label: "All Collaborations",
    sort: (collaborations) =>
      [...collaborations]
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .reduce<GroupedItems<Collaboration>>((map, collaboration) => {
          const year = collaboration.date.getUTCFullYear().toString();

          map.set(year, {
            name: year,
            items: [...(map.get(year)?.items || []), collaboration],
          });
          return map;
        }, new Map()),
  },
} as const satisfies Options<Collaboration>;

const CollaborationItems = forwardRef<
  HTMLDivElement,
  GroupedProps<Collaboration>
>(({ items, option, group, name, index }, ref) => {
  const itemsWithSlugs = useMemo(
    () =>
      items.reduce(
        (acc, item) => {
          const slug = convertToSlug(item.name);
          return { ...acc, [slug]: item };
        },
        {} as Record<string, Collaboration>,
      ),
    [items],
  );

  const [open, setOpen] = useState<string>();
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (Object.prototype.hasOwnProperty.call(itemsWithSlugs, hash))
      setOpen(hash);
  }, [itemsWithSlugs]);

  return (
    <>
      {name && (
        <Heading
          level={-1}
          className={classes(
            "alveus-green-800 mb-6 mt-8 border-b-2 border-alveus-green-300/25 pb-2 text-4xl",
            index === 0 && "sr-only",
          )}
          id={`${option}:${group}`}
          link
        >
          {name}
        </Heading>
      )}
      <Lightbox
        id={`collaborations-${name}`}
        className="flex flex-wrap"
        value={open}
        onChange={setOpen}
        ref={ref}
      >
        {({ Trigger }) => (
          <>
            {Object.entries(itemsWithSlugs).map(([slug, collaboration]) => (
              <div
                key={slug}
                className="mx-auto flex basis-full flex-col items-center justify-start py-8 md:px-8 lg:basis-1/2"
              >
                <Heading
                  level={2}
                  className="flex flex-wrap items-end justify-center gap-x-8 gap-y-2 text-center"
                  id={slug}
                >
                  {collaboration.link !== null ? (
                    <Link
                      href={collaboration.link}
                      className="hover:text-alveus-green-600 hover:underline"
                      external
                      custom
                    >
                      {collaboration.name}
                    </Link>
                  ) : (
                    collaboration.name
                  )}
                  <small className="text-xl text-alveus-green-600">
                    <Link href={`#${slug}`} custom>
                      {formatDateTime(collaboration.date, { style: "long" })}
                    </Link>
                  </small>
                </Heading>

                <Trigger
                  videoId={collaboration.videoId}
                  caption={`${collaboration.name}: ${formatDateTime(
                    collaboration.date,
                    {
                      style: "long",
                    },
                  )}`}
                  triggerId={slug}
                  className="w-full max-w-2xl"
                >
                  <Preview videoId={collaboration.videoId} />
                </Trigger>

                {collaboration.vodId && (
                  <p className="mt-2">
                    (
                    <Link
                      href={`https://www.youtube.com/watch?v=${collaboration.vodId}&list=PLtQafKoimfLd6dM9CQqiLm79khNgxsoN3`}
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
    </>
  );
});

CollaborationItems.displayName = "CollaborationItems";

const CollaborationsPage: NextPage = () => {
  const { option, group, result } = useGrouped({
    items: collaborations,
    options: sortByOptions,
    initial: "all",
  });

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
          <Grouped
            option={option}
            group={group}
            result={result}
            component={CollaborationItems}
          />
        </Section>
      </div>
    </>
  );
};

export default CollaborationsPage;
