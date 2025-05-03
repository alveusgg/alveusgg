import { useEffect, useState } from "react";

import { getShortTimezoneName } from "@/utils/datetime";

export const DATETIME_USER_ZONE =
  Intl.DateTimeFormat().resolvedOptions().timeZone;

export const DATETIME_USER_ZONE_SHORT = getShortTimezoneName({
  locale: undefined,
});

export default function useTimezone() {
  const storageTz =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("timezone")
      : null;

  const [timezone, setTimezone] = useState(storageTz || DATETIME_USER_ZONE);

  useEffect(() => {
    localStorage.setItem("timezone", timezone);
  }, [timezone]);

  return [timezone || DATETIME_USER_ZONE, setTimezone] as const;
}
