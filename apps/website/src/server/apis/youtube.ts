import { parseStringPromise } from "xml2js";
import { z } from "zod";

const ItemSchema = z.object({
  id: z
    .array(z.string())
    .nonempty()
    .transform((x) => x[0]),
  title: z
    .array(z.string())
    .nonempty()
    .transform((x) => x[0]),
  author: z
    .array(
      z.object({
        name: z
          .array(z.string())
          .nonempty()
          .transform((x) => x[0]),
        uri: z
          .array(z.string())
          .nonempty()
          .transform((x) => x[0]),
      }),
    )
    .nonempty()
    .transform((x) => x[0]),
  published: z
    .array(z.string().datetime({ offset: true }))
    .nonempty()
    .transform((x) => new Date(x[0])),
});

const FeedSchema = z.object({
  feed: ItemSchema.extend({
    entry: z.array(
      ItemSchema.extend({
        "media:group": z
          .array(
            z.object({
              "media:description": z
                .array(z.string())
                .nonempty()
                .transform((x) => x[0]),
            }),
          )
          .nonempty()
          .transform((x) => x[0]),
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
  const json = await parseStringPromise(xml);
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
