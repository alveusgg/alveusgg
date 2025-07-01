import type { DateTime } from "luxon";
import { useEffect, useState } from "react";

import { getToday } from "@/utils/datetime";

export default function useToday(timeZone?: string) {
  const [today, setToday] = useState<DateTime>();

  useEffect(() => {
    setToday(getToday(timeZone));
  }, [timeZone]);

  return today;
}
