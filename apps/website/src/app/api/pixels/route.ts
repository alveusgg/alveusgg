import { getPublicPixels } from "@/server/db/donations";

export async function GET() {
  try {
    const pixels = await getPublicPixels();
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
