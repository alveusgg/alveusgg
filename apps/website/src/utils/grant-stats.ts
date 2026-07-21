import { getClassification } from "@alveusgg/data/build/ambassadors/classification";
import ambassadors from "@alveusgg/data/build/ambassadors/core";
import { isActiveAmbassadorEntry } from "@alveusgg/data/build/ambassadors/filters";
import { getSpecies } from "@alveusgg/data/build/ambassadors/species";
import enclosures, { type EnclosureKey } from "@alveusgg/data/build/enclosures";

import { typeSafeObjectEntries } from "@/utils/helpers";
import { convertToSlug } from "@/utils/slugs";
import { camelToKebab } from "@/utils/string-case";

export type GrantClassificationStat = {
  name: string;
  slug: string;
  count: number;
  href: string;
};

export type GrantEnclosureStat = {
  key: EnclosureKey;
  name: string;
  slug: string;
  count: number;
  href: string;
};

export type GrantAmbassadorStats = {
  ambassadorCount: number;
  speciesCount: number;
  classifications: GrantClassificationStat[];
  enclosures: GrantEnclosureStat[];
};

const activeAmbassadors = typeSafeObjectEntries(ambassadors).filter(
  isActiveAmbassadorEntry,
);

export const getGrantAmbassadorStats = (): GrantAmbassadorStats => {
  const species = new Set<string>();
  const classificationCounts = new Map<string, number>();
  const enclosureCounts = new Map<EnclosureKey, number>();

  for (const [, ambassador] of activeAmbassadors) {
    species.add(ambassador.species);

    const classification = getClassification(
      getSpecies(ambassador.species).class,
    );
    classificationCounts.set(
      classification,
      (classificationCounts.get(classification) ?? 0) + 1,
    );

    enclosureCounts.set(
      ambassador.enclosure,
      (enclosureCounts.get(ambassador.enclosure) ?? 0) + 1,
    );
  }

  const classificationOrder = [
    "Mammals",
    "Birds",
    "Reptiles & Amphibians",
    "Invertebrates",
  ];

  const classifications = [...classificationCounts.entries()]
    .filter(([name]) => name !== "Plants")
    .sort(([aName], [bName]) => {
      const aIndex = classificationOrder.indexOf(aName);
      const bIndex = classificationOrder.indexOf(bName);
      const aOrder = aIndex === -1 ? classificationOrder.length : aIndex;
      const bOrder = bIndex === -1 ? classificationOrder.length : bIndex;
      return aOrder - bOrder || aName.localeCompare(bName);
    })
    .map(([name, count]) => ({
      name,
      slug: convertToSlug(name),
      count,
      href: `/ambassadors#classification:${convertToSlug(name)}`,
    }));

  const enclosureStats = [...enclosureCounts.entries()]
    .sort(([, a], [, b]) => b - a)
    .map(([key, count]) => ({
      key,
      name: enclosures[key].name,
      slug: camelToKebab(key),
      count,
      href: `/ambassadors#enclosures:${camelToKebab(key)}`,
    }));

  return {
    ambassadorCount: activeAmbassadors.length,
    speciesCount: species.size,
    classifications,
    enclosures: enclosureStats,
  };
};
