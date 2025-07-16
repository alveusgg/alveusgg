import { fetchYouTubeVideos } from "@/server/apis/youtube";

import { channels as youTubeChannels } from "@/data/youtube";

import { getRssFeedContent } from "@/utils/rss-feed";

export async function GET() {
  const channelUrl = youTubeChannels.highlights.uri;
  const channels = [youTubeChannels.highlights.id];

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
    title: "Alveus Sanctuary - Highlights YouTube Channel Videos",
    description:
      "A feed for new videos on the Alveus Sanctuary highlights YouTube channel",
    id: "alveus:youtube:highlights-channel",
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
