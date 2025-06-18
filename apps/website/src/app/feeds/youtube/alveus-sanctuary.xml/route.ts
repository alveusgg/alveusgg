import { Feed } from "feed";

import { fetchYouTubeVideos } from "@/server/apis/youtube";

import { channels as youTubeChannels } from "@/data/youtube";

const channelUrl = youTubeChannels.alveus.uri;
const channels = [youTubeChannels.alveus.id];
const latestVideos = await Promise.all(
  channels.map((channelId) => fetchYouTubeVideos(channelId)),
).then((feeds) =>
  feeds.flat().sort((a, b) => b.published.getTime() - a.published.getTime()),
);

export async function GET() {
  const latestVideoDate = latestVideos[0]?.published;

  const feed = new Feed({
    title: "Alveus Sanctuary - Main YouTube Channel Videos",
    description:
      "A feed for new videos on the main Alveus Sanctuary YouTube channel",
    id: "alveus:youtube:main-channel",
    link: channelUrl,
    copyright: "Copyright 2023 Alveus Sanctuary Inc. and the Alveus.gg team",
    updated: latestVideoDate,
  });

  latestVideos.forEach((video) => {
    const videoUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(video.id)}`;

    feed.addItem({
      title: video.title,
      id: videoUrl,
      link: videoUrl,
      date: video.published,
    });
  });

  return new Response(feed.rss2(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
