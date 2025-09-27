import { channels } from "@/data/youtube";

import { getYouTubeRssFeedContent } from "@/utils/rss-feed";

const isChannel = (channelKey: string): channelKey is keyof typeof channels =>
  channelKey in channels;

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{
      channelKey: string;
    }>;
  },
) {
  let { channelKey } = await params;
  if (!channelKey.endsWith(".xml")) {
    return new Response("RSS feed endpoint must end in .xml", { status: 404 });
  }

  channelKey = channelKey.slice(0, -4);
  if (!isChannel(channelKey)) {
    return new Response("YouTube channel not available", { status: 404 });
  }

  try {
    const channel = channels[channelKey];
    const videoFeedContent = await getYouTubeRssFeedContent(
      {
        title: `${channel.name} YouTube Channel Videos`,
        description: `A feed for all new videos on the ${channel.name} YouTube channel`,
        id: `alveus:youtube:channel:${channel.name}`,
        link: channel.uri,
      },
      [channel.id],
    );

    return new Response(videoFeedContent, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        // Response can be cached for 5 minutes
        "Cache-Control": "max-age=300, s-maxage=300, must-revalidate",
        "X-Generated-At": new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("Error getting YouTube videos", err);
    return new Response("YouTube data not available", { status: 500 });
  }
}
