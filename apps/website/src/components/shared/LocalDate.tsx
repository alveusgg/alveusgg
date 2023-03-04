import React, { useEffect, useRef } from "react";
import { formatDateUTC } from "@/utils/datetime";

const dtf = new Intl.DateTimeFormat(undefined, {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
});

export const LocalDate: React.FC<{ dateTime: Date }> = ({ dateTime }) => {
  const localDateRef = useRef<HTMLDivElement>(null);
  const initialDate = formatDateUTC(dateTime);

  useEffect(() => {
    if (localDateRef.current) {
      localDateRef.current.textContent = dtf.format(dateTime);
    }
  }, [dateTime]);

  return <span ref={localDateRef}>{initialDate}</span>;
};
