import type { PartialDateString } from "@alveusgg/data/build/types";

export type { PartialDateString };

export const parsePartialDateString = (
  date: PartialDateString,
): Date | null => {
  const arr = date.split("-");
  const d = parseInt(arr[2] || "");
  const m = parseInt(arr[1] || "");
  const y = parseInt(arr[0] || "");

  if (!isNaN(d) && !isNaN(m) && !isNaN(y)) return new Date(y, m - 1, d);
  if (!isNaN(m) && !isNaN(y)) return new Date(y, m - 1);
  if (!isNaN(y)) return new Date(y, 0);

  return null;
};

export const sortPartialDateString = (
  a: PartialDateString | null,
  b: PartialDateString | null,
): number => {
  const parsedA = (
    typeof a === "string" ? parsePartialDateString(a) : null
  )?.getTime();
  const parsedB = (
    typeof b === "string" ? parsePartialDateString(b) : null
  )?.getTime();

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
): string => {
  if (!date) return "Unknown";

  const [year, month, day] = date.split("-");
  const parsed = new Date(
    Number(year),
    Number(month || 1) - 1,
    Number(day || 1),
  );

  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: month ? "long" : undefined,
    day: day ? "numeric" : undefined,
  });
};
