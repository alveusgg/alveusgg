import { getWeather } from "@/server/apis/weather";

// API for overlay + chat bot
export async function GET(request: Request) {
  try {
    const resp = await getWeather();
    return Response.json(resp, {
      headers: {
        // Response can be cached for 1 minute
        // And can be stale for 5 minutes while revalidating
        "Cache-Control": "max-age=60, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    console.error("Error getting weather", err);
  }

  return new Response("Weather data not available", { status: 500 });
}

// Cache the response for 1 minute
export const dynamic = "force-static";
export const revalidate = 60;
export const runtime = "edge";
