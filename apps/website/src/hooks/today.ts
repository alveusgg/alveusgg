import { useEffect, useState } from "react";
import { DateTime } from "luxon";

export default function useToday(timeZone?: string) {
  const [today, setToday] = useState<Date>();

  useEffect(() => {
    setToday(DateTime.local({ zone: timeZone }).toJSDate());
  }, [timeZone]);

  return today;
}
