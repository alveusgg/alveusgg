import { getPixels } from "@/server/db/donations";

const headers = {
  "Cache-Control": "s-maxage=15, stale-while-revalidate=59",
};

export async function GET() {
  try {
    const pixels = await getPixels();
    return Response.json(pixels, { headers });
  } catch (err) {
    console.error("Error getting pixels", err);
    return new Response("Pixels not available", { status: 500 });
  }
}
