export function daysAgo(days: number, from = new Date()) {
  const date = new Date(from);
  date.setDate(date.getDate() - days);
  return date;
}

export function daysFromNow(days: number, from = new Date()) {
  return daysAgo(-days, from);
}
