import { getClassification } from "@alveusgg/data/build/ambassadors/classification";
import allAmbassadors from "@alveusgg/data/build/ambassadors/core";
import {
  type ActiveAmbassador,
  isActiveAmbassadorEntry,
} from "@alveusgg/data/build/ambassadors/filters";
import {
  type AmbassadorImage,
  getAmbassadorImages,
} from "@alveusgg/data/build/ambassadors/images";
import {
  type Species,
  getSpecies,
} from "@alveusgg/data/build/ambassadors/species";
import enclosures from "@alveusgg/data/build/enclosures";
import { getIUCNStatus } from "@alveusgg/data/build/iucn";

import { env } from "@/env";

import {
  typeSafeObjectEntries,
  typeSafeObjectFromEntries,
} from "@/utils/helpers";
import { createImageUrl } from "@/utils/image";

// If these types change, the extension schema MUST be updated as well
type AmbassadorV3 = Omit<ActiveAmbassador, "species" | "enclosure"> & {
  image: Omit<AmbassadorImage, "src"> & { src: string };
  species: Omit<Species, "iucn" | "class" | "lifespan"> & {
    key: string;
    iucn: Species["iucn"] & { title: string };
    class: { key: string; title: string };
    lifespan: {
      source: string
      wild?: number | {min: number, max: number}
      captive?: number | {min: number, max: number}
    }
  };
  enclosure: {
    key: string;
    title: string;
  };
};

type AmbassadorV4 = Omit<ActiveAmbassador, "species" | "enclosure"> & {
  image: Omit<AmbassadorImage, "src"> & { src: string };
  species: Omit<Species, "iucn" | "class" | "lifespan"> & {
    key: string;
    iucn: Species["iucn"] & { title: string };
    class: { key: string; title: string };
    lifespan: Omit<Species["lifespan"], "source"> & {
      wild: "Not Applicable" | "Unknown" | number | {min: number, max: number},
      captive: "Not Applicable" | "Unknown" | number | {min: number, max: number},
    }
  };
  enclosure: {
    key: string;
    title: string;
  };
};

export type AmbassadorsResponse = {
  v3: Record<string, AmbassadorV3>;
};

const ambassadorsV3 = typeSafeObjectFromEntries(
  typeSafeObjectEntries(allAmbassadors)
    .filter(isActiveAmbassadorEntry)
    .map<[string, AmbassadorV3]>(([key, val]) => {
      const image = getAmbassadorImages(key)[0];
      const species = getSpecies(val.species);

      const lifespan = {
        wild: typeof species.lifespan.wild == "string" ? undefined : species.lifespan.wild,
        captive: typeof species.lifespan.captive == "string" ? undefined : species.lifespan.captive,
        source: ''
      }

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
            lifespan
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
  "Cache-Control": "max-age=1800, s-maxage=1800, must-revalidate",

  // Vercel doesn't respect Vary so we allow all origins to use this
  // Ideally we'd just allow specifically localhost + *.ext-twitch.tv
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Max-Age": "86400",
};

// API for extension
export async function GET() {
  const resp: AmbassadorsResponse = { v3: ambassadorsV3 };
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

export const dynamic = "force-static";
