import { Feed } from "feed";

import { fetchYouTubeVideos } from "@/server/apis/youtube";

export type RssFeedItem = {
  title: string;
  id: string;
  link: string;
  description: string | undefined;
  date: Date;
};

export type RssFeedParameters = {
  title: string;
  description: string;
  id: string;
  link: string;
  updated: Date | undefined;
  items: Array<RssFeedItem>;
};

export function getRssFeedContent(options: RssFeedParameters) {
  const feed = new Feed({
    title: options.title,
    description: options.description,
    id: options.id,
    link: options.link,
    copyright: "Copyright 2023 Alveus Sanctuary Inc. and the Alveus.gg team",
    updated: options.updated,
  });

  options.items.forEach((item) => {
    feed.addItem({
      title: item.title,
      id: item.id,
      link: item.link,
      description: item.description,
      date: item.date,
    });
  });

  return feed.rss2();
}

export type YouTubeRssFeedParameters = {
  title: string;
  description: string;
  id: string;
  link: string;
};

export async function getYouTubeRssFeedContent(
  options: YouTubeRssFeedParameters,
  channelIds: string[],
) {
  const latestVideos = await Promise.all(
    channelIds.map((channelId) => fetchYouTubeVideos(channelId)),
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
      id: video.id,
      link: video.url,
      description: undefined,
      date: video.published,
    }));

  const videoFeedContent = getRssFeedContent({
    title: options.title,
    description: options.description,
    id: options.id,
    link: options.link,
    updated: latestVideoDate,
    items: videoFeedItems,
  });

  return videoFeedContent;
}
