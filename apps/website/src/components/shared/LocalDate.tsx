import React, { useEffect, useRef } from "react";

const dtf = new Intl.DateTimeFormat(undefined, {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
});

export const LocalDate: React.FC<{ dateTime: Date }> = ({ dateTime }) => {
  const localTimeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (localTimeRef.current) {
      localTimeRef.current.textContent = dtf.format(dateTime);
    }
  }, [dateTime]);

  return <span ref={localTimeRef}></span>;
};
