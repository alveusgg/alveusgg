import { env } from "@/env";
import { getCurrentObservation } from "@/server/utils/weather-api";
import { rounded } from "@/utils/math";
import type { NextApiRequest, NextApiResponse } from "next";

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

// API for overlay + chat bot
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WeatherResponse | string>,
) {
  if (env.WEATHER_STATION_ID && env.WEATHER_API_KEY) {
    try {
      const weather = await getCurrentObservation(env.WEATHER_STATION_ID, true);
      const feelsLike = getFeelsLike(
        weather.imperial.temp,
        weather.imperial.heatIndex,
        weather.imperial.windChill,
      );

      res.setHeader(
        "Cache-Control",
        "max-age=60, s-maxage=300, stale-while-revalidate",
      );
      return res.json({
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
      });
    } catch (err) {
      console.error("Error getting weather", err);
    }
  }

  return res.status(500).send("Error getting weather");
}
