import { getPixels } from "@/server/db/donations";

const headers = {
  "Cache-Control": "s-maxage=15, stale-while-revalidate=59",
};

export async function GET() {
  const pixels = await getPixels();
  return Response.json(pixels, { headers });
}
