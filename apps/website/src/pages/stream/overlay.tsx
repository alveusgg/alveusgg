import { type NextPage } from "next";
import { useEffect, useRef, useState } from "react";

import { DATETIME_ALVEUS_ZONE, formatDateTimeParts } from "@/utils/datetime";

import Event from "@/components/overlay/Event";

import { type WeatherResponse } from "../api/stream/weather";

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

  // Get the current weather
  // Refresh every 60s
  const [weather, setWeather] = useState<WeatherResponse>();
  const weatherInterval = useRef<NodeJS.Timeout>(null);
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
    return () => clearInterval(weatherInterval.current ?? undefined);
  }, []);

  // Remove the weather data if older than 10m
  const weatherStaleTimer = useRef<NodeJS.Timeout>(null);
  useEffect(() => {
    if (!weather) return;

    const updateWeather = () => setWeather(undefined);
    weatherStaleTimer.current = setTimeout(updateWeather, 10 * 60 * 1000);
    return () => clearTimeout(weatherStaleTimer.current ?? undefined);
  }, [weather]);

  // This can be a client-side only page
  if (!time) return null;

  return (
    <div className="h-screen w-full">
      <div className="absolute right-2 top-2 flex flex-col gap-1 text-right font-mono font-medium text-white text-stroke-2">
        <p className="text-4xl">{time.time}</p>
        <p className="text-4xl">{time.date}</p>
        {weather && (
          <p className="text-3xl">
            {weather.temperature.fahrenheit}°F{" "}
            <span className="text-xl">({weather.temperature.celsius}°C)</span>
          </p>
        )}
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
