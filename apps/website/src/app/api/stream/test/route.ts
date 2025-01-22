const headers = {
  // Response can be cached for 30 minutes
  // And can be stale for 5 minutes while revalidating
  "Cache-Control": "max-age=1800, s-maxage=1800, stale-while-revalidate=300",

  // Vercel doesn't respect Vary so we allow all origins to use this
  // Ideally we'd just allow specifically localhost + *.ext-twitch.tv
  "Access-Control-Allow-Origin": "*",
};

// API for extension
export async function GET(request: Request) {
  // Handle preflight requests
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        ...headers,
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  // Otherwise, return the data
  return Response.json({ ok: true }, { headers });
}

// Cache the response for 30 minutes
export const dynamic = "force-static";
export const revalidate = 1800;
export const runtime = "edge";
