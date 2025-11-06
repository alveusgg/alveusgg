import { prisma } from "@alveusgg/database";

import murals from "@/data/murals";

import { typeSafeObjectKeys } from "@/utils/helpers";

import { PIXEL_TOTAL } from "@/hooks/pixels";

// API for chat bot
export async function GET() {
  try {
    const unlocked = await prisma.pixel
      .count({ where: { muralId: typeSafeObjectKeys(murals).at(-1) } })
      .then((count) => count.toLocaleString());
    const locked = PIXEL_TOTAL.toLocaleString();

    return Response.json(`${unlocked} / ${locked} pixels unlocked`, {
      headers: {
        // Response can be cached for 15 seconds
        "Cache-Control": "max-age=15, s-maxage=15, must-revalidate",
        "X-Generated-At": new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("Error getting pixels", err);
    return new Response("Pixels not available", { status: 500 });
  }
}
