import { Redis } from "@upstash/redis";
import { z } from "zod";

import { env } from "@/env";

import invariant from "@/utils/invariant";
import { rounded } from "@/utils/math";

// https://ibm.co/v2PWSCC
// https://ibm.co/APICom
const observationSchema = z
  .object({
    country: z.string().nullable(),
    epoch: z.number().nullable(),
    humidity: z.number().nullable(),
    lat: z.number().nullable(),
    lon: z.number().nullable(),
    neighborhood: z.string().nullable(),
    obsTimeLocal: z.string().nullable(),
    obsTimeUtc: z.iso.datetime().nullable(),
    qcStatus: z.number().min(-1).max(1).int(),
    realtimeFrequency: z.number().nullable(),
    softwareType: z.string().nullable(),
    solarRadiation: z.number().nullable(),
    stationID: z.string(),
    uv: z.number().nullable(),
    winddir: z.number().nullable(),
  })
  .strict();

const unitsSchema = z
  .object({
    dewpt: z.number().nullable(),
    elev: z.number().nullable(),
    heatIndex: z.number().nullable(),
    precipRate: z.number().nullable(),
    precipTotal: z.number().nullable(),
    pressure: z.number().nullable(),
    temp: z.number().nullable(),
    windChill: z.number().nullable(),
    windGust: z.number().nullable(),
    windSpeed: z.number().nullable(),
  })
  .strict();

const metricSchema = observationSchema
  .extend({
    metric: unitsSchema,
  })
  .strict();

const imperialSchema = observationSchema
  .extend({
    imperial: unitsSchema,
  })
  .strict();

type CurrentObservation<T extends boolean> = z.infer<
  T extends true ? typeof imperialSchema : typeof metricSchema
>;

const currentObservationsSchema = (imperial: boolean) =>
  z
    .object({
      observations: z
        .array(imperial ? imperialSchema : metricSchema)
        .nonempty()
        .length(1),
    })
    .strict();

export async function getCurrentObservation<T extends boolean>(
  stationId: string,
  imperial: T,
): Promise<CurrentObservation<T>> {
  invariant(env.WEATHER_API_KEY, "WEATHER_API_KEY is required");

  // If we have Redis available, try to cache weather data for 1 minute to reduce API calls
  const redis =
    env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
      ? new Redis({
          url: env.UPSTASH_REDIS_REST_URL,
          token: env.UPSTASH_REDIS_REST_TOKEN,
        })
      : null;
  const cache = `weather:${stationId}:${imperial ? "imperial" : "metric"}`;

  // Try to get cached weather data from Redis
  if (redis) {
    const raw = await redis.get(cache);
    if (typeof raw === "string") {
      try {
        const data = await currentObservationsSchema(imperial).parseAsync(
          JSON.parse(raw),
        );
        return data.observations[0] as CurrentObservation<T>;
      } catch (err) {
        console.error("Error parsing cached weather data", err);
        await redis.del(cache);
      }
    }
  }

  // If we didn't get valid cached data, fetch from the API
  const response = await fetch(
    `https://api.weather.com/v2/pws/observations/current?stationId=${encodeURIComponent(stationId)}&format=json&units=${imperial ? "e" : "m"}&numericPrecision=decimal&apiKey=${encodeURIComponent(env.WEATHER_API_KEY)}`,
    {
      headers: {
        "User-Agent": "alveus.gg",
      },
    },
  );

  if (response.status !== 200) {
    throw new Error(
      `Error fetching weather data: ${response.status} ${response.statusText}`,
      { cause: await response.text() },
    );
  }

  const json = await response.json();
  const data = await currentObservationsSchema(imperial).parseAsync(json);

  // If we get valid data from the API, and have Redis available, cache it for 1 minute
  if (redis) {
    try {
      await redis.set(cache, JSON.stringify(json), { ex: 60 });
    } catch (err) {
      console.error("Error caching weather data", err);
    }
  }

  return data.observations[0] as CurrentObservation<T>;
}

const getFeelsLike = (
  temperature: number | null,
  heatIndex: number | null,
  windChill: number | null,
) => {
  if (temperature !== null) {
    if (temperature >= 70 && heatIndex !== null) return heatIndex;
    if (temperature <= 61 && windChill !== null) return windChill;
  }
  return temperature;
};

export async function getWeather() {
  invariant(env.WEATHER_STATION_ID, "WEATHER_STATION_ID is required");

  const weather = await getCurrentObservation(env.WEATHER_STATION_ID, true);
  const feelsLike = getFeelsLike(
    weather.imperial.temp,
    weather.imperial.heatIndex,
    weather.imperial.windChill,
  );

  return {
    time: {
      local: weather.obsTimeLocal,
      utc: weather.obsTimeUtc,
    },
    uvIndex: weather.uv,
    humidity: weather.humidity,
    temperature: {
      fahrenheit: weather.imperial.temp,
      celsius:
        weather.imperial.temp !== null
          ? rounded(((weather.imperial.temp - 32) * 5) / 9, 2)
          : null,
      heatIndex: {
        fahrenheit: weather.imperial.heatIndex,
        celsius:
          weather.imperial.heatIndex !== null
            ? rounded(((weather.imperial.heatIndex - 32) * 5) / 9, 2)
            : null,
      },
      windChill: {
        fahrenheit: weather.imperial.windChill,
        celsius:
          weather.imperial.windChill !== null
            ? rounded(((weather.imperial.windChill - 32) * 5) / 9, 2)
            : null,
      },
      feelsLike: {
        fahrenheit: feelsLike,
        celsius: feelsLike ? rounded(((feelsLike - 32) * 5) / 9, 2) : null,
      },
    },
    pressure: {
      inches: weather.imperial.pressure,
      millibars:
        weather.imperial.pressure !== null
          ? rounded(weather.imperial.pressure * 33.86375, 2)
          : null,
    },
    wind: {
      speed: {
        miles: weather.imperial.windSpeed,
        kilometers:
          weather.imperial.windSpeed !== null
            ? rounded(weather.imperial.windSpeed * 1.60934, 2)
            : null,
      },
      gusts: {
        miles: weather.imperial.windGust,
        kilometers:
          weather.imperial.windGust !== null
            ? rounded(weather.imperial.windGust * 1.60934, 2)
            : null,
      },
      direction: weather.winddir,
    },
    precipitation: {
      rate: {
        inches: weather.imperial.precipRate,
        millimeters:
          weather.imperial.precipRate !== null
            ? rounded(weather.imperial.precipRate * 25.4, 2)
            : null,
      },
      total: {
        inches: weather.imperial.precipTotal,
        millimeters:
          weather.imperial.precipTotal !== null
            ? rounded(weather.imperial.precipTotal * 25.4, 2)
            : null,
      },
    },
  };
}
