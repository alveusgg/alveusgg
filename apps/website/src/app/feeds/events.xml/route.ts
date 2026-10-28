import reactToText from "react-to-text";

import { env } from "@/env";

import events from "@/data/events";

import { getRssFeedContent } from "@/utils/rss-feed";

export async function GET() {
  const eventsPageUrl = `${env.NEXT_PUBLIC_BASE_URL}/about/events`;
  const latestEventDate = events[0] && new Date(events[0].date);

  const eventFeedItems = events.map((event) => ({
    title: event.name,
    // The id is the RSS guid, so keep it on the old URL to prevent readers
    // from showing every event as new after the link moved to /about/events
    id: `${env.NEXT_PUBLIC_BASE_URL}/events#${event.slug}`,
    link: `${eventsPageUrl}#${event.slug}`,
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
