import { z } from "zod";
import { env } from "@/env/index.mjs";

export type WeatherData = z.infer<typeof weatherSchema>;

const weatherSchema = z.object({
  weather: z.array(
    z.object({
      id: z.number(),
      main: z.string(),
      description: z.string(),
      icon: z.string(),
    }),
  ),
  main: z.object({
    temp: z.number(),
    feels_like: z.number(),
    temp_min: z.number(),
    temp_max: z.number(),
    pressure: z.number(),
    humidity: z.number(),
  }),
  wind: z.object({ speed: z.number(), deg: z.number() }),
  clouds: z.object({ all: z.number() }),
});
export async function getWeatherData() {
  let weatherData: WeatherData | null = null;
  if (
    env.OPEN_WEATHER_MAP_API_KEY &&
    env.OPEN_WEATHER_MAP_API_LON &&
    env.OPEN_WEATHER_MAP_API_LAT
  ) {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${env.OPEN_WEATHER_MAP_API_LAT}&lon=${env.OPEN_WEATHER_MAP_API_LON}&appid=${env.OPEN_WEATHER_MAP_API_KEY}&lang=en&units=imperial`,
    );
    const data = await res.json();
    weatherData = weatherSchema.parse(data);
  }

  return weatherData;
}
