import { DateTime } from "luxon";

import { DATETIME_ALVEUS_ZONE } from "./timezone";

export type DateTimeFormat = {
  style: "short" | "long";
  time: "minutes" | "seconds" | undefined;
  timezone: boolean;
};

export const getToday = (timezone?: string) =>
  DateTime.now()
    .setZone(timezone || DATETIME_ALVEUS_ZONE)
    .startOf("day");

const getFormat = ({
  style,
  time,
  timezone,
}: DateTimeFormat): Intl.DateTimeFormatOptions => {
  const defaults: Partial<Intl.DateTimeFormatOptions> = {
    timeZoneName: timezone ? "shortGeneric" : undefined,
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
  { locale = "en-US", zone = "UTC" }: Partial<DateTimeOptions> = {},
) =>
  DateTime.fromJSDate(dateTime)
    .setZone(zone ?? undefined)
    .reconfigure({ locale: locale ?? undefined })
    .toLocaleString(getFormat({ style, time, timezone }));

export const formatDateTimeParts = (
  dateTime: Date,
  {
    style = "short",
    time = undefined,
    timezone = false,
  }: Partial<DateTimeFormat> = {},
  { locale = "en-US", zone = "UTC" }: Partial<DateTimeOptions> = {},
) =>
  DateTime.fromJSDate(dateTime)
    .setZone(zone ?? undefined)
    .reconfigure({ locale: locale ?? undefined })
    .toLocaleParts(getFormat({ style, time, timezone }));

const foundMinMax = (arr: number[]) => {
  const filtered = arr.filter((x) => x !== -1);
  if (filtered.length === 0) throw new Error("No parts found");
  return [Math.min(...filtered), Math.max(...filtered)] as [number, number];
};

export const formatDateTimeRelative = (
  dateTime: Date,
  {
    style = "short",
    time = undefined,
    timezone = false,
  }: Partial<DateTimeFormat> = {},
  { locale = "en-US", zone = "UTC" }: Partial<DateTimeOptions> = {},
) => {
  // Format the date
  const parts = formatDateTimeParts(
    dateTime,
    { style, time, timezone },
    { locale, zone },
  );

  // Determine how many days away the date is
  const dateToday = DateTime.now().setZone(zone ?? undefined);
  const dateGiven = DateTime.fromJSDate(dateTime).setZone(zone ?? undefined);
  const daysToday = Math.floor(
    dateToday.startOf("day").toUnixInteger() / (60 * 60 * 24),
  );
  const daysGiven = Math.floor(
    dateGiven.startOf("day").toUnixInteger() / (60 * 60 * 24),
  );
  const daysDiff = daysGiven - daysToday;

  // If the date is today or tomorrow, show relative date
  if (daysDiff >= -1 && daysDiff <= 1) {
    // Get the year -> day parts
    const yearIdx = parts.findIndex((part) => part.type === "year");
    const monthIdx = parts.findIndex((part) => part.type === "month");
    const dayIdx = parts.findIndex((part) => part.type === "day");
    const [minIdx, maxIdx] = foundMinMax([yearIdx, monthIdx, dayIdx]);

    // Replace the year -> day parts with the relative date
    parts.splice(minIdx, maxIdx - minIdx + 1, {
      type: "literal",
      value:
        style === "short" && daysDiff === 0
          ? ""
          : daysDiff === 0
            ? "Today"
            : daysDiff === 1
              ? "Tomorrow"
              : "Yesterday",
    });

    // If the date is today, and time was requested, show the time
    if (daysDiff === 0 && time) {
      const secondsDiff = dateGiven.diff(dateToday).as("seconds");
      const timeFormatted = formatSeconds(Math.abs(secondsDiff), {
        style: "long",
        seconds: time === "seconds",
      });

      parts.splice(minIdx + 1, 0, {
        type: "literal",
        value:
          secondsDiff < 0 ? ` ${timeFormatted} ago` : ` in ${timeFormatted}`,
      });
    }
  }

  return parts.map((part) => part.value).join("");
};

export const formatDateTimeLocal = (
  dateTime: Date,
  format: Partial<DateTimeFormat> = {},
) =>
  formatDateTime(
    dateTime,
    { ...format, timezone: format.timezone ?? true },
    {
      locale: null,
      zone: null,
    },
  );

export const formatSeconds = (
  seconds: number,
  {
    style = "short",
    seconds: showSeconds = true,
  }: Partial<{ style: "short" | "long"; seconds: boolean }> = {},
): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  // If short, output as hh:mm:ss
  // If we're showing seconds, hh is optional
  // mm is padded if hh is present, ss is always padded (if shown)
  if (style === "short") {
    return [
      ...(!showSeconds || hours > 0 ? [hours] : []),
      minutes.toString().padStart(!showSeconds || hours > 0 ? 2 : 1, "0"),
      ...(showSeconds ? [remainingSeconds.toString().padStart(2, "0")] : []),
    ].join(":");
  }

  // If long, output as hh hours, mm minutes, ss seconds
  // If we're showing seconds, hh and mm are optional
  // If we're not showing seconds, hh only is optional
  return [
    ...(hours > 0 ? [`${hours} hour${hours === 1 ? "" : "s"}`] : []),
    ...(!showSeconds || minutes > 0
      ? [`${minutes} minute${minutes === 1 ? "" : "s"}`]
      : []),
    ...(showSeconds
      ? [`${remainingSeconds} second${remainingSeconds === 1 ? "" : "s"}`]
      : []),
  ].join(", ");
};
