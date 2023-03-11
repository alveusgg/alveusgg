import React, { useEffect, useRef } from "react";
import {
  dateFormatterLong,
  dateFormatterShort,
  formatDateUTC,
} from "@/utils/datetime";

export const LocalDate: React.FC<{
  dateTime: Date;
  format?: "short" | "long";
}> = ({ dateTime, format = "short" }) => {
  const localDateRef = useRef<HTMLDivElement>(null);
  const initialDate = formatDateUTC(dateTime, format);

  useEffect(() => {
    if (localDateRef.current) {
      localDateRef.current.textContent = (
        format === "short" ? dateFormatterShort : dateFormatterLong
      ).format(dateTime);
    }
  }, [dateTime, format]);

  return <span ref={localDateRef}>{initialDate}</span>;
};
