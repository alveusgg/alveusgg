export async function GET(request: Request) {
  const opt = request.method === "OPTIONS";
  return Response.json({ opt });
}

// Cache the response for 30 minutes
export const dynamic = "force-static";
export const revalidate = 1800;
export const runtime = "edge";
