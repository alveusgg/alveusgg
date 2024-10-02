import type { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/server/db/client";
import { whereApproved } from "@/server/db/show-and-tell";

export type LocationFeature = {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  properties: {
    id: string;
    title: string;
    displayName: string;
    location: string;
  };
};

export type LocationResponse = {
  type: string;
  features: LocationFeature[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void | NextApiResponse> {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  const postsWithLocation =
    (await prisma.showAndTellEntry.findMany({
      where: {
        ...whereApproved,
        longitude: { not: null },
        latitude: { not: null },
      },
      select: {
        id: true,
        title: true,
        displayName: true,
        location: true,
        latitude: true,
        longitude: true,
      },
    })) ?? [];

  res.setHeader(
    "Cache-Control",
    "public, s-maxage=60, stale-while-revalidate=360",
  );

  return res.json({
    type: "FeatureCollection",
    features: postsWithLocation.map((post) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [post.longitude, post.latitude],
      },
      properties: {
        id: post.id,
        title: post.title,
        displayName: post.displayName,
        location: post.location,
      },
    })),
  });
}
