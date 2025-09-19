import { channels as youTubeChannels } from "@/data/youtube";

import { getYouTubeRssFeedContent } from "@/utils/rss-feed";

export async function GET() {
  const channelUrl = youTubeChannels.highlights.uri;
  const channelIds = [youTubeChannels.highlights.id];

  try {
    const videoFeedContent = await getYouTubeRssFeedContent(
      {
        title: "Alveus Sanctuary - Highlights YouTube Channel",
        description:
          "A feed for new videos on the Alveus Sanctuary highlights YouTube channel",
        id: "alveus:youtube:highlights-channel",
        link: channelUrl,
      },
      channelIds,
    );

    return new Response(videoFeedContent, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
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
