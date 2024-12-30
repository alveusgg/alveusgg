import { type NextPage } from "next";
import { useEffect, useRef, useState } from "react";

import { DATETIME_ALVEUS_ZONE, formatDateTimeParts } from "@/utils/datetime";

import Event from "@/components/overlay/Event";
import Weather from "@/components/overlay/Weather";

const colors = ["#7E7E7E", "#4E3029"];

const OverlayPage: NextPage = () => {
  // Get the current time and date
  // Refresh every 250ms
  const [time, setTime] = useState<{
    time: string;
    date: string;
    code: string[];
  }>();
  const timeInterval = useRef<NodeJS.Timeout>(null);
  useEffect(() => {
    const updateTime = () => {
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

      const minutes = date.getMinutes();
      const seconds = date.getSeconds();

      const code = (minutes * 60 + seconds)
        .toString(2)
        .padStart(12, "0")
        .split("");

      setTime({
        code,
        time: timeParts.join(""),
        date: [year, month, day]
          .map((part) => part.value.padStart(2, "0"))
          .join("-"),
      });
    };

    updateTime();
    timeInterval.current = setInterval(updateTime, 250);
    return () => clearInterval(timeInterval.current ?? undefined);
  }, []);

  // This can be a client-side only page
  if (!time) return null;

  return (
    <div className="h-screen w-full">
      <div className="absolute right-2 top-2 flex flex-col gap-1 text-right font-mono font-medium text-white text-stroke-2">
        <p className="text-4xl">{time.time}</p>
        <p className="text-4xl">{time.date}</p>

        <Weather />
      </div>

      <Event className="absolute bottom-2 left-2" />

      <div className="absolute bottom-0 right-0 grid grid-cols-12">
        {time.code.map((bit, idx) => (
          <div
            key={`${bit}-${idx}`}
            style={{
              backgroundColor: bit === "0" ? colors[0] : colors[1],
            }}
            className="size-1"
          />
        ))}
      </div>
    </div>
  );
};

export default OverlayPage;
