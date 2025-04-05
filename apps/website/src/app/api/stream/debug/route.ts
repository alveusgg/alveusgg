export async function GET() {
  return Response.json(
    { date: new Date().toISOString() },
    {
      headers: {
        // Response can be cached for 5 minutes
        // And can be stale for 5 minutes while revalidating
        "Cache-Control":
          "max-age=300, s-maxage=300, stale-while-revalidate=300",
      },
    },
  );
}

// Cache the response for 5 minutes
export const dynamic = "force-static";
export const revalidate = 300;
