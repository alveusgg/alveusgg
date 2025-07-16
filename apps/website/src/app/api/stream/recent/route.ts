import { DateTime } from "luxon";

import { prisma } from "@alveusgg/database";

// API for chat bot
export async function GET() {
  try {
    // Get the three most recent stream notifications that have a VoD URL
    const recent = await prisma.notification.findMany({
      where: {
        tag: "stream",
        vodUrl: {
          not: null,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
    });

    // Format the notifications into a string
    return new Response(
      recent
        .map(
          (notification) =>
            `${notification.title} (${DateTime.fromJSDate(notification.createdAt).toFormat("MMMM d")}): ${notification.vodUrl}`,
        )
        .join(" | "),
      {
        headers: {
          // Response can be cached for 1 minute
          "Cache-Control": "max-age=60, s-maxage=60, must-revalidate",
          "X-Generated-At": new Date().toISOString(),
        },
      },
    );
  } catch (err) {
    console.error("Error getting recent streams", err);
    return new Response("Recent streams not available", { status: 500 });
  }
}
