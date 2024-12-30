import { useEffect, useRef, useState } from "react";

import { type WeatherResponse } from "@/pages/api/stream/weather";

const Weather = () => {
  // Get the current weather
  // Refresh every 60s
  const [weather, setWeather] = useState<WeatherResponse>();
  const interval = useRef<NodeJS.Timeout>(null);
  useEffect(() => {
    const refresh = async () => {
      const response = await fetch("/api/stream/weather");
      if (response.ok) {
        const data = await response.json();
        setWeather(data);
      }
    };

    refresh();
    interval.current = setInterval(refresh, 60 * 1000);
    return () => clearInterval(interval.current ?? undefined);
  }, []);

  // Remove the weather data if older than 10m
  const stale = useRef<NodeJS.Timeout>(null);
  useEffect(() => {
    if (!weather) return;

    stale.current = setTimeout(() => setWeather(undefined), 10 * 60 * 1000);
    return () => clearTimeout(stale.current ?? undefined);
  }, [weather]);

  return (
    weather && (
      <p className="text-3xl">
        {weather.temperature.fahrenheit}°F{" "}
        <span className="text-xl">({weather.temperature.celsius}°C)</span>
      </p>
    )
  );
};

export default Weather;
