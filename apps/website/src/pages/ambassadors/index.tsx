import { type NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import { type ComponentProps, useMemo } from "react";

import {
  getClassification,
  sortAmbassadorClassification,
} from "@alveusgg/data/build/ambassadors/classification";
import ambassadors from "@alveusgg/data/build/ambassadors/core";
import { isActiveAmbassadorEntry } from "@alveusgg/data/build/ambassadors/filters";
import { getAmbassadorImages } from "@alveusgg/data/build/ambassadors/images";
import { getSpecies } from "@alveusgg/data/build/ambassadors/species";
import enclosures from "@alveusgg/data/build/enclosures";

import { classes } from "@/utils/classes";
import {
  parsePartialDateString,
  sortPartialDateString,
} from "@/utils/datetime-partial";
import { typeSafeObjectEntries } from "@/utils/helpers";
import { convertToSlug } from "@/utils/slugs";
import { camelToKebab } from "@/utils/string-case";

import useGrouped, { type GroupedItems, type Options } from "@/hooks/grouped";

import Grouped, { type GroupedProps } from "@/components/content/Grouped";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import Select from "@/components/content/Select";
import SubNav from "@/components/content/SubNav";

import leafLeftImage1 from "@/assets/floral/leaf-left-1.png";
import leafLeftImage2 from "@/assets/floral/leaf-left-2.png";
import leafRightImage1 from "@/assets/floral/leaf-right-1.png";
import leafRightImage2 from "@/assets/floral/leaf-right-2.png";

// We don't want to show retired ambassadors on the page
const activeAmbassadors = typeSafeObjectEntries(ambassadors).filter(
  isActiveAmbassadorEntry,
);
type ActiveAmbassadorEntry = (typeof activeAmbassadors)[number];

// Allow the user to sort/group by different options
const sortByOptions = {
  all: {
    label: (
      <>
        All Ambassadors
        <small className="text-sm">{` (${activeAmbassadors.length.toLocaleString()})`}</small>
      </>
    ),
    sort: (ambassadors) => ambassadors,
  },
  classification: {
    label: "Classification",
    sort: (ambassadors) =>
      [...ambassadors]
        .sort(([, a], [, b]) => {
          const aSpecies = getSpecies(a.species);
          const bSpecies = getSpecies(b.species);

          return (
            sortAmbassadorClassification(aSpecies.class, bSpecies.class) ||
            sortPartialDateString(a.arrival, b.arrival)
          );
        })
        .reduce<GroupedItems<ActiveAmbassadorEntry>>((map, [key, val]) => {
          const species = getSpecies(val.species);
          const classification = getClassification(species.class);
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
          const year = parsePartialDateString(val.arrival)?.year.toString();
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
  const species = getSpecies(data.species);
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
          className="mt-2 mb-0 text-center transition-colors group-hover:text-alveus-green-700"
        >
          {data.name}
        </Heading>
        <p className="text-center text-xl text-alveus-green-700 transition-colors group-hover:text-alveus-green-400">
          {species.name}
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
}: GroupedProps<ActiveAmbassadorEntry, HTMLDivElement>) => (
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
      {items.map((ambassador) => (
        <AmbassadorItem
          key={ambassador[0]}
          ambassador={ambassador}
          level={group ? 3 : 2}
        />
      ))}
    </div>
  </>
);

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
        description="Each and every ambassador at Alveus plays an important role as a representative of their species, sharing unique stories about conservation and consumer choice."
      />

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
            <Heading>Alveus Ambassadors</Heading>
            <p className="text-lg">
              Each and every ambassador at Alveus plays an important role as a
              representative of their species, sharing unique stories about
              conservation and consumer choice. Our non-releasable animal
              ambassadors are not pets &mdash; they help educate our audience,
              inspire conservation efforts, and foster a deeper connection with
              their species.
            </p>
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

export default AmbassadorsPage;
