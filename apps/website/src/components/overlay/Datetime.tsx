import { type ReactNode, useEffect, useRef, useState } from "react";

import { classes } from "@/utils/classes";
import { formatDateTimeParts } from "@/utils/datetime";
import { DATETIME_ALVEUS_ZONE } from "@/utils/timezone";

const Datetime = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => {
  // Get the current time and date
  // Refresh every 250ms
  const [time, setTime] = useState<{
    time: string;
    date: string;
  }>();
  const interval = useRef<NodeJS.Timeout>(null);
  useEffect(() => {
    const update = () => {
      const date = new Date();
      const parts = formatDateTimeParts(
        date,
        { style: "short", time: "seconds", timezone: true },
        { zone: DATETIME_ALVEUS_ZONE },
      );

      // Get the hour -> second parts
      const hourIdx = parts.findIndex((part) => part.type === "hour");
      const secondIdx = parts.findIndex((part) => part.type === "second");
      if (hourIdx === -1 || secondIdx === -1) return;
      const timeParts = parts
        .slice(hourIdx, secondIdx + 1)
        .map((part) => part.value);

      // Get the AM/PM part and the timezone
      const dayPeriod = parts.find((part) => part.type === "dayPeriod");
      if (dayPeriod) timeParts.push(" ", dayPeriod.value);
      const timezone = parts.find((part) => part.type === "timeZoneName");
      if (timezone) timeParts.push(" ", timezone.value);

      // Get the date
      const year = parts.find((part) => part.type === "year");
      const month = parts.find((part) => part.type === "month");
      const day = parts.find((part) => part.type === "day");
      if (!year || !month || !day) return;

      setTime({
        time: timeParts.join(""),
        date: [year, month, day]
          .map((part) => part.value.padStart(2, "0"))
          .join("-"),
      });
    };

    update();
    interval.current = setInterval(update, 250);
    return () => clearInterval(interval.current ?? undefined);
  }, []);

  return (
    <div
      className={classes(
        className,
        "flex flex-col gap-1 font-mono font-medium text-white text-stroke-2",
      )}
    >
      {time && (
        <>
          <p className="text-4xl">{time.time}</p>
          <p className="text-4xl">{time.date}</p>
        </>
      )}

      {children}
    </div>
  );
};

export default Datetime;
