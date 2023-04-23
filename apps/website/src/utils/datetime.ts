import { DateTime } from "luxon";

type Format = {
  style: "short" | "long";
  time: "minutes" | "seconds" | undefined;
  timezone: boolean;
};

const getFormat = ({
  style,
  time,
  timezone,
}: Format): Intl.DateTimeFormatOptions => {
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

type Options = {
  locale: string;
  zone: string;
};

export const formatDateTime = (
  dateTime: Date,
  { style = "short", time = undefined, timezone = false }: Partial<Format> = {},
  { locale = "en-US", zone = "UTC" }: Partial<Options> = {}
) =>
  DateTime.fromJSDate(dateTime)
    .setZone(zone)
    .toLocaleString(getFormat({ style, time, timezone }), {
      locale,
    });
