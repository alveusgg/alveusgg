import { DateTime } from "luxon";

const LOCAL_TIMEZONE = "America/Chicago";

export function inputValueDatetimeLocalToUtc(value: string) {
  const format = value.includes("T") ? "yyyy-MM-dd'T'HH:mm" : "yyyy-MM-dd";

  return DateTime.fromFormat(value, format, { zone: LOCAL_TIMEZONE })
    .setZone("utc")
    .toJSDate();
}
