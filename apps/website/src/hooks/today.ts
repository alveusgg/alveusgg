import { useEffect, useState } from "react";
import { DateTime } from "luxon";

export default function useToday(timeZone?: string) {
  const [today, setToday] = useState<DateTime>();

  useEffect(() => {
    setToday(DateTime.local({ zone: timeZone }).startOf("day"));
  }, [timeZone]);

  return today;
}
