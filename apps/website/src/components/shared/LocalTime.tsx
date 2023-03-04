import React, { useEffect, useRef } from "react";

const defaultLocale = "en-US";
const dtfOptions = {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
} satisfies Intl.DateTimeFormatOptions;
const isomorphicDtf = new Intl.DateTimeFormat(defaultLocale, dtfOptions);
const clientDtf = new Intl.DateTimeFormat("de", dtfOptions);

export const LocalTime: React.FC<{ dateTime: Date }> = ({ dateTime }) => {
  const localTimeRef = useRef<HTMLDivElement>(null);
  const initialValue = isomorphicDtf.format(dateTime);

  useEffect(() => {
    if (localTimeRef.current) {
      localTimeRef.current.textContent = clientDtf.format(dateTime);
    }
  }, [dateTime]);

  return <span ref={localTimeRef}>{initialValue}</span>;
};
