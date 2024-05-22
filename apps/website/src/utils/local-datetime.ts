import { DateTime } from "luxon";

const LOCAL_TIMEZONE = "America/Chicago";
export const DATETIME_LOCAL_INPUT_FORMAT = "yyyy-MM-dd'T'HH:mm";
export const DATE_LOCAL_INPUT_FORMAT = "yyyy-MM-dd";
export const TIME_LOCAL_INPUT_FORMAT = "HH:mm";

export function utcToInputValueDatetimeLocal(
  date?: Date | null,
  format = DATETIME_LOCAL_INPUT_FORMAT,
) {
  if (!date) return undefined;

  return DateTime.fromJSDate(date, { zone: "utc" })
    .setZone(LOCAL_TIMEZONE)
    .toFormat(format);
}

export function inputValueDatetimeLocalToUtc(
  value: string,
  format = DATETIME_LOCAL_INPUT_FORMAT,
) {
  return DateTime.fromFormat(value, format, { zone: LOCAL_TIMEZONE })
    .setZone("utc")
    .toJSDate();
}
