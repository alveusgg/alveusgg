import { getPublicPixels } from "@/server/db/donations";

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
