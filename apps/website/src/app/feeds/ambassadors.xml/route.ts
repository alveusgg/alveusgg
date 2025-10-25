import allAmbassadors from "@alveusgg/data/build/ambassadors/core";
import { isActiveAmbassadorEntry } from "@alveusgg/data/build/ambassadors/filters";

import { env } from "@/env";

import { typeSafeObjectEntries } from "@/utils/helpers";
import { getRssFeedContent } from "@/utils/rss-feed";
import { camelToKebab } from "@/utils/string-case";

// Get all active ambassadors & sort in descending order by date
const activeAmbassadors = typeSafeObjectEntries(allAmbassadors)
  .filter(isActiveAmbassadorEntry)
  .map(([, ambassador]) => ambassador);
const sortedActiveAmbassadors = activeAmbassadors.toSorted(
  (a, b) => new Date(b.arrival).valueOf() - new Date(a.arrival).valueOf(),
);

export async function GET() {
  const allAmbassadorsPageUrl = `${env.NEXT_PUBLIC_BASE_URL}/ambassadors`;
  const latestArrivalDate =
    sortedActiveAmbassadors[0] && new Date(sortedActiveAmbassadors[0].arrival);

  const ambassadorFeedItems = sortedActiveAmbassadors
    .map((ambassador) => ({
      ...ambassador,
      url: `${env.NEXT_PUBLIC_BASE_URL}/ambassadors/${camelToKebab(ambassador.name)}`,
    }))
    .map((ambassador) => ({
      title: ambassador.name,
      id: ambassador.url,
      link: ambassador.url,
      description: `${ambassador.name} is an Alveus Ambassador. ${ambassador.story} ${ambassador.mission}`,
      date: new Date(ambassador.arrival),
    }));

  const ambassadorFeedContent = getRssFeedContent({
    title: "Alveus Sanctuary Ambassadors",
    description: "A feed for new ambassador arrivals",
    id: allAmbassadorsPageUrl,
    link: allAmbassadorsPageUrl,
    updated: latestArrivalDate,
    items: ambassadorFeedItems,
  });

  return new Response(ambassadorFeedContent, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}

export const dynamic = "force-static";
