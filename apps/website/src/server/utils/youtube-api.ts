import { parseStringPromise } from "xml2js";
import { z } from "zod";

const FeedSchema = z.object({
  feed: z.object({
    entry: z.array(
      z.object({
        "yt:videoId": z.array(z.string()).nonempty(),
        title: z.array(z.string()).nonempty(),
        published: z.array(z.string()).nonempty(),
      }),
    ),
  }),
});

export const fetchYouTubeFeed = async (
  type: "channel" | "playlist",
  id: string,
) => {
  const url = `https://www.youtube.com/feeds/videos.xml?${type}_id=${id}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch YouTube feed: ${response.statusText}`);
  }

  const xml = await response.text();
  const json = await parseStringPromise(xml);
  console.log(json);
  return FeedSchema.parse(json).feed.entry;
};

export interface YouTubeVideo {
  id: string;
  title: string;
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
        id: entry["yt:videoId"][0],
        title: entry.title[0],
        published: new Date(entry.published[0]),
      })),
  );
};
