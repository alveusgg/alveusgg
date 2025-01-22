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
import {
  getSpecies,
  type Species,
} from "@alveusgg/data/src/ambassadors/species";
import { getIUCNStatus } from "@alveusgg/data/src/iucn";

import { createImageUrl } from "@/utils/image";
import {
  typeSafeObjectEntries,
  typeSafeObjectFromEntries,
} from "@/utils/helpers";
import { env } from "@/env";

// If these types change, the extension schema MUST be updated as well
type AmbassadorV2 = Omit<ActiveAmbassador, "species"> & {
  image: Omit<AmbassadorImage, "src"> & { src: string };
  species: Omit<Species, "iucn" | "class"> & {
    iucn: Species["iucn"] & { title: string };
    class: { name: Species["class"]; title: string };
  };
};

export type AmbassadorsResponse = {
  v2: Record<string, AmbassadorV2>;
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
};

// API for extension
export async function GET() {
  const resp: AmbassadorsResponse = { v2: ambassadorsV2 };
  return Response.json(resp, { headers });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers });
}

// Cache the response for 30 minutes
export const dynamic = "force-static";
export const revalidate = 1800;
export const runtime = "edge";
