import { z } from "zod";

import { env } from "@/env";

import { channels } from "@/data/youtube";

const PlaylistItemListResponseSchema = z.object({
  nextPageToken: z.string().optional(),
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

// Each page of a playlist has up to 50 items. When fetching all pages, stop
// after this many as a safety limit
const MAX_PLAYLIST_PAGES = 20;

const fetchYouTubePlaylist = async (
  playlistId: string,
  { allPages = false }: { allPages?: boolean } = {},
): Promise<YouTubeVideo[]> => {
  const apiKey = env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error("Missing YouTube API key");

  const videos: YouTubeVideo[] = [];
  let pageToken: string | undefined;
  for (let page = 0; page < (allPages ? MAX_PLAYLIST_PAGES : 1); page++) {
    const requestURL = new URL(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50`,
    );
    requestURL.searchParams.set("playlistId", playlistId);
    requestURL.searchParams.set("key", apiKey);
    if (pageToken) requestURL.searchParams.set("pageToken", pageToken);

    const resp = await fetch(requestURL);
    if (!resp.ok) {
      throw new Error(`Failed to fetch YouTube feed: ${resp.statusText}`);
    }

    const json = await resp.json();
    const parsed = PlaylistItemListResponseSchema.parse(json);

    videos.push(
      ...parsed.items.map((item) => {
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
      }),
    );

    pageToken = parsed.nextPageToken;
    if (!pageToken) break;
  }

  return videos;
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

const VideoListResponseSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      snippet: z.object({
        // Upload date (a playlist item's publishedAt is when it was added)
        publishedAt: z.coerce.date(),
        title: z.string(),
        thumbnails: z.partialRecord(
          z.literal(["default", "medium", "high", "standard", "maxres"]),
          z.object({ url: z.url() }),
        ),
      }),
      statistics: z.object({
        // Missing when the owner hides the count
        viewCount: z.coerce.number().optional(),
      }),
    }),
  ),
});

// The videos endpoint accepts up to 50 ids per request
const MAX_VIDEO_IDS_PER_REQUEST = 50;

export interface YouTubePlaylistVideo {
  id: string;
  title: string;
  published: Date;
  views: number;
  thumbnail: string | null;
}

// Videos in a playlist with their view counts and upload dates. Videos that
// are private or deleted are not returned by the videos endpoint, so are left out
const fetchYouTubePlaylistVideos = async (
  playlistId: string,
): Promise<YouTubePlaylistVideo[]> => {
  const apiKey = env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error("Missing YouTube API key");

  const ids = [
    ...new Set(
      (await fetchYouTubePlaylist(playlistId, { allPages: true })).map(
        (video) => video.id,
      ),
    ),
  ];

  const batches: string[][] = [];
  for (let i = 0; i < ids.length; i += MAX_VIDEO_IDS_PER_REQUEST) {
    batches.push(ids.slice(i, i + MAX_VIDEO_IDS_PER_REQUEST));
  }

  const responses = await Promise.all(
    batches.map(async (batch) => {
      const requestURL = new URL(
        "https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics",
      );
      requestURL.searchParams.set("id", batch.join(","));
      requestURL.searchParams.set("key", apiKey);

      const resp = await fetch(requestURL);
      if (!resp.ok) {
        throw new Error(`Failed to fetch YouTube videos: ${resp.statusText}`);
      }

      return VideoListResponseSchema.parse(await resp.json()).items;
    }),
  );

  return responses.flat().map((video) => {
    const { thumbnails } = video.snippet;
    const thumbnail =
      thumbnails.maxres ??
      thumbnails.standard ??
      thumbnails.high ??
      thumbnails.medium ??
      thumbnails.default;

    return {
      id: video.id,
      title: video.snippet.title,
      published: video.snippet.publishedAt,
      views: video.statistics.viewCount ?? 0,
      thumbnail: thumbnail?.url ?? null,
    };
  });
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

const fetchYouTubePlaylistVideosCached = (playlistId: string) => {
  const cached = playlistVideosCache.get(playlistId);
  if (cached && cached.expires > Date.now()) return cached.videos;

  const videos = fetchYouTubePlaylistVideos(playlistId);
  playlistVideosCache.set(playlistId, {
    expires: Date.now() + PLAYLIST_CACHE_TTL_MS,
    videos,
  });
  videos.catch(() => {
    if (playlistVideosCache.get(playlistId)?.videos === videos) {
      playlistVideosCache.delete(playlistId);
    }
  });

  return videos;
};

// Never throws: returns an empty list when there is no API key (e.g. local
// development) or the request fails, so callers can fall back
export const fetchYouTubePlaylistVideosSafe = async (
  playlistId: string,
): Promise<YouTubePlaylistVideo[]> => {
  if (!env.YOUTUBE_API_KEY) return [];

  try {
    return await fetchYouTubePlaylistVideosCached(playlistId);
  } catch (error) {
    console.error(
      `Failed to fetch YouTube videos for playlist ${playlistId}:`,
      error,
    );
    return [];
  }
};
