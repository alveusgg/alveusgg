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
