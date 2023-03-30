const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const getOrdinal = (n: number) => {
  const j = n % 10;
  const k = n % 100;
  if (j == 1 && k != 11) return "st";
  if (j == 2 && k != 12) return "nd";
  if (j == 3 && k != 13) return "rd";
  return "th";
};

export const dateFormatterLong = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export const dateFormatterShort = new Intl.DateTimeFormat(undefined, {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
});

export const dateTimeFormatterLong = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export const dateTimeFormatterShort = new Intl.DateTimeFormat(undefined, {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDateUTC(
  dateTime: Date,
  format: "short" | "long" = "short"
) {
  if (format === "short") {
    return [
      String(dateTime.getUTCMonth() + 1).padStart(2, "0"),
      String(dateTime.getUTCDate()).padStart(2, "0"),
      String(dateTime.getUTCFullYear()).slice(-2).padStart(2, "0"),
    ].join("/");
  }

  return (
    monthNames[dateTime.getUTCMonth()] +
    " " +
    dateTime.getUTCDate() +
    getOrdinal(dateTime.getUTCDate()) +
    ", " +
    dateTime.getUTCFullYear()
  );
}

export function formatTimeUTC(dateTime: Date) {
  return [
    String(dateTime.getUTCHours()).padStart(2, "0"),
    String(dateTime.getUTCMinutes()).padStart(2, "0"),
  ].join(":");
}
