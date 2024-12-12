import { type NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import { useMemo, type ComponentProps, forwardRef } from "react";

import ambassadors from "@alveusgg/data/src/ambassadors/core";
import { isActiveAmbassadorEntry } from "@alveusgg/data/src/ambassadors/filters";
import { getAmbassadorImages } from "@alveusgg/data/src/ambassadors/images";
import enclosures from "@alveusgg/data/src/enclosures";
import {
  getClassification,
  sortAmbassadorClassification,
} from "@alveusgg/data/src/ambassadors/classification";

import useGrouped, { type GroupedItems, type Options } from "@/hooks/grouped";

import { camelToKebab } from "@/utils/string-case";
import { typeSafeObjectEntries } from "@/utils/helpers";
import { classes } from "@/utils/classes";
import {
  parsePartialDateString,
  sortPartialDateString,
} from "@/utils/datetime";
import { convertToSlug } from "@/utils/slugs";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Select from "@/components/content/Select";
import Grouped, { type GroupedProps } from "@/components/content/Grouped";

import leafRightImage1 from "@/assets/floral/leaf-right-1.png";
import leafLeftImage1 from "@/assets/floral/leaf-left-1.png";
import leafRightImage2 from "@/assets/floral/leaf-right-2.png";
import leafLeftImage2 from "@/assets/floral/leaf-left-2.png";
import SubNav from "@/components/content/SubNav";

// We don't want to show retired ambassadors on the page
const activeAmbassadors = typeSafeObjectEntries(ambassadors).filter(
  isActiveAmbassadorEntry,
);
type ActiveAmbassadorEntry = (typeof activeAmbassadors)[number];

// Allow the user to sort/group by different options
const sortByOptions = {
  all: {
    label: "All Ambassadors",
    sort: (ambassadors) => ambassadors,
  },
  classification: {
    label: "Classification",
    sort: (ambassadors) =>
      [...ambassadors]
        .sort(
          ([, a], [, b]) =>
            sortAmbassadorClassification(a.class, b.class) ||
            sortPartialDateString(a.arrival, b.arrival),
        )
        .reduce<GroupedItems<ActiveAmbassadorEntry>>((map, [key, val]) => {
          const classification = getClassification(val.class);
          const group = convertToSlug(classification);

          map.set(group, {
            name: classification,
            items: [...(map.get(group)?.items || []), [key, val]],
          });
          return map;
        }, new Map()),
  },
  enclosures: {
    label: "Enclosures",
    sort: (ambassadors) =>
      ambassadors.reduce<GroupedItems<ActiveAmbassadorEntry>>(
        (map, [key, val]) => {
          const group = camelToKebab(val.enclosure);

          map.set(group, {
            name: enclosures[val.enclosure].name,
            items: [...(map.get(group)?.items || []), [key, val]],
          });
          return map;
        },
        new Map(),
      ),
  },
  recent: {
    label: "Recent",
    sort: (ambassadors) =>
      [...ambassadors]
        .sort(([, a], [, b]) => sortPartialDateString(a.arrival, b.arrival))
        .reduce<GroupedItems<ActiveAmbassadorEntry>>((map, [key, val]) => {
          const year = parsePartialDateString(val.arrival)
            ?.getUTCFullYear()
            ?.toString();
          const group = year || "unknown";

          map.set(group, {
            name: year || "Unknown",
            items: [...(map.get(group)?.items || []), [key, val]],
          });
          return map;
        }, new Map()),
  },
} as const satisfies Options<ActiveAmbassadorEntry>;

export const ambassadorImageHover =
  "transition group-hover:scale-102 group-hover:shadow-lg group-hover:brightness-105 group-hover:contrast-115 group-hover:saturate-110";

const AmbassadorItem = ({
  ambassador,
  level = 2,
}: {
  ambassador: ActiveAmbassadorEntry;
  level?: ComponentProps<typeof Heading>["level"];
}) => {
  const [key, data] = ambassador;
  const images = useMemo(() => getAmbassadorImages(key), [key]);

  return (
    <div>
      <Link href={`/ambassadors/${camelToKebab(key)}`} className="group">
        <Image
          src={images[0].src}
          alt={images[0].alt}
          placeholder="blur"
          width={700}
          className={`aspect-4/3 h-auto w-full rounded-xl object-cover ${ambassadorImageHover}`}
          style={{ objectPosition: images[0].position }}
        />
        <Heading
          level={level}
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

const AmbassadorItems = forwardRef<
  HTMLDivElement,
  GroupedProps<ActiveAmbassadorEntry>
>(({ items, option, group, name }, ref) => (
  <>
    {name && (
      <Heading
        level={2}
        className="mb-8 mt-16 scroll-mt-16 border-b-2 border-alveus-green-300/25 pb-2 text-4xl text-alveus-green-800"
        id={`${option}:${group}`}
        link
      >
        {name}
      </Heading>
    )}
    <div
      ref={ref}
      className={classes(
        "grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
        group && "scroll-mt-16 xl:grid-cols-5",
      )}
    >
      {items.map((ambassador) => (
        <AmbassadorItem
          key={ambassador[0]}
          ambassador={ambassador}
          level={group ? 3 : 2}
        />
      ))}
    </div>
  </>
));

AmbassadorItems.displayName = "AmbassadorItems";

const AmbassadorsPage: NextPage = () => {
  const { option, group, result, update, dropdown } = useGrouped({
    items: activeAmbassadors,
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
          className="pointer-events-none absolute -bottom-4 right-0 z-30 hidden h-auto w-1/2 max-w-xs select-none lg:block"
        />
        <Image
          src={leafLeftImage1}
          alt=""
          className="pointer-events-none absolute -bottom-36 -left-8 z-30 hidden h-auto w-1/2 max-w-32 rotate-45 -scale-y-100 select-none lg:block"
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
      <SubNav links={sectionLinks} className="z-20" />
      {/* Grow the last section to cover the page */}
      <div className="relative flex grow flex-col">
        <Image
          src={leafRightImage2}
          alt=""
          className="pointer-events-none absolute -bottom-60 right-0 z-10 hidden h-auto w-1/2 max-w-40 select-none lg:block 2xl:-bottom-64 2xl:max-w-48"
        />
        <Image
          src={leafLeftImage2}
          alt=""
          className="pointer-events-none absolute -bottom-24 left-0 z-10 hidden h-auto w-1/2 max-w-48 select-none lg:block"
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

export default AmbassadorsPage;
