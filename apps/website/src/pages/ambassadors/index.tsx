import { type NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import ambassadors, {
  type AmbassadorKey,
} from "@alveusgg/data/src/ambassadors/core";
import { getAmbassadorImages } from "@alveusgg/data/src/ambassadors/images";
import enclosures, {
  isEnclosureKey,
  type EnclosureKey,
} from "@alveusgg/data/src/enclosures";

import { camelToKebab, kebabToCamel } from "@/utils/string-case";
import { typeSafeObjectEntries, typeSafeObjectKeys } from "@/utils/helpers";
import { classes } from "@/utils/classes";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";

import leafRightImage1 from "@/assets/floral/leaf-right-1.png";
import leafLeftImage1 from "@/assets/floral/leaf-left-1.png";
import leafRightImage2 from "@/assets/floral/leaf-right-2.png";
import leafLeftImage2 from "@/assets/floral/leaf-left-2.png";

// We don't want to show retired ambassadors on the page
const activeAmbassadors = typeSafeObjectEntries(ambassadors).reduce<
  AmbassadorKey[]
>((arr, [key, val]) => (val.retired ? arr : [...arr, key]), []);

// Group all the non-retired ambassadors by their enclosure
type AmbassadorsByEnclosure = Partial<Record<EnclosureKey, AmbassadorKey[]>>;
const ambassadorsByEnclosure = typeSafeObjectEntries(
  ambassadors
).reduce<AmbassadorsByEnclosure>(
  (acc, [key, val]) =>
    val.retired
      ? acc
      : {
          ...acc,
          [val.enclosure]: [...(acc[val.enclosure] || []), key],
        },
  {}
);

export const ambassadorImageHover =
  "transition group-hover:scale-102 group-hover:shadow-lg group-hover:brightness-105 group-hover:contrast-115 group-hover:saturate-110";

const AmbassadorItem: React.FC<{
  ambassador: AmbassadorKey;
  level?: React.ComponentProps<typeof Heading>["level"];
}> = ({ ambassador, level = 2 }) => {
  const data = useMemo(() => ambassadors[ambassador], [ambassador]);
  const images = useMemo(() => getAmbassadorImages(ambassador), [ambassador]);

  return (
    <div className="basis-full py-4 md:basis-1/2 md:px-4 lg:basis-1/4">
      <Link href={`/ambassadors/${camelToKebab(ambassador)}`} className="group">
        <Image
          src={images[0].src}
          alt={images[0].alt}
          placeholder="blur"
          width={700}
          className={`aspect-4/3 h-auto w-full rounded-xl object-cover ${ambassadorImageHover}`}
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
  <div className={classes("flex flex-wrap", className)}>
    {ambassadors.map((key) => (
      <AmbassadorItem key={key} ambassador={key} level={level} />
    ))}
  </div>
);

const AmbassadorEnclosure: React.FC<{
  enclosure: EnclosureKey;
  active?: boolean;
}> = ({ enclosure, active = false }) => {
  const data = useMemo(() => enclosures[enclosure], [enclosure]);
  const ambassadors = useMemo(
    () => ambassadorsByEnclosure[enclosure] || [],
    [enclosure]
  );

  // If this enclosure is the "active" one in the URL, scroll it into view
  const scroll = useCallback(
    (node: HTMLDivElement | null) => {
      if (node && active) node.scrollIntoView({ behavior: "smooth" });
    },
    [active]
  );

  return (
    <div ref={scroll}>
      <Heading
        level={2}
        className="mb-4"
        id={`enclosures:${camelToKebab(enclosure)}`}
        link
      >
        {data.name}
      </Heading>
      <AmbassadorItems
        ambassadors={ambassadors}
        className="md:ml-8"
        level={3}
      />
    </div>
  );
};

const tabs = {
  all: "All Ambassadors",
  enclosures: "Enclosures",
} as const;

type TabKey = keyof typeof tabs;

const isTabKey = (key: string): key is TabKey =>
  Object.keys(tabs).includes(key);

const AmbassadorsPage: NextPage = () => {
  const [checked, setChecked] = useState(false);
  const [tab, setTab] = useState<TabKey>("all");
  const [active, setActive] = useState<string | null>(null);

  // Check the hash to see if we should be on the enclosures tab
  const checkHash = useCallback(() => {
    const match = window.location.hash.match(/^#([^:]+)(?::(.+))?$/);
    if (match && match[1] && isTabKey(match[1])) {
      setTab(match[1]);
      setActive(
        match[1] === "enclosures" &&
          match[2] &&
          isEnclosureKey(kebabToCamel(match[2]))
          ? kebabToCamel(match[2])
          : null
      );
    } else {
      setTab("all");
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

    if (tab === "all") url.hash = "";
    else if (active) url.hash = `${tab}:${active}`;
    else url.hash = tab;

    const updated = url.toString();
    if (current !== updated) window.history.pushState({}, "", updated);
  }, [checked, tab, active]);

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
          className="pointer-events-none absolute -top-8 right-0 z-10 hidden h-auto w-1/2 max-w-sm select-none lg:block"
        />
        <Image
          src={leafLeftImage1}
          alt=""
          className="pointer-events-none absolute -bottom-32 -left-8 z-10 hidden h-auto w-1/2 max-w-[10rem] -rotate-45 select-none lg:block"
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
          <div className="my-4 flex flex-col items-center gap-4">
            <div className="border-b border-alveus-green/50 text-center text-xl font-semibold">
              <ul className="flex flex-wrap items-end justify-center">
                {typeSafeObjectEntries(tabs).map(([key, val]) => (
                  <li key={key} className="mx-4">
                    <button
                      type="button"
                      onClick={() => {
                        setTab(key);
                        setActive(null);
                      }}
                      className={classes(
                        "group relative inline-block p-4 transition-colors hover:border-alveus-green-500 hover:text-alveus-green-500",
                        tab === key && "text-alveus-green-700"
                      )}
                      aria-current={tab === key ? "page" : undefined}
                    >
                      {val}

                      <div
                        className={classes(
                          "absolute inset-x-0 -bottom-0.5 h-1 w-full rounded-sm transition-colors group-hover:bg-alveus-green-500",
                          tab === key && "bg-alveus-green-700"
                        )}
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-center text-xl font-semibold">
              Click each ambassador for information and highlights!
            </p>
          </div>

          {tab === "all" && <AmbassadorItems ambassadors={activeAmbassadors} />}

          {tab === "enclosures" && (
            <div className="flex flex-col gap-12">
              {typeSafeObjectKeys(ambassadorsByEnclosure).map((key) => (
                <AmbassadorEnclosure
                  key={key}
                  enclosure={key}
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
