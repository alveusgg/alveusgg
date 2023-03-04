export function formatDateUTC(dateTime: Date) {
  return [
    String(dateTime.getUTCMonth() + 1).padStart(2, "0"),
    String(dateTime.getUTCDate()).padStart(2, "0"),
    String(dateTime.getUTCFullYear()).slice(-2).padStart(2, "0"),
  ].join("/");
}
export function formatTimeUTC(dateTime: Date) {
  return [
    String(dateTime.getUTCHours()).padStart(2, "0"),
    String(dateTime.getUTCMinutes()).padStart(2, "0"),
  ].join(":");
}
