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
  return res.json({ ambassadors });
}
