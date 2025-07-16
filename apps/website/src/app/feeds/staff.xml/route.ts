import { env } from "@/env";

import staff from "@/data/staff";

import { getRssFeedContent } from "@/utils/rss-feed";

export async function GET() {
  const staffPageUrl = `${env.NEXT_PUBLIC_BASE_URL}/about/staff`;

  const staffFeedItems = Object.entries(staff)
    .map(([key, person]) => ({ ...person, url: `${staffPageUrl}#${key}` }))
    .map((person) => ({
      title: person.name,
      id: person.url,
      link: person.url,
      description: person.title,
      content: person.title,
      date: new Date(), // A date is required, but they aren't available for staff
    }));

  const staffFeedContent = getRssFeedContent({
    title: "Alveus Sanctuary Staff",
    description: "A feed for new staff members",
    id: staffPageUrl,
    link: staffPageUrl,
    updated: undefined, // Since the latest staff join date is unavailable
    items: staffFeedItems,
  });

  return new Response(staffFeedContent, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
