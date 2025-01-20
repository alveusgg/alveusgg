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
export async function GET(request: Request) {
  try {
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
    const resp: YouTubeResponse = typeSafeObjectFromEntries(latestVideos);
    return Response.json(resp, {
      headers: {
        // Response can be cached for 30 minutes
        // And can be stale for 5 minutes while revalidating
        "Cache-Control":
          "max-age=1800, s-maxage=1800, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    console.error("Error getting YouTube videos", err);
  }

  return new Response("YouTube data not available", { status: 500 });
}

// Cache the response for 30 minutes
export const dynamic = "force-static";
export const revalidate = 1800;
export const runtime = "edge";
