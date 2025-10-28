import reactToText from "react-to-text";

import { env } from "@/env";

import events from "@/data/events";

import { getRssFeedContent } from "@/utils/rss-feed";

export async function GET() {
  const eventsPageUrl = `${env.NEXT_PUBLIC_BASE_URL}/events`;
  const latestEventDate = events[0] && new Date(events[0].date);

  const eventFeedItems = events
    .map((event) => ({
      ...event,
      url: `${env.NEXT_PUBLIC_BASE_URL}/events#${event.slug}`,
    }))
    .map((event) => ({
      title: event.name,
      id: event.url,
      link: event.url,
      description: reactToText(event.info),
      date: event.date,
    }));

  const rssFeedContent = getRssFeedContent({
    title: "Alveus Sanctuary Events",
    description: "A feed for new fundraising events",
    id: eventsPageUrl,
    link: eventsPageUrl,
    updated: latestEventDate,
    items: eventFeedItems,
  });

  return new Response(rssFeedContent, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}

export const dynamic = "force-static";
