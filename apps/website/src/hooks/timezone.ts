import { useEffect, useState } from "react";

export const DATETIME_USER_ZONE =
  Intl.DateTimeFormat().resolvedOptions().timeZone;

export default function useTimezone() {
  const storageTz =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("timezone")
      : null;
  const [timezone, setTimezone] = useState(storageTz || DATETIME_USER_ZONE);

  useEffect(() => {
    localStorage.setItem("timezone", timezone);
  }, [timezone]);

  const setTimezoneWithFallback = (tz?: string) =>
    setTimezone(tz || DATETIME_USER_ZONE);

  return [timezone || DATETIME_USER_ZONE, setTimezoneWithFallback] as const;
}
