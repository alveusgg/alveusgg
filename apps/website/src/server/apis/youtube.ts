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

const PlaylistVideoListResponseSchema = z.object({
  items: z.array(
    z.object({
      snippet: z.object({
        title: z.string(),
        resourceId: z.object({ videoId: z.string() }),
      }),
      contentDetails: z.object({
        // Upload date, missing for private and deleted videos
        videoPublishedAt: z.coerce.date().optional(),
      }),
    }),
  ),
});

export interface YouTubePlaylistVideo {
  id: string;
  title: string;
  published: Date;
}

// Videos in the first page of a playlist (up to 50), newest upload first
const fetchYouTubePlaylistVideos = async (
  playlistId: string,
): Promise<YouTubePlaylistVideo[]> => {
  const apiKey = env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error("Missing YouTube API key");

  const requestURL = new URL(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50`,
  );
  requestURL.searchParams.set("playlistId", playlistId);
  requestURL.searchParams.set("key", apiKey);

  const resp = await fetch(requestURL);
  if (!resp.ok) {
    throw new Error(`Failed to fetch YouTube playlist: ${resp.statusText}`);
  }

  return PlaylistVideoListResponseSchema.parse(await resp.json())
    .items.flatMap(({ snippet, contentDetails }) =>
      contentDetails.videoPublishedAt
        ? [
            {
              id: snippet.resourceId.videoId,
              title: snippet.title,
              published: contentDetails.videoPublishedAt,
            },
          ]
        : [],
    )
    .sort((a, b) => b.published.getTime() - a.published.getTime());
};

// Many ambassadors share a playlist, so keep each playlist's result for a
// short while: a build (or a revalidation) then fetches each playlist once.
// The promise is stored, so pages built at the same time share one request.
// A failed fetch is removed straight away, so the next request tries again.
const PLAYLIST_CACHE_TTL_MS = 10 * 60 * 1000;
const playlistVideosCache = new Map<
  string,
  { expires: number; videos: Promise<YouTubePlaylistVideo[]> }
>();

// Never throws: returns an empty list when there is no API key (e.g. local
// development) or the request fails
export const fetchYouTubePlaylistVideosSafe = async (
  playlistId: string,
): Promise<YouTubePlaylistVideo[]> => {
  if (!env.YOUTUBE_API_KEY) return [];

  let cached = playlistVideosCache.get(playlistId);
  if (!cached || cached.expires <= Date.now()) {
    cached = {
      expires: Date.now() + PLAYLIST_CACHE_TTL_MS,
      videos: fetchYouTubePlaylistVideos(playlistId),
    };
    playlistVideosCache.set(playlistId, cached);
  }

  try {
    return await cached.videos;
  } catch (error) {
    if (playlistVideosCache.get(playlistId) === cached) {
      playlistVideosCache.delete(playlistId);
    }
    console.error(
      `Failed to fetch YouTube videos for playlist ${playlistId}:`,
      error,
    );
    return [];
  }
};
