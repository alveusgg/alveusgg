import { fetchYouTubeVideos } from "@/server/apis/youtube";

import { channels as youTubeChannels } from "@/data/youtube";

import { getRssFeedContent } from "@/utils/rss-feed";

export async function GET() {
  const channelUrl = youTubeChannels.alveus.uri;
  const channels = [youTubeChannels.alveus.id, youTubeChannels.highlights.id];

  const latestVideos = await Promise.all(
    channels.map((channelId) => fetchYouTubeVideos(channelId)),
  ).then((feeds) =>
    feeds.flat().sort((a, b) => b.published.getTime() - a.published.getTime()),
  );

  const latestVideoDate = latestVideos[0]?.published;

  const videoFeedItems = latestVideos
    .map((video) => ({
      ...video,
      url: `https://www.youtube.com/watch?v=${encodeURIComponent(video.id)}`,
    }))
    .map((video) => ({
      title: video.title,
      id: video.url,
      link: video.url,
      description: undefined,
      date: video.published,
    }));

  const videoFeedContent = getRssFeedContent({
    title: "Alveus Sanctuary - All YouTube Channel Videos",
    description:
      "A feed for all new videos on all Alveus Sanctuary YouTube channels",
    id: "alveus:youtube:all-channels",
    link: channelUrl,
    updated: latestVideoDate,
    items: videoFeedItems,
  });

  return new Response(videoFeedContent, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
