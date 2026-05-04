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
