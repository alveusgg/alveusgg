import { DateTime } from "luxon";

import type { PartialDateString } from "@alveusgg/data/build/types";

import { getToday } from "./datetime";
import { DATETIME_ALVEUS_ZONE } from "./timezone";

export type { PartialDateString };

const splitPartialDateString = (date: PartialDateString) =>
  date.split("-").map((x) => parseInt(x)) as
    | [number]
    | [number, number]
    | [number, number, number];

export const parsePartialDateString = (
  date: PartialDateString,
  timezone?: string,
) => {
  const [year, month, day] = splitPartialDateString(date);
  return DateTime.fromObject(
    {
      year,
      month: month || 1,
      day: day || 1,
    },
    { zone: timezone || DATETIME_ALVEUS_ZONE },
  ).startOf("day");
};

export const sortPartialDateString = (
  a: PartialDateString | null,
  b: PartialDateString | null,
): number => {
  const parsedA = (
    typeof a === "string" ? parsePartialDateString(a) : null
  )?.toMillis();
  const parsedB = (
    typeof b === "string" ? parsePartialDateString(b) : null
  )?.toMillis();

  // If they match (same date or both unknown), no change
  if (parsedA === parsedB) return 0;

  // If the first date is unknown, the second date moves up
  if (parsedA === undefined) return 1;

  // If the second date is unknown, the first date moves up
  if (parsedB === undefined) return -1;

  // Otherwise, sort by date
  return parsedA > parsedB ? -1 : 1;
};

export const formatPartialDateString = (
  date: PartialDateString | null,
  timezone?: string,
): string => {
  const parsed = date && parsePartialDateString(date, timezone);
  if (!parsed) return "Unknown";

  const accuracy = splitPartialDateString(date).length;
  return parsed.setLocale("en-US").toLocaleString({
    year: "numeric",
    month: accuracy === 2 || accuracy === 3 ? "long" : undefined,
    day: accuracy === 3 ? "numeric" : undefined,
  });
};

export const diffPartialDateString = (
  date: PartialDateString | null,
  timezone?: string,
): string => {
  const parsed = date && parsePartialDateString(date, timezone);
  if (!parsed) return "Unknown";

  const accurate = splitPartialDateString(date).length === 3;
  const { years, months, days } = getToday(timezone)
    .diff(parsed, ["years", "months", "days"])
    .toObject();

  if (years)
    return `${accurate ? "" : "~"}${years} year${years === 1 ? "" : "s"}`;
  if (months)
    return `${accurate ? "" : "~"}${months} month${months === 1 ? "" : "s"}`;

  const floorDays = Math.floor(days ?? 0);
  return `${accurate ? "" : "~"}${floorDays} day${floorDays === 1 ? "" : "s"}`;
};
