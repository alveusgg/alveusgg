import { fetchYouTubeVideos } from "@/server/apis/youtube";

import { channels } from "@/data/youtube";

const isChannel = (channel: string): channel is keyof typeof channels =>
  channel in channels;

// API for chat bot
export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      channel: string;
    }>;
  },
) {
  const { channel } = await params;
  if (!isChannel(channel)) {
    return new Response("YouTube channel not available", { status: 404 });
  }

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
