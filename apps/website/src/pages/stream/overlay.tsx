import { type NextPage } from "next";
import { useEffect, useRef, useState } from "react";
import { DATETIME_ALVEUS_ZONE, formatDateTimeParts } from "@/utils/datetime";
import { type WeatherResponse } from "../api/stream/weather";

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
        date: `${year.value}-${month.value}-${day.value}`,
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
      <div className="absolute right-2 top-2 space-y-1 text-right font-mono font-bold">
        <p className="text-4xl">{time.time}</p>
        <p className="text-4xl">{time.date}</p>
        {weather && (
          <p className="text-3xl">
            {weather.temperature.fahrenheit} °F / {weather.temperature.celsius}{" "}
            °C
          </p>
        )}
      </div>
    </div>
  );
};

export default OverlayPage;
