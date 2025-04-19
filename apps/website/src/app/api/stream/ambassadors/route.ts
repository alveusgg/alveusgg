import allAmbassadors from "@alveusgg/data/build/ambassadors/core";
import {
  isActiveAmbassadorEntry,
  type ActiveAmbassador,
} from "@alveusgg/data/build/ambassadors/filters";
import {
  getAmbassadorImages,
  type AmbassadorImage,
} from "@alveusgg/data/build/ambassadors/images";
import { getClassification } from "@alveusgg/data/build/ambassadors/classification";
import {
  getSpecies,
  type Species,
} from "@alveusgg/data/build/ambassadors/species";
import enclosures from "@alveusgg/data/build/enclosures";
import { getIUCNStatus } from "@alveusgg/data/build/iucn";

import { createImageUrl } from "@/utils/image";
import {
  typeSafeObjectEntries,
  typeSafeObjectFromEntries,
} from "@/utils/helpers";
import { env } from "@/env";

// If these types change, the extension schema MUST be updated as well
type AmbassadorV2 = Omit<ActiveAmbassador, "species" | "enclosure"> & {
  image: Omit<AmbassadorImage, "src"> & { src: string };
  species: Omit<Species, "iucn" | "class"> & {
    iucn: Species["iucn"] & { title: string };
    class: { name: string; title: string };
  };
  enclosure: string;
};

type AmbassadorV3 = Omit<ActiveAmbassador, "species" | "enclosure"> & {
  image: Omit<AmbassadorImage, "src"> & { src: string };
  species: Omit<Species, "iucn" | "class"> & {
    key: string;
    iucn: Species["iucn"] & { title: string };
    class: { key: string; title: string };
  };
  enclosure: {
    key: string;
    title: string;
  };
};

export type AmbassadorsResponse = {
  v2: Record<string, AmbassadorV2>;
  v3: Record<string, AmbassadorV3>;
};

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
          enclosure: enclosures[val.enclosure].name,
        },
      ];
    }),
);

const ambassadorsV3 = typeSafeObjectFromEntries(
  typeSafeObjectEntries(allAmbassadors)
    .filter(isActiveAmbassadorEntry)
    .map<[string, AmbassadorV3]>(([key, val]) => {
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
            key: val.species,
            iucn: {
              ...species.iucn,
              title: getIUCNStatus(species.iucn.status),
            },
            class: {
              key: species.class,
              title: getClassification(species.class),
            },
          },
          enclosure: {
            key: val.enclosure,
            title: enclosures[val.enclosure].name,
          },
        },
      ];
    }),
);

const headers = {
  // Response can be cached for 30 minutes
  // And can be stale for 5 minutes while revalidating
  "Cache-Control": "max-age=1800, s-maxage=1800, stale-while-revalidate=300",

  // Vercel doesn't respect Vary so we allow all origins to use this
  // Ideally we'd just allow specifically localhost + *.ext-twitch.tv
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Max-Age": "86400",
};

// API for extension
export async function GET() {
  const resp: AmbassadorsResponse = { v2: ambassadorsV2, v3: ambassadorsV3 };
  return Response.json(resp, { headers });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      ...headers,
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

// Cache the response for 30 minutes
export const dynamic = "force-static";
export const revalidate = 1800;
// export const runtime = "edge"; // Not compatible with force-static
