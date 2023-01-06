import React, { useEffect, useRef } from "react";
import { DateTime } from "luxon";

export const TimeInfo: React.FC = () => {
  const localTimeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const updateTime = () => {
      if (localTimeRef.current) {
        const dateTime = DateTime.local().setZone("America/Chicago");
        const time = dateTime.toFormat("h:mm a");
        const offset = dateTime.isInDST ? "CDT" : "CST";

        localTimeRef.current.textContent = `${time} ${offset}`;
      }
    };

    const interval = setInterval(updateTime, 30 * 1000);
    updateTime();

    return () => clearInterval(interval);
  }, []);

  return <span ref={localTimeRef} />;
};
