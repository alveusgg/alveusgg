import { fetchYouTubeLive } from "@/server/apis/youtube";

import { channels } from "@/data/youtube";

// Equivalent redirect for /live/twitch/chat
export async function GET() {
  try {
    const video = await fetchYouTubeLive(channels.alveus.id);
    if (!video) {
      return new Response("No live video found", { status: 404 });
    }
    const link = `https://www.youtube.com/live_chat?is_popout=1&v=${video.id}`;

    return new Response(link, {
      // Temporary redirect to the live chat as the video id changes
      status: 302,
      headers: {
        Location: link,
        Refresh: `0;url=${link}`,
        // Response can be cached for 5 minutes
        // And can be stale for 1 minute while revalidating
        "Cache-Control": "max-age=300, s-maxage=300, stale-while-revalidate=60",
      },
    });
  } catch (err) {
    console.error("Error getting YouTube live", err);
    return new Response("YouTube data not available", { status: 500 });
  }
}

// Cache the response for 5 minutes
export const dynamic = "force-static";
export const revalidate = 300;
