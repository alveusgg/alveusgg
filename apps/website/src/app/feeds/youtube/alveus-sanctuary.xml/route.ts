import { channels as youTubeChannels } from "@/data/youtube";

import { getYouTubeRssFeedContent } from "@/utils/rss-feed";

export async function GET() {
  const channelUrl = youTubeChannels.alveus.uri;
  const channelIds = [youTubeChannels.alveus.id];

  try {
    const videoFeedContent = await getYouTubeRssFeedContent(
      {
        title: "Alveus Sanctuary - Main YouTube Channel",
        description:
          "A feed for new videos on the main Alveus Sanctuary YouTube channel",
        id: "alveus:youtube:main-channel",
        link: channelUrl,
      },
      channelIds,
    );

    return new Response(videoFeedContent, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
      },
    });
  } catch (err) {
    console.error("Error getting YouTube videos", err);
    return new Response("YouTube data not available", { status: 500 });
  }
}
