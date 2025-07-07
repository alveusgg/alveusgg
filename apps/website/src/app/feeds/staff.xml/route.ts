import { Feed } from "feed";

import { env } from "@/env";

import staff from "@/data/staff";

export async function GET() {
  const staffPageUrl = `${env.NEXT_PUBLIC_BASE_URL}/about/staff`;

  const feed = new Feed({
    title: "Alveus Sanctuary Staff",
    description: "A feed for new staff members",
    id: staffPageUrl,
    link: staffPageUrl,
    copyright: "Copyright 2023 Alveus Sanctuary Inc. and the Alveus.gg team",
    updated: undefined, // Since the latest staff join date is unavailable
  });

  Object.entries(staff).forEach(([key, person]) => {
    const personUrl = `${staffPageUrl}#${key}`;

    feed.addItem({
      title: person.name,
      id: personUrl,
      link: personUrl,
      description: person.title,
      content: person.title,
      date: new Date(), // A date is required, but they aren't available for staff
    });
  });

  return new Response(feed.rss2(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
