import { DateTime } from "luxon";

import type { Timestamps } from "./schema";

export const fixDateTimezone = (dateTime: Date, zone: string): Date =>
  DateTime.fromISO(dateTime.toISOString().replace("Z", ""), {
    zone,
  })
    .setZone("UTC")
    .toJSDate();

/**
 * WORKAROUND HOTFIX: Neon One API mislabels local time as UTC ('Z').
 * Remove this logic when they fix the timezone in their API response.
 */
export const fixTimestampsTimezone = (
  timestamps: Timestamps,
  zone: string,
) => ({
  ...timestamps,
  createdDateTime: fixDateTimezone(timestamps.createdDateTime, zone),
  lastModifiedDateTime: fixDateTimezone(timestamps.lastModifiedDateTime, zone),
});

const cleanSearchParams = (
  urlString: string,
  paramsToExclude: string[] = [],
) => {
  const url = new URL(urlString);
  const params = url.searchParams;
  paramsToExclude.forEach((param) => params.delete(param));
  params.sort();
  return `${url.origin + url.pathname}?${params.toString()}`;
};

export const isSameUrlWithoutQuery = (
  a: string,
  b: string,
  paramsToExclude: string[] = [],
) =>
  cleanSearchParams(a, paramsToExclude) ===
  cleanSearchParams(b, paramsToExclude);
