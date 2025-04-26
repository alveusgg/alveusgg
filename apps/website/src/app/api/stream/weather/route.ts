import { getWeather } from "@/server/apis/weather";

// API for chat bot
export async function GET() {
  try {
    const data = await getWeather();
    const resp = `Alveus Weather: ${data.temperature.fahrenheit} °F (${data.temperature.celsius} °C). Feels like ${data.temperature.feelsLike.fahrenheit} °F (${data.temperature.feelsLike.celsius} °C). ${data.humidity}% humidity. ${data.wind.speed.miles} mph winds. ${data.precipitation.total.inches} in of rain.`;

    return new Response(resp, {
      headers: {
        // Response can be cached for 10 seconds (the underlying data is cached for 1 minute)
        // And can be stale for 1 minute while revalidating
        "Cache-Control": "max-age=10, s-maxage=10, stale-while-revalidate=60",
        "X-Generated-At": new Date().toISOString(),
        "X-Observed-At": data.time.utc ?? "",
      },
    });
  } catch (err) {
    console.error("Error getting weather", err);
    return new Response("Weather data not available", { status: 500 });
  }
}
