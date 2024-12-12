import type { NextApiRequest, NextApiResponse } from "next";

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
import { getIUCNStatus } from "@alveusgg/data/src/iucn";

import { env } from "@/env";

import {
  typeSafeObjectEntries,
  typeSafeObjectFromEntries,
} from "@/utils/helpers";
import { createImageUrl } from "@/utils/image";

// If these types change, the extension schema MUST be updated as well
type Ambassador = Omit<ActiveAmbassador, "iucn" | "class"> & {
  image: Omit<AmbassadorImage, "src"> & { src: string };
  iucn: ActiveAmbassador["iucn"] & { title: string };
  class: { name: ActiveAmbassador["class"]; title: string };
};
export type AmbassadorsResponse = {
  ambassadors: Record<string, Ambassador>;
};

const ambassadors = typeSafeObjectFromEntries(
  typeSafeObjectEntries(allAmbassadors)
    .filter(isActiveAmbassadorEntry)
    .map<[string, Ambassador]>(([key, val]) => {
      const image = getAmbassadorImages(key)[0];

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
          iucn: {
            ...val.iucn,
            title: getIUCNStatus(val.iucn.status),
          },
          class: {
            name: val.class,
            title: getClassification(val.class),
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
  return res.json({ ambassadors });
}
