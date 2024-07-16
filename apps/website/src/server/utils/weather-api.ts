import { z } from "zod";

import { env } from "@/env";

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
    obsTimeUtc: z.string().datetime().nullable(),
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
  if (!env.WEATHER_API_KEY) throw new Error("WEATHER_API_KEY is not set!");

  const response = await fetch(
    `https://api.weather.com/v2/pws/observations/current?stationId=${encodeURIComponent(
      stationId,
    )}&format=json&units=${
      imperial ? "e" : "m"
    }&numericPrecision=decimal&apiKey=${encodeURIComponent(
      env.WEATHER_API_KEY,
    )}`,
  );

  const json = await response.json();
  if (response.status !== 200) {
    console.error(json);
    throw new Error("Could not get current observations!");
  }

  const data = await currentObservationsSchema(imperial).parseAsync(json);
  return data.observations[0] as CurrentObservation<T>;
}
