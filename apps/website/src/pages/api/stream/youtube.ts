import type { NextApiRequest, NextApiResponse } from "next";

import { fetchYouTubeVideos, type YouTubeVideo } from "@/server/apis/youtube";

import {
  typeSafeObjectEntries,
  typeSafeObjectFromEntries,
} from "@/utils/helpers";
import { channels } from "@/data/youtube";

type Keys = keyof typeof channels;

export type YouTubeResponse = {
  [key in Keys]: YouTubeVideo | null;
};

// API for chat bot
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<YouTubeResponse | string>,
) {
  // Response can be cached for 30 minutes
  // And can be stale for 5 minutes while revalidating
  res.setHeader(
    "Cache-Control",
    "max-age=1800, s-maxage=1800, stale-while-revalidate=300",
  );

  // Fetch the latest video for each channel
  const latestVideos: [Keys, YouTubeVideo | null][] = await Promise.all(
    typeSafeObjectEntries(channels).map(async ([key, { id }]) => {
      const videos = await fetchYouTubeVideos(id);
      const latest = videos.sort(
        (a, b) => b.published.getTime() - a.published.getTime(),
      )[0];
      return [key, latest ?? null];
    }),
  );

  // Return the actual data
  return res.json(typeSafeObjectFromEntries(latestVideos));
}
