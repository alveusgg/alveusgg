import type { NextPage } from "next";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { DATETIME_ALVEUS_ZONE, formatDateTimeParts } from "@/utils/datetime";

import logoImage from "@/assets/logo.png";

import type { WeatherResponse } from "../api/stream/weather";

const OverlayPage: NextPage = () => {
  const [time, setTime] = useState<{ time: string; date: string } | null>(null);
  const timeInterval = useRef<NodeJS.Timeout>();
  useEffect(() => {
    const updateTime = () => {
      const parts = formatDateTimeParts(
        new Date(),
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

    updateTime();
    timeInterval.current = setInterval(updateTime, 250);
    return () => clearInterval(timeInterval.current);
  }, []);

  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const weatherInterval = useRef<NodeJS.Timeout>();
  useEffect(() => {
    const fetchWeather = async () => {
      const response = await fetch("/api/stream/weather");
      if (response.ok) {
        const data = await response.json();
        setWeather(data);
      }
    };

    fetchWeather();
    weatherInterval.current = setInterval(fetchWeather, 60 * 1000);
    return () => clearInterval(weatherInterval.current);
  }, []);

  if (!time) return null;

  return (
    <div className="h-screen w-full">
      <div className="paint-order-sfm text-shadow absolute right-2 top-2 flex flex-col gap-1 text-right font-bold tabular-nums tracking-widest text-white text-stroke-3 text-shadow-x-0 text-shadow-y-0 text-shadow-black">
        <p className="text-4xl">{time.time}</p>
        <p className="text-4xl">{time.date}</p>
        {weather && (
          <p className="text-3xl">
            {weather.temperature.fahrenheit} °F{" "}
            <span className="text-xl">({weather.temperature.celsius} °C)</span>
          </p>
        )}
      </div>

      <div className="absolute bottom-2 left-2 flex items-center gap-2">
        <Image
          src={logoImage}
          alt=""
          height={64}
          className="h-16 w-auto opacity-50 brightness-125 contrast-200 drop-shadow grayscale saturate-200"
        />

        <div className="paint-order-sfm text-shadow text-xl font-bold text-white text-stroke-1 text-shadow-x-0 text-shadow-y-0 text-shadow-black">
          <p>alveussanctuary.org</p>
          <p>@alveussanctuary</p>
        </div>
      </div>
    </div>
  );
};

export default OverlayPage;
