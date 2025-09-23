import { env } from "@/env";

import staff from "@/data/staff";

import { parsePartialDateString } from "@/utils/datetime-partial";
import { getRssFeedContent } from "@/utils/rss-feed";

export async function GET() {
  const staffPageUrl = `${env.NEXT_PUBLIC_BASE_URL}/about/staff`;

  const latestStaffJoinDate = new Date(
    Math.max(
      ...Object.values(staff)
        .map((person) => parsePartialDateString(person.joined).toMillis())
        .filter((time) => time > 0),
    ),
  );

  const staffFeedItems = Object.entries(staff)
    .map(([key, person]) => ({ ...person, url: `${staffPageUrl}#${key}` }))
    .map((person) => ({
      title: person.name,
      id: person.url,
      link: person.url,
      description: person.title,
      date: parsePartialDateString(person.joined).toJSDate(),
    }));

  const staffFeedContent = getRssFeedContent({
    title: "Alveus Sanctuary Staff",
    description: "A feed for new staff members",
    id: staffPageUrl,
    link: staffPageUrl,
    updated: latestStaffJoinDate,
    items: staffFeedItems,
  });

  return new Response(staffFeedContent, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}

export const dynamic = "force-static";
