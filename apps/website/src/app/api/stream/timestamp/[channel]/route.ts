import { getCurrentVod } from "@/server/apis/twitch";

import { channels, isChannel } from "@/data/twitch";

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
  if (!isChannel(channel) || !Object.hasOwn(channels, channel)) {
    return new Response("Twitch channel not available", { status: 404 });
  }

  try {
    const vod = await getCurrentVod(channels[channel].id);
    let resp = "Twitch timestamp not available";

    if (vod) {
      // Get the timestamp for the current VoD based on the elapsed time since its creation
      const elapsed = Math.max(
        0,
        Math.floor((Date.now() - new Date(vod.created_at).getTime()) / 1000),
      );
      const hours = Math.floor(elapsed / 3600);
      const minutes = Math.floor((elapsed % 3600) / 60);
      const seconds = elapsed % 60;
      const url = new URL(vod.url);
      url.searchParams.set("t", `${hours}h${minutes}m${seconds}s`);
      resp = url.toString();
    }

    return new Response(resp, {
      headers: {
        // Response can be cached for 30 seconds
        "Cache-Control": "max-age=30, s-maxage=30, must-revalidate",
        "X-Generated-At": new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("Error getting Twitch timestamp", err);
    return new Response("Twitch timestamp not available", { status: 500 });
  }
}
