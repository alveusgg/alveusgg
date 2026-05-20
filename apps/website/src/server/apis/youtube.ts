import { z } from "zod";

import { env } from "@/env";

import { channels } from "@/data/youtube";

const PlaylistItemListResponseSchema = z.object({
  items: z.array(
    z.object({
      snippet: z.object({
        publishedAt: z.coerce.date(),
        channelId: z.string(),
        title: z.string(),
        description: z.string(),
        channelTitle: z.string(),
        resourceId: z.object({
          kind: z.string(),
          videoId: z.string(),
        }),
      }),
    }),
  ),
});

const fetchYouTubePlaylist = async (
  playlistId: string,
): Promise<YouTubeVideo[]> => {
  const apiKey = env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error("Missing YouTube API key");

  const requestURL = new URL(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50`,
  );
  requestURL.searchParams.set("playlistId", playlistId);
  requestURL.searchParams.set("key", apiKey);

  const resp = await fetch(requestURL);
  if (!resp.ok) {
    throw new Error(`Failed to fetch YouTube feed: ${resp.statusText}`);
  }

  const json = await resp.json();

  return PlaylistItemListResponseSchema.parse(json).items.map((item) => {
    const custom = Object.values(channels).find(
      (channel) => channel.id === item.snippet.channelId,
    );

    return {
      id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      author: {
        id: item.snippet.channelId,
        name: custom?.name ?? item.snippet.channelTitle,
        uri:
          custom?.uri ??
          "https://youtube.com/channel/" +
            encodeURIComponent(item.snippet.channelId),
      },
      published: item.snippet.publishedAt,
    };
  });
};

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  author: { id: string; name: string; uri: string };
  published: Date;
}

export const fetchYouTubeVideosSafe = async (
  channelId: string,
): Promise<YouTubeVideo[]> => {
  if (!channelId.startsWith("UC"))
    throw new Error("Invalid YouTube channel ID");

  try {
    return (
      // Get the built-in videos playlist for the channel
      // This contains only long-form videos, not shorts or live streams (or VoDs)
      // See https://stackoverflow.com/a/76602819 for other playlist prefixes
      (await fetchYouTubePlaylist(channelId.replace(/^UC/, "UULF")))
        // If a title contains a hashtag, remove it as a precaution
        // We've seen YouTube accidentally include shorts in this playlist
        .filter((entry) => !/\W#\w/.test(entry.title))
    );
  } catch (error) {
    console.error(
      `Failed to fetch YouTube videos for channel ${channelId}:`,
      error,
    );
    return [];
  }
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
