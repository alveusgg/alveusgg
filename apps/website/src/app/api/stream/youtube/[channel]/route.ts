import { fetchYouTubeVideos } from "@/server/apis/youtube";

import { channels } from "@/data/youtube";
import { typeSafeObjectKeys } from "@/utils/helpers";

type Channel = keyof typeof channels;
type Params = {
  channel: Channel;
};

// Only allow known channels
export const dynamicParams = false;
export function generateStaticParams(): Params[] {
  return typeSafeObjectKeys(channels).map((channel) => ({ channel }));
}

// API for chat bot
export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<Params>;
  },
) {
  const { channel } = await params;

  try {
    const videos = await fetchYouTubeVideos(channels[channel].id);
    const latest = videos.sort(
      (a, b) => b.published.getTime() - a.published.getTime(),
    )[0];
    const resp = latest
      ? `${latest.title} - https://youtu.be/${latest.id}`
      : "No videos found";

    return new Response(resp, {
      headers: {
        // Response can be cached for 5 minutes
        "Cache-Control": "max-age=300, s-maxage=300, must-revalidate",
        "X-Generated-At": new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("Error getting YouTube videos", err);
    return new Response("YouTube data not available", { status: 500 });
  }
}

// Cache the response for 5 minutes
export const dynamic = "force-static";
export const revalidate = 300;
