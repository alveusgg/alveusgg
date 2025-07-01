import { Feed } from "feed";

import { env } from "@/env";

// Already sorted in descending order
import events from "@/data/events";

export async function GET() {
  const eventsPageUrl = `${env.NEXT_PUBLIC_BASE_URL}/events`;

  const latestEvent = events[0];
  const latestEventDate =
    (latestEvent && new Date(latestEvent.date)) || undefined;

  const feed = new Feed({
    title: "Alveus Sanctuary Events",
    description: "A feed for new fundraising events",
    id: eventsPageUrl,
    link: eventsPageUrl,
    copyright: "Copyright 2023 Alveus Sanctuary Inc. and the Alveus.gg team",
    updated: latestEventDate,
  });

  events.forEach((event) => {
    const eventPageUrl = `${env.NEXT_PUBLIC_BASE_URL}/events#${event.slug}`;

    feed.addItem({
      title: event.name,
      id: eventPageUrl,
      link: eventPageUrl,
      // description: undefined,
      // content: undefined,
      date: event.date,
    });
  });

  return new Response(feed.rss2(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
