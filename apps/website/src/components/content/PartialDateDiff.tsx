import { useEffect, useState } from "react";

import {
  type PartialDateString,
  diffPartialDateString,
} from "@/utils/datetime-partial";

const PartialDateDiff = ({
  date,
  timezone,
  suffix,
}: {
  date: PartialDateString;
  timezone?: string;
  suffix?: string;
}) => {
  const [formatted, setFormatted] = useState<string>();

  // Format the date diff on initial render client-side, and every hour thereafter
  useEffect(() => {
    const update = () => {
      setFormatted(diffPartialDateString(date, timezone));
    };
    update();

    const interval = setInterval(update, 1000 * 60 * 60);
    return () => clearInterval(interval);
  }, [date, timezone]);

  return formatted ? `${formatted}${suffix ? ` ${suffix}` : ""}` : "";
};

export default PartialDateDiff;
