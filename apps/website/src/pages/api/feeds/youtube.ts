import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { parseStringPromise } from "xml2js";
import { z } from "zod";

// Define the schema for the expected structure of the feed entries
const VideoSchema = z.object({
  videoId: z.string(),
  title: z.string(),
  published: z.date(),
});

type Video = z.infer<typeof VideoSchema>;

// Define the schema for the entire feed
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

const fetchYouTubeFeed = async (channelId: string): Promise<Video[]> => {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  const response = await axios.get(url);
  const json = await parseStringPromise(response.data);
  const parsedFeed = FeedSchema.parse(json);

  return parsedFeed.feed.entry
    .map((entry) => ({
      videoId: entry["yt:videoId"][0],
      title: entry.title[0],
      published: new Date(entry.published[0]),
    }))
    .filter((video) => !video.title.includes("#shorts"))
    .map((video) => VideoSchema.parse(video)); // Validate each video against the schema
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const channelIds = ["UCbJ-1yM55NHrR1GS9hhPuvg", "UCfisf6HxiQr8_4mctNBm9cQ"];
    const fetchPromises = channelIds.map((channelId) =>
      fetchYouTubeFeed(channelId),
    );
    const videosArrays = await Promise.all(fetchPromises);

    // Combine videos from all channels and sort by published date
    const combinedVideos = videosArrays
      .flat()
      .sort((a, b) => b.published.getTime() - a.published.getTime());
    const latestVideos = combinedVideos.slice(0, 5);

    res.status(200).json(latestVideos);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch YouTube feed" });
  }
};

export default handler;
