import { env } from "@/env";

import staff from "@/data/staff";

import { getRssFeedContent } from "@/utils/rss-feed";

export async function GET() {
  const staffPageUrl = `${env.NEXT_PUBLIC_BASE_URL}/about/staff`;

  const staffKeys = Object.keys(staff);
  const lastStaffKey = staffKeys[staffKeys.length - 1] || "maya";
  const lastStaffMember = staff[lastStaffKey];
  const latestStaffJoinDate = lastStaffMember?.joinDate;

  const staffFeedItems = Object.entries(staff)
    .map(([key, person]) => ({ ...person, url: `${staffPageUrl}#${key}` }))
    .map((person) => ({
      title: person.name,
      id: person.url,
      link: person.url,
      description: person.title,
      date: person.joinDate,
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
