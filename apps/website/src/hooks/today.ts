import { DateTime } from "luxon";
import { useEffect, useState } from "react";

export default function useToday(timeZone?: string) {
  const [today, setToday] = useState<DateTime>();

  useEffect(() => {
    setToday(DateTime.local({ zone: timeZone }).startOf("day"));
  }, [timeZone]);

  return today;
}
