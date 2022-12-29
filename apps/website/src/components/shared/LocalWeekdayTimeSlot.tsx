import React, { useEffect, useRef } from "react";
import { DateTime } from "luxon";

export type WeekdayName = keyof typeof weekdayMap;

const weekdayMap = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7,
} as const;

export type HM = `${number}` | `${number}:${number}`;
export type AM_PM = "AM" | "PM";
export type TimeString = HM | `${HM} ${AM_PM}`;

const parseTime12hOr24h = (timeStr: TimeString) => {
  const [time, modifier] = timeStr.split(" ") as [HM, AM_PM];
  const hm = time.split(":").map((str) => parseInt(str, 10));

  let hours = hm[0] || 0;
  if (modifier) {
    if (hours === 12) {
      hours = 0;
    }

    if (modifier === "PM") {
      hours += 12;
    }
  }

  return { hours, minutes: hm[1] || 0 };
};

export const LocalWeekdayTimeSlot: React.FC<{
  timeSlot: TimeString;
  zone: string;
  weekday: WeekdayName;
}> = ({ timeSlot, weekday, zone }) => {
  const localTimeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (localTimeRef.current) {
      const dateTimeCt = DateTime.local({ zone }).set({
        weekday: weekdayMap[weekday],
        ...parseTime12hOr24h(timeSlot),
      });
      const dateTimeLocal = dateTimeCt.toLocal();
      const time = dateTimeLocal.toLocaleString(DateTime.TIME_SIMPLE);
      const offset = dateTimeLocal.offsetNameShort;

      localTimeRef.current.textContent = `${time} ${offset}`;
    }
  }, [timeSlot, weekday, zone]);

  return <span ref={localTimeRef}></span>;
};
