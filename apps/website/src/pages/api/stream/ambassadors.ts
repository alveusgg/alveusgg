import type { NextApiRequest, NextApiResponse } from "next";

import { env } from "@/env";
import {
  typeSafeObjectEntries,
  typeSafeObjectFromEntries,
} from "@/utils/helpers";
import { createImageUrl } from "@/utils/image";
import allAmbassadors from "@alveusgg/data/src/ambassadors/core";
import {
  isActiveAmbassadorEntry,
  type ActiveAmbassador,
} from "@alveusgg/data/src/ambassadors/filters";
import {
  getAmbassadorImages,
  type AmbassadorImage,
} from "@alveusgg/data/src/ambassadors/images";
import { getClassification } from "@alveusgg/data/src/ambassadors/classification";
import type { Species } from "@alveusgg/data/src/ambassadors/species";
import { getSpecies } from "@alveusgg/data/src/ambassadors/species";
import { getIUCNStatus } from "@alveusgg/data/src/iucn";

// If these types change, the extension schema MUST be updated as well
type Ambassador = Omit<ActiveAmbassador, "class" | "species"> & {
  image: Omit<AmbassadorImage, "src"> & { src: string };
  species: string;
  scientific: string;
  iucn: Species["iucn"] & { title: string };
  native: Species["native"];
  lifespan: Species["lifespan"];
  class: { name: Species["class"]; title: string };
};

type AmbassadorV2 = Omit<ActiveAmbassador, "species"> & {
  image: Omit<AmbassadorImage, "src"> & { src: string };
  species: Omit<Species, "iucn" | "class"> & {
    iucn: Species["iucn"] & { title: string };
    class: { name: Species["class"]; title: string };
  };
};

export type AmbassadorsResponse = {
  ambassadors: Record<string, Ambassador>;
  v2: Record<string, AmbassadorV2>;
};

const ambassadors = typeSafeObjectFromEntries(
  typeSafeObjectEntries(allAmbassadors)
    .filter(isActiveAmbassadorEntry)
    .map<[string, Ambassador]>(([key, val]) => {
      const image = getAmbassadorImages(key)[0];
      const species = getSpecies(val.species);

      return [
        key,
        {
          ...val,
          species: species.name,
          scientific: species.scientificName,
          image: {
            ...image,
            src: `${env.NEXT_PUBLIC_BASE_URL}${createImageUrl({
              src: image.src.src,
              width: 600,
            })}`,
          },
          iucn: {
            ...species.iucn,
            title: getIUCNStatus(species.iucn.status),
          },
          native: species.native,
          lifespan: species.lifespan,
          class: {
            name: species.class,
            title: getClassification(species.class),
          },
        },
      ];
    }),
);

const ambassadorsV2 = typeSafeObjectFromEntries(
  typeSafeObjectEntries(allAmbassadors)
    .filter(isActiveAmbassadorEntry)
    .map<[string, AmbassadorV2]>(([key, val]) => {
      const image = getAmbassadorImages(key)[0];
      const species = getSpecies(val.species);

      return [
        key,
        {
          ...val,
          image: {
            ...image,
            src: `${env.NEXT_PUBLIC_BASE_URL}${createImageUrl({
              src: image.src.src,
              width: 600,
            })}`,
          },
          species: {
            ...species,
            iucn: {
              ...species.iucn,
              title: getIUCNStatus(species.iucn.status),
            },
            class: {
              name: species.class,
              title: getClassification(species.class),
            },
          },
        },
      ];
    }),
);

// API for extension
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AmbassadorsResponse | string>,
) {
  // Response can be cached for 30 minutes
  // And can be stale for 5 minutes while revalidating
  res.setHeader(
    "Cache-Control",
    "max-age=1800, s-maxage=1800, stale-while-revalidate=300",
  );

  // Vercel doesn't respect Vary so we allow all origins to use this
  // Ideally we'd just allow specifically localhost + *.ext-twitch.tv
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Max-Age", "86400");
    return res.status(200).end();
  }

  // Return the actual data
  return res.json({ ambassadors, v2: ambassadorsV2 });
}
