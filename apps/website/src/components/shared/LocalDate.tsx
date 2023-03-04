import React, { useEffect, useRef } from "react";

const defaultLocale = "en-US";
const dtfOptions = {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
} satisfies Intl.DateTimeFormatOptions;
const isomorphicDtf = new Intl.DateTimeFormat(defaultLocale, dtfOptions);
const clientDtf = new Intl.DateTimeFormat(undefined, dtfOptions);

export const LocalDate: React.FC<{ dateTime: Date }> = ({ dateTime }) => {
  const localDateRef = useRef<HTMLDivElement>(null);

  const initialValue = isomorphicDtf.format(dateTime);

  useEffect(() => {
    if (localDateRef.current) {
      localDateRef.current.textContent = clientDtf.format(dateTime);
    }
  }, [dateTime]);

  return <span ref={localDateRef}>{initialValue}</span>;
};
