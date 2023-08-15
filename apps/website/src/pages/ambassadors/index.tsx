import { type NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import ambassadors, {
  type AmbassadorKey,
} from "@alveusgg/data/src/ambassadors/core";
import {
  isActiveAmbassadorEntry,
  type ActiveAmbassadorKey,
} from "@alveusgg/data/src/ambassadors/filters";
import { getAmbassadorImages } from "@alveusgg/data/src/ambassadors/images";
import enclosures from "@alveusgg/data/src/enclosures";
import {
  getClassification,
  sortAmbassadorClassification,
} from "@alveusgg/data/src/ambassadors/classification";

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

import leafRightImage1 from "@/assets/floral/leaf-right-1.png";
import leafLeftImage1 from "@/assets/floral/leaf-left-1.png";
import leafRightImage2 from "@/assets/floral/leaf-right-2.png";
import leafLeftImage2 from "@/assets/floral/leaf-left-2.png";

// We don't want to show retired ambassadors on the page
const activeAmbassadors = typeSafeObjectEntries(ambassadors).filter(
  isActiveAmbassadorEntry,
);

// Use a map rather than a group, so we can sort the keys
type AmbassadorsByGroup = Map<
  string,
  { name: string; items: ActiveAmbassadorKey[] }
>;

type AmbassadorSortOptions = Record<
  string,
  { label: string; result: AmbassadorKey[] | AmbassadorsByGroup }
>;

const sortByOptions = {
  all: {
    label: "All Ambassadors",
    result: activeAmbassadors.map(([key]) => key),
  },
  classification: {
    label: "Classification",
    result: [...activeAmbassadors]
      .sort(
        ([, a], [, b]) =>
          sortAmbassadorClassification(a.class, b.class) ||
          sortPartialDateString(a.arrival, b.arrival),
      )
      .reduce<AmbassadorsByGroup>((map, [key, val]) => {
        const classification = getClassification(val.class);
        const group = convertToSlug(classification);
        map.set(group, {
          name: classification,
          items: [...(map.get(group)?.items || []), key],
        });
        return map;
      }, new Map()),
  },
  enclosures: {
    label: "Enclosures",
    result: activeAmbassadors.reduce<AmbassadorsByGroup>((map, [key, val]) => {
      const group = camelToKebab(val.enclosure);
      map.set(group, {
        name: enclosures[val.enclosure].name,
        items: [...(map.get(group)?.items || []), key],
      });
      return map;
    }, new Map()),
  },
  recent: {
    label: "Recent",
    result: [...activeAmbassadors]
      .sort(([, a], [, b]) => sortPartialDateString(a.arrival, b.arrival))
      .reduce<AmbassadorsByGroup>((map, [key, val]) => {
        const year = parsePartialDateString(val.arrival)
          ?.getUTCFullYear()
          ?.toString();
        const group = year || "unknown";
        map.set(group, {
          name: year || "Unknown",
          items: [...(map.get(group)?.items || []), key],
        });
        return map;
      }, new Map()),
  },
} as const satisfies AmbassadorSortOptions;

type SortByOption = keyof typeof sortByOptions;

const sortByDropdown = Object.fromEntries(
  Object.entries(sortByOptions).map(([key, val]) => [key, val.label]),
) as {
  [key in SortByOption]: (typeof sortByOptions)[key]["label"];
};

const isSortByOption = (option: string): option is SortByOption =>
  Object.keys(sortByOptions).includes(option);

export const ambassadorImageHover =
  "transition group-hover:scale-102 group-hover:shadow-lg group-hover:brightness-105 group-hover:contrast-115 group-hover:saturate-110";

const AmbassadorItem: React.FC<{
  ambassador: AmbassadorKey;
  level?: React.ComponentProps<typeof Heading>["level"];
}> = ({ ambassador, level = 2 }) => {
  const data = useMemo(() => ambassadors[ambassador], [ambassador]);
  const images = useMemo(() => getAmbassadorImages(ambassador), [ambassador]);

  return (
    <div>
      <Link href={`/ambassadors/${camelToKebab(ambassador)}`} className="group">
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

const AmbassadorItems: React.FC<{
  ambassadors: AmbassadorKey[];
  className?: string;
  level?: React.ComponentProps<typeof Heading>["level"];
}> = ({ ambassadors, className, level }) => (
  <div
    className={classes(
      "grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
      className,
    )}
  >
    {ambassadors.map((key) => (
      <AmbassadorItem key={key} ambassador={key} level={level} />
    ))}
  </div>
);

const AmbassadorGroup: React.FC<{
  type: string;
  group: string;
  name: string;
  ambassadors: AmbassadorKey[];
  active?: boolean;
}> = ({ type, group, name, ambassadors, active = false }) => {
  // If this group is the "active" one in the URL, scroll it into view
  const scroll = useCallback(
    (node: HTMLDivElement | null) => {
      if (node && active) node.scrollIntoView({ behavior: "smooth" });
    },
    [active],
  );

  return (
    <div ref={scroll}>
      <Heading level={2} className="mb-8" id={`${type}:${group}`} link>
        {name}
      </Heading>
      <AmbassadorItems
        ambassadors={ambassadors}
        className="xl:grid-cols-5"
        level={3}
      />
    </div>
  );
};

const AmbassadorsPage: NextPage = () => {
  const [checked, setChecked] = useState(false);
  const [sortBy, setSortBy] = useState<SortByOption>("all");
  const [active, setActive] = useState<string | null>(null);

  // Check the hash to see what sort by option should be selected
  const checkHash = useCallback(() => {
    const match = window.location.hash.match(/^#([^:]+)(?::(.+))?$/);
    if (match && match[1] && isSortByOption(match[1])) {
      setSortBy(match[1]);

      // If we have a group, check if the option has groups and has this one
      const option = sortByOptions[match[1]];
      const group = match[2];
      setActive(
        group && !Array.isArray(option.result) && option.result.has(group)
          ? group
          : null,
      );
    } else {
      setSortBy("all");
      setActive(null);
    }
    setChecked(true);
  }, []);
  useEffect(() => {
    checkHash();
    window.addEventListener("hashchange", checkHash);
    return () => window.removeEventListener("hashchange", checkHash);
  }, [checkHash]);

  // When the tab changes, update the hash
  useEffect(() => {
    if (!checked) return;

    const current = window.location.toString();
    const url = new URL(current);

    if (sortBy === "all") url.hash = "";
    else if (active) url.hash = `${sortBy}:${active}`;
    else url.hash = sortBy;

    const updated = url.toString();
    if (current !== updated) window.history.pushState({}, "", updated);
  }, [checked, sortBy, active]);

  // When the user picks a new sort by option, reset the active group
  const selectSortBy = useCallback((val: string) => {
    if (isSortByOption(val)) {
      setSortBy(val);
      setActive(null);
    }
  }, []);

  const results = sortByOptions[sortBy].result;

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
          className="pointer-events-none absolute -bottom-4 right-0 z-10 hidden h-auto w-1/2 max-w-xs select-none lg:block"
        />
        <Image
          src={leafLeftImage1}
          alt=""
          className="pointer-events-none absolute -bottom-36 -left-8 z-10 hidden h-auto w-1/2 max-w-[8rem] rotate-45 -scale-y-100 select-none lg:block"
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
          className="pointer-events-none absolute -bottom-60 right-0 z-10 hidden h-auto w-1/2 max-w-[10rem] select-none lg:block 2xl:-bottom-64 2xl:max-w-[12rem]"
        />
        <Image
          src={leafLeftImage2}
          alt=""
          className="pointer-events-none absolute -bottom-24 left-0 z-10 hidden h-auto w-1/2 max-w-[12rem] select-none lg:block"
        />

        <Section className="flex-grow pt-0">
          <div className="mb-4 mt-8 flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="flex-shrink text-center text-xl font-semibold">
              Click each ambassador for information and highlights!
            </p>

            <Select
              options={sortByDropdown}
              value={sortBy}
              onChange={selectSortBy}
              label={<span className="sr-only">Sort by</span>}
              align="right"
              className="flex-shrink-0"
            />
          </div>

          {Array.isArray(results) ? (
            <AmbassadorItems ambassadors={results} className="mt-8" />
          ) : (
            <div className="grid gap-12">
              {[...results.entries()].map(([key, val]) => (
                <AmbassadorGroup
                  key={key}
                  type={sortBy}
                  group={key}
                  name={val.name}
                  ambassadors={val.items}
                  active={key === active}
                />
              ))}
            </div>
          )}
        </Section>
      </div>
    </>
  );
};

export default AmbassadorsPage;
