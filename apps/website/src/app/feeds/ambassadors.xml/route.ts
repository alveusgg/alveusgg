import { Feed } from "feed";

import allAmbassadors from "@alveusgg/data/build/ambassadors/core";
import { isActiveAmbassadorEntry } from "@alveusgg/data/build/ambassadors/filters";

import { env } from "@/env";

import { typeSafeObjectEntries } from "@/utils/helpers";
import { camelToKebab } from "@/utils/string-case";

const activeAmbassadors = typeSafeObjectEntries(allAmbassadors).filter(
  isActiveAmbassadorEntry,
);

// Sort in descending order by date
const sortedActiveAmbassadors = activeAmbassadors.toSorted(
  ([, a], [, b]) =>
    new Date(b.arrival).valueOf() - new Date(a.arrival).valueOf(),
);

export async function GET() {
  const allAmbassadorsPageUrl = `${env.NEXT_PUBLIC_BASE_URL}/ambassadors`;

  const latestActiveAmbassador = sortedActiveAmbassadors[0];
  const latestArrivalDate =
    (latestActiveAmbassador && new Date(latestActiveAmbassador[1].arrival)) ||
    undefined;

  const feed = new Feed({
    title: "Alveus Sanctuary Ambassadors",
    description: "A feed for new ambassador arrivals",
    id: allAmbassadorsPageUrl,
    link: allAmbassadorsPageUrl,
    copyright: "Copyright 2023 Alveus Sanctuary Inc. and the Alveus.gg team",
    updated: latestArrivalDate,
  });

  sortedActiveAmbassadors.forEach(([, ambassador]) => {
    const ambassadorPageUrl = `${env.NEXT_PUBLIC_BASE_URL}/ambassadors/${camelToKebab(ambassador.name)}`;

    feed.addItem({
      title: ambassador.name,
      id: ambassadorPageUrl,
      link: ambassadorPageUrl,
      description: ambassador.story,
      content: ambassador.story, // ambassador.mission,
      date: new Date(ambassador.arrival),
    });
  });

  return new Response(feed.rss2(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
