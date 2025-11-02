import { getPublicPixels } from "@/server/db/donations";

import { isMuralId } from "@/data/murals";

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

    const pixels = await getPublicPixels(mural);
    return Response.json(pixels, {
      headers: {
        "Cache-Control": "s-maxage=15, stale-while-revalidate=59",
      },
    });
  } catch (err) {
    console.error("Error getting pixels", err);
    return new Response("Pixels not available", { status: 500 });
  }
}
