import { getWeather } from "@/server/apis/weather";

// API for chat bot
export async function GET() {
  try {
    const data = await getWeather();
    const resp = `Alveus Weather: ${data.temperature.fahrenheit} °F (${data.temperature.celsius} °C). Feels like ${data.temperature.feelsLike.fahrenheit} °F (${data.temperature.feelsLike.celsius} °C). ${data.humidity}% humidity. ${data.wind.speed.miles} mph winds. ${data.precipitation.total.inches} in of rain.`;

    return new Response(resp, {
      headers: {
        // Response can be cached for 1 minute
        // And can be stale for 5 minutes while revalidating
        "Cache-Control": "max-age=60, s-maxage=60, stale-while-revalidate=300",
        "X-Generated-At": new Date().toISOString(),
        "X-Observed-At": data.time.utc ?? "",
      },
    });
  } catch (err) {
    console.error("Error getting weather", err);
    return new Response("Weather data not available", { status: 500 });
  }
}
