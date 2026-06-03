import Image from "next/image";
import Link from "next/link";
import { type ComponentProps, type FC, useMemo } from "react";

import { getAmbassadorImages } from "@alveusgg/data/build/ambassadors/images";

import { classes } from "@/utils/classes";
import {
  type PartialDateString,
  parsePartialDateString,
  sortPartialDateString,
} from "@/utils/datetime-partial";
import { camelToKebab } from "@/utils/string-case";

import useGrouped, {
  type GroupedItems,
  type Options,
} from "@/hooks/grouped";

import Grouped, { type GroupedProps } from "@/components/content/Grouped";
import Heading from "@/components/content/Heading";
import Section from "@/components/content/Section";
import Select from "@/components/content/Select";
import SubNav from "@/components/content/SubNav";

import leafLeftImage1 from "@/assets/floral/leaf-left-1.png";
import leafLeftImage2 from "@/assets/floral/leaf-left-2.png";
import leafRightImage1 from "@/assets/floral/leaf-right-1.png";
import leafRightImage2 from "@/assets/floral/leaf-right-2.png";

import { ambassadorImageHover } from "@/pages/ambassadors";

import type { AmbassadorsIndexData } from "./types";

type AmbassadorKey = Parameters<typeof getAmbassadorImages>[0];
type Item = AmbassadorsIndexData["items"][number];

const AmbassadorItem = ({
  item,
  level = 2,
}: {
  item: Item;
  level?: ComponentProps<typeof Heading>["level"];
}) => {
  const image = getAmbassadorImages(item.key as AmbassadorKey)?.[0];

  return (
    <div>
      <Link href={`/ambassadors/${camelToKebab(item.key)}`} className="group">
        {image && (
          <Image
            src={image.src}
            alt={image.alt}
            placeholder="blur"
            width={700}
            className={`aspect-4/3 h-auto w-full rounded-xl object-cover ${ambassadorImageHover}`}
            style={{ objectPosition: image.position }}
          />
        )}
        <Heading
          level={level}
          className="mt-2 mb-0 text-center transition-colors group-hover:text-alveus-green-700"
        >
          {item.name}
        </Heading>
        <p className="text-center text-xl text-alveus-green-700 transition-colors group-hover:text-alveus-green-400">
          {item.species}
        </p>
      </Link>
    </div>
  );
};

const AmbassadorItems = ({
  items,
  option,
  group,
  name,
  ref,
}: GroupedProps<Item, HTMLDivElement>) => (
  <>
    {name && (
      <Heading
        level={2}
        className="mt-16 mb-8 border-b-2 border-alveus-green-300/25 pb-2 text-4xl text-alveus-green-800 [&>a]:flex [&>a]:items-end [&>a]:justify-between"
        id={`${option}:${group}`}
        link
      >
        {name}
        <small className="text-lg font-medium">{` (${items.length.toLocaleString()})`}</small>
      </Heading>
    )}
    <div
      ref={ref}
      className={classes(
        "grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
        group && "xl:grid-cols-5",
      )}
    >
      {items.map((item) => (
        <AmbassadorItem key={item.key} item={item} level={group ? 3 : 2} />
      ))}
    </div>
  </>
);

// /ambassadors index: editorial heading/intro from the silo + the full catalog
// (also in the silo). Sort/group runs entirely off `data.items`, reusing Alveus's
// own interactive primitives (useGrouped + Select + SubNav + Grouped) — no
// reimplementation, no @alveusgg/data at render (only image assets, keyed).
export const AmbassadorsIndex: FC<{ data: AmbassadorsIndexData }> = ({
  data,
}) => {
  const sortByOptions = useMemo<Options<Item>>(
    () => ({
      all: {
        label: (
          <>
            All Ambassadors
            <small className="text-sm">{` (${data.items.length.toLocaleString()})`}</small>
          </>
        ),
        sort: (items) => items,
      },
      classification: {
        label: "Classification",
        sort: (items) =>
          [...items]
            .sort(
              (a, b) =>
                a.classification.order - b.classification.order ||
                sortPartialDateString(
                  a.arrival as PartialDateString | null,
                  b.arrival as PartialDateString | null,
                ),
            )
            .reduce<GroupedItems<Item>>((map, item) => {
              const group = item.classification.slug;
              map.set(group, {
                name: item.classification.name,
                items: [...(map.get(group)?.items || []), item],
              });
              return map;
            }, new Map()),
      },
      enclosures: {
        label: "Enclosures",
        sort: (items) =>
          items.reduce<GroupedItems<Item>>((map, item) => {
            const group = item.enclosure.slug;
            map.set(group, {
              name: item.enclosure.name,
              items: [...(map.get(group)?.items || []), item],
            });
            return map;
          }, new Map()),
      },
      recent: {
        label: "Recent",
        sort: (items) =>
          [...items]
            .sort((a, b) =>
              sortPartialDateString(
                a.arrival as PartialDateString | null,
                b.arrival as PartialDateString | null,
              ),
            )
            .reduce<GroupedItems<Item>>((map, item) => {
              const year = item.arrival
                ? parsePartialDateString(
                    item.arrival as PartialDateString,
                  ).year.toString()
                : undefined;
              const group = year || "unknown";
              map.set(group, {
                name: year || "Unknown",
                items: [...(map.get(group)?.items || []), item],
              });
              return map;
            }, new Map()),
      },
    }),
    [data.items],
  );

  const { option, group, result, update, dropdown } = useGrouped({
    items: data.items,
    options: sortByOptions,
    initial: "all",
  });

  const sectionLinks = useMemo(
    () =>
      result instanceof Map
        ? [...result.entries()].map(([key, value]) => ({
            name: value.name,
            href: `#${option}:${key}`,
          }))
        : [],
    [result, option],
  );

  return (
    <>
      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <div className="relative">
        <Image
          src={leafRightImage1}
          alt=""
          className="pointer-events-none absolute right-0 -bottom-4 z-30 hidden h-auto w-1/2 max-w-xs drop-shadow-md select-none lg:block"
        />
        <Image
          src={leafLeftImage1}
          alt=""
          className="pointer-events-none absolute -bottom-36 -left-16 z-30 hidden h-auto w-1/2 max-w-32 -scale-y-100 rotate-45 drop-shadow-md select-none lg:block"
        />

        <Section dark className="py-24">
          <div className="w-full lg:w-3/5">
            <Heading>{data.heading}</Heading>
            <p className="text-lg">{data.intro}</p>
          </div>
        </Section>
      </div>

      {sectionLinks.length !== 0 && (
        <SubNav links={sectionLinks} className="z-20" />
      )}

      {/* Grow the last section to cover the page */}
      <div className="relative flex grow flex-col">
        <Image
          src={leafRightImage2}
          alt=""
          className="pointer-events-none absolute right-0 -bottom-60 z-10 hidden h-auto w-1/2 max-w-40 drop-shadow-md select-none lg:block 2xl:-bottom-64 2xl:max-w-48"
        />
        <Image
          src={leafLeftImage2}
          alt=""
          className="pointer-events-none absolute -bottom-24 left-0 z-10 hidden h-auto w-1/2 max-w-48 drop-shadow-md select-none lg:block"
        />

        <Section className="grow pt-8">
          <div
            className={classes(
              "flex flex-col items-center justify-between gap-4 md:flex-row",
              Array.isArray(result) ? "mb-4" : "-mb-6",
            )}
          >
            <p className="shrink text-center text-xl font-semibold">
              Click each ambassador for information and highlights!
            </p>

            <Select
              options={dropdown}
              value={option}
              onChange={(val) => update(val as keyof typeof dropdown, null)}
              label={<span className="sr-only">Sort by</span>}
              align="right"
              className="shrink-0"
            />
          </div>

          <Grouped
            option={option}
            group={group}
            result={result}
            component={AmbassadorItems}
          />
        </Section>
      </div>
    </>
  );
};
