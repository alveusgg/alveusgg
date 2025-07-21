import { channels as youTubeChannels } from "@/data/youtube";

import { getYouTubeRssFeedContent } from "@/utils/rss-feed";

export async function GET() {
  const channelUrl = youTubeChannels.alveus.uri;
  const channelIds = [youTubeChannels.alveus.id, youTubeChannels.highlights.id];

  const videoFeedContent = await getYouTubeRssFeedContent(
    {
      title: "Alveus Sanctuary - All YouTube Channel Videos",
      description:
        "A feed for all new videos on all Alveus Sanctuary YouTube channels",
      id: "alveus:youtube:all-channels",
      link: channelUrl,
    },
    channelIds,
  );

  return new Response(videoFeedContent, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
