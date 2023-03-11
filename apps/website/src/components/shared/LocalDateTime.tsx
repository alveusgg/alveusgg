import React, { useEffect, useRef } from "react";
import {
  dateTimeFormatterLong,
  dateTimeFormatterShort,
  formatDateUTC,
  formatTimeUTC,
} from "@/utils/datetime";

export const LocalDateTime: React.FC<{
  dateTime: Date;
  format?: "short" | "long";
}> = ({ dateTime, format = "short" }) => {
  const ref = useRef<HTMLDivElement>(null);
  const initialDate = formatDateUTC(dateTime);
  const initialTime = formatTimeUTC(dateTime);

  useEffect(() => {
    if (ref.current) {
      ref.current.textContent = (
        format === "short" ? dateTimeFormatterShort : dateTimeFormatterLong
      ).format(dateTime);
    }
  }, [dateTime]);

  return (
    <span ref={ref}>
      {initialDate} {initialTime}
    </span>
  );
};
