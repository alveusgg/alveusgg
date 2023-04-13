import { DateTime } from "luxon";

const LOCAL_TIMEZONE = "America/Chicago";
const DATETIME_LOCAL_INPUT_FORMAT = "yyyy-MM-dd'T'HH:mm";

export function utcToInputValueDatetimeLocal(date?: Date | null) {
  if (!date) return undefined;

  return DateTime.fromJSDate(date, {
    zone: "utc",
  })
    .setZone("America/Chicago")
    .toFormat(DATETIME_LOCAL_INPUT_FORMAT);
}

export function inputValueDatetimeLocalToUtc(value: string) {
  return DateTime.fromFormat(value, DATETIME_LOCAL_INPUT_FORMAT, {
    zone: LOCAL_TIMEZONE,
  })
    .setZone("utc")
    .toJSDate();
}
