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

export function formatTimeUTC(
  dateTime: Date,
  { showSeconds = false, showTimezone = false } = {}
) {
  return (
    [
      String(dateTime.getUTCHours()).padStart(2, "0"),
      String(dateTime.getUTCMinutes()).padStart(2, "0"),
      showSeconds && String(dateTime.getUTCSeconds()).padStart(2, "0"),
    ]
      .filter(Boolean)
      .join(":") + (showTimezone ? " UTC" : "")
  );
}

export function formatDateTimeUTC(
  dateTime: Date,
  format: "short" | "long" = "short",
  { showSeconds = false, showTimezone = false } = {}
) {
  return (
    formatDateUTC(dateTime, format) +
    " " +
    formatTimeUTC(dateTime, { showSeconds, showTimezone })
  );
}
