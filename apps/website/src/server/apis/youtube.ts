import { XMLParser } from "fast-xml-parser";
import { z } from "zod/v4";

import { env } from "@/env";

import { channels } from "@/data/youtube";

const ItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  author: z.object({
    name: z.string(),
    uri: z.url(),
  }),
  published: z.iso.datetime({ offset: true }).transform((x) => new Date(x)),
});

const FeedSchema = z.object({
  feed: ItemSchema.extend({
    entry: z.array(
      ItemSchema.extend({
        "media:group": z.object({
          "media:description": z.string(),
        }),
      }),
    ),
  }),
});

export const fetchYouTubeFeed = async (
  type: "channel" | "playlist",
  id: string,
) => {
  const resp = await fetch(
    `https://www.youtube.com/feeds/videos.xml?${type}_id=${id}`,
  );
  if (!resp.ok) {
    throw new Error(`Failed to fetch YouTube feed: ${resp.statusText}`);
  }

  const xml = await resp.text();
  const parser = new XMLParser();
  const json = parser.parse(xml);
  return FeedSchema.parse(json).feed.entry;
};

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  author: { id: string; name: string; uri: string };
  published: Date;
}

export const fetchYouTubeVideos = async (
  channelId: string,
): Promise<YouTubeVideo[]> => {
  if (!channelId.startsWith("UC"))
    throw new Error("Invalid YouTube channel ID");

  const custom = Object.values(channels).find(
    (channel) => channel.id === channelId,
  );

  // Get the built-in videos playlist for the channel
  // This contains only long-form videos, not shorts or live streams (or VoDs)
  // See https://stackoverflow.com/a/76602819 for other playlist prefixes
  return fetchYouTubeFeed("playlist", channelId.replace(/^UC/, "UULF")).then(
    (feed) =>
      feed
        .map((entry) => ({
          id: entry.id.replace(/^yt:video:/, ""),
          title: entry.title,
          description: entry["media:group"]["media:description"],
          author: {
            id: channelId,
            name: custom?.name ?? entry.author.name,
            uri: custom?.uri ?? entry.author.uri,
          },
          published: entry.published,
        }))
        // If a title contains a hashtag, remove it as a precaution
        // We've seen YouTube accidentally include shorts in this playlist
        .filter((entry) => !/\W#\w/.test(entry.title)),
  );
};

const SearchSchema = z.object({
  kind: z.literal("youtube#searchListResponse"),
  pageInfo: z.object({
    totalResults: z.number(),
    resultsPerPage: z.number(),
  }),
  items: z.array(
    z.object({
      kind: z.literal("youtube#searchResult"),
      id: z.object({
        kind: z.literal("youtube#video"),
        videoId: z.string(),
      }),
      snippet: z.object({
        title: z.string(),
        description: z.string(),
        channelId: z.string(),
        channelTitle: z.string(),
        publishedAt: z.iso.datetime(),
        thumbnails: z.record(
          z.literal(["default", "medium", "high", "standard", "maxres"]),
          z
            .object({
              url: z.url(),
              width: z.number(),
              height: z.number(),
            })
            .optional(),
        ),
        liveBroadcastContent: z.literal(["none", "upcoming", "live"]),
      }),
    }),
  ),
});

export const fetchYouTubeLive = async (
  channelId: string,
): Promise<YouTubeVideo | null> => {
  const apiKey = env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error("Missing YouTube API key");

  if (!channelId.startsWith("UC"))
    throw new Error("Invalid YouTube channel ID");

  const custom = Object.values(channels).find(
    (channel) => channel.id === channelId,
  );

  const resp = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&key=${apiKey}`,
  );
  if (!resp.ok) {
    throw new Error(`Failed to fetch YouTube feed: ${resp.statusText}`);
  }

  const json = await resp.json();
  const parsed = SearchSchema.parse(json);

  const live = parsed.items[0];
  if (!live || live.snippet.liveBroadcastContent !== "live") {
    return null;
  }

  return {
    id: live.id.videoId,
    title: live.snippet.title,
    description: live.snippet.description,
    author: {
      id: channelId,
      name: custom?.name ?? live.snippet.channelTitle,
      uri:
        custom?.uri ??
        `https://www.youtube.com/channel/${live.snippet.channelId}`,
    },
    published: new Date(live.snippet.publishedAt),
  };
};
