import { XMLParser } from "fast-xml-parser";
import { z } from "zod";

const ItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  author: z.object({
    name: z.string(),
    uri: z.string().url(),
  }),
  published: z
    .string()
    .datetime({ offset: true })
    .transform((x) => new Date(x)),
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
  author: { name: string; uri: string };
  published: Date;
}

export const fetchYouTubeVideos = async (
  channelId: string,
): Promise<YouTubeVideo[]> => {
  if (!channelId.startsWith("UC"))
    throw new Error("Invalid YouTube channel ID");

  // Get the built-in videos playlist for the channel
  // This contains only long-form videos, not shorts or live streams (or VoDs)
  // See https://stackoverflow.com/a/76602819 for other playlist prefixes
  return fetchYouTubeFeed("playlist", channelId.replace(/^UC/, "UULF")).then(
    (feed) =>
      feed.map((entry) => ({
        id: entry.id.replace(/^yt:video:/, ""),
        title: entry.title,
        description: entry["media:group"]["media:description"],
        author: entry.author,
        published: entry.published,
      })),
  );
};
