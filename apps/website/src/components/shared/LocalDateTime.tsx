import React, { useEffect, useRef } from "react";
import { formatDateUTC, formatTimeUTC } from "@/utils/datetime";

const formatter = new Intl.DateTimeFormat(undefined, {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export const LocalDateTime: React.FC<{ dateTime: Date }> = ({ dateTime }) => {
  const ref = useRef<HTMLDivElement>(null);
  const initialDate = formatDateUTC(dateTime);
  const initialTime = formatTimeUTC(dateTime);

  useEffect(() => {
    if (ref.current) {
      ref.current.textContent = formatter.format(dateTime);
    }
  }, [dateTime]);

  return (
    <span ref={ref}>
      {initialDate} {initialTime}
    </span>
  );
};
