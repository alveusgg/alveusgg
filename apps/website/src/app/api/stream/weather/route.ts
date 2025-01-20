import { env } from "@/env";
import { getCurrentObservation } from "@/server/apis/weather";
import invariant from "@/utils/invariant";
import { rounded } from "@/utils/math";

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

export type WeatherResponse = {
  time: {
    local: string | null;
    utc: string | null;
  };
  uvIndex: number | null;
  humidity: number | null;
  temperature: {
    fahrenheit: number | null;
    celsius: number | null;
    heatIndex: {
      fahrenheit: number | null;
      celsius: number | null;
    };
    windChill: {
      fahrenheit: number | null;
      celsius: number | null;
    };
    feelsLike: {
      fahrenheit: number | null;
      celsius: number | null;
    };
  };
  pressure: {
    inches: number | null;
    millibars: number | null;
  };
  wind: {
    speed: {
      miles: number | null;
      kilometers: number | null;
    };
    gusts: {
      miles: number | null;
      kilometers: number | null;
    };
    direction: number | null;
  };
  precipitation: {
    rate: {
      inches: number | null;
      millimeters: number | null;
    };
    total: {
      inches: number | null;
      millimeters: number | null;
    };
  };
};

export const getWeatherResponse = async (): Promise<WeatherResponse> => {
  invariant(env.WEATHER_STATION_ID, "WEATHER_STATION_ID is required");
  invariant(env.WEATHER_API_KEY, "WEATHER_API_KEY is required");

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
};

// API for overlay + chat bot
export async function GET(request: Request) {
  try {
    const resp = await getWeatherResponse();
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
