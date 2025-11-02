import { getPixelLeaderboard } from "@/server/db/donations";

import { isMuralId } from "@/data/murals";

export type Leaderboard = Array<[string, number]>;

export async function GET(
  _: Request,
  {
    params,
  }: {
    params: Promise<{
      mural?: string;
    }>;
  },
) {
  try {
    const { mural } = await params;
    if (!mural || !isMuralId(mural))
      return new Response("Mural not found", { status: 404 });

    const leaderboard = (await getPixelLeaderboard(mural)).map((entry) => [
      entry.identifier,
      entry._count.id,
    ]) satisfies Leaderboard;

    return Response.json(leaderboard, {
      headers: {
        "Cache-Control": "s-maxage=15, stale-while-revalidate=59",
      },
    });
  } catch (err) {
    console.error("Error getting pixels", err);
    return new Response("Pixels not available", { status: 500 });
  }
}
