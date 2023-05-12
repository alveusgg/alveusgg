import { DateTime } from "luxon";

export type DateTimeFormat = {
  style: "short" | "long";
  time: "minutes" | "seconds" | undefined;
  timezone: boolean;
};

const getFormat = ({
  style,
  time,
  timezone,
}: DateTimeFormat): Intl.DateTimeFormatOptions => {
  const defaults: Partial<Intl.DateTimeFormatOptions> = {
    timeZoneName: timezone ? "short" : undefined,
  };

  if (time === "seconds") {
    return {
      ...(style === "short"
        ? DateTime.DATETIME_SHORT_WITH_SECONDS
        : DateTime.DATETIME_FULL_WITH_SECONDS),
      ...defaults,
    };
  }

  if (time === "minutes") {
    return {
      ...(style === "short" ? DateTime.DATETIME_SHORT : DateTime.DATETIME_FULL),
      ...defaults,
    };
  }

  return {
    ...(style === "short" ? DateTime.DATE_SHORT : DateTime.DATE_FULL),
    ...defaults,
  };
};

export type DateTimeOptions = {
  locale: string | null;
  zone: string | null;
};

export const formatDateTime = (
  dateTime: Date,
  {
    style = "short",
    time = undefined,
    timezone = false,
  }: Partial<DateTimeFormat> = {},
  { locale = "en-US", zone = "UTC" }: Partial<DateTimeOptions> = {}
) =>
  DateTime.fromJSDate(dateTime)
    .setZone(zone ?? undefined)
    .toLocaleString(getFormat({ style, time, timezone }), {
      locale: locale ?? undefined,
    });

export const formatDateTimeLocal = (
  dateTime: Date,
  format: Partial<DateTimeFormat> = {}
) =>
  formatDateTime(
    dateTime,
    { ...format, timezone: format.timezone ?? true },
    {
      locale: null,
      zone: null,
    }
  );

export const DATETIME_ALVEUS_ZONE = "America/Chicago";

/**
 * Parse a partial date string into a Date object
 *
 * @param {string} date partial date to parse (e.g. 2023 or 2023-01 or 2023-01-01)
 * @returns {Date|null} Date object if the date is valid, null otherwise
 */
export const parseDate = (date: string): Date | null => {
  const arr = date.split("-");
  const d = parseInt(arr[2] || "");
  const m = parseInt(arr[1] || "");
  const y = parseInt(arr[0] || "");

  if (!isNaN(d) && !isNaN(m) && !isNaN(y)) return new Date(y, m - 1, d);
  if (!isNaN(m) && !isNaN(y)) return new Date(y, m - 1);
  if (!isNaN(y)) return new Date(y);

  return null;
};

/**
 * Sorts the dates in descending order, with nulls at the end
 *
 * @param {string|null} a first date to compare
 * @param {string|null} b second date to compare
 * @returns {number}
 */
export const sortDate = (a: string | null, b: string | null): number => {
  const parsedA = typeof a === "string" ? parseDate(a) : null;
  const parsedB = typeof b === "string" ? parseDate(b) : null;

  // If they match (same date or both unknown), no change
  if (parsedA === parsedB) return 0;

  // If the first date is unknown, the second date moves up
  if (parsedA === null) return 1;

  // If the second date is unknown, the first date moves up
  if (parsedB === null) return -1;

  // Otherwise, sort by date
  return parsedA > parsedB ? -1 : 1;
};
