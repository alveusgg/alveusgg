import { type NextPage } from "next";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Transition } from "@headlessui/react";
import { keepPreviousData } from "@tanstack/react-query";

import { trpc } from "@/utils/trpc";
import {
  DATETIME_ALVEUS_ZONE,
  formatDateTimeParts,
  formatDateTimeRelative,
} from "@/utils/datetime";
import { getFormattedTitle, isAlveusEvent } from "@/data/calendar-events";

import logoImage from "@/assets/logo.png";

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
  const timeInterval = useRef<NodeJS.Timeout>();
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
    return () => clearInterval(timeInterval.current);
  }, []);

  // Get the current weather
  // Refresh every 60s
  const [weather, setWeather] = useState<WeatherResponse>();
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

  // Remove the weather data if older than 10m
  const weatherStaleTimer = useRef<NodeJS.Timeout>();
  useEffect(() => {
    if (!weather) return;

    const updateWeather = () => setWeather(undefined);
    weatherStaleTimer.current = setTimeout(updateWeather, 10 * 60 * 1000);
    return () => clearTimeout(weatherStaleTimer.current);
  }, [weather]);

  // Set the range for upcoming events to the next 3 days
  // Refresh every 60s
  const [upcomingRange, setUpcomingRange] = useState<[Date, Date]>();
  const upcomingRangeInterval = useRef<NodeJS.Timeout>();
  useEffect(() => {
    const updateRange = () => {
      const now = new Date();
      const next = new Date(now);
      next.setDate(next.getDate() + 3);
      setUpcomingRange([now, next]);
    };

    updateRange();
    upcomingRangeInterval.current = setInterval(updateRange, 60 * 1000);
    return () => clearInterval(upcomingRangeInterval.current);
  }, []);

  // Get the upcoming events and the first event ID
  // Refresh when the range changes
  const { data: events } = trpc.calendarEvents.getCalendarEvents.useQuery(
    { start: upcomingRange?.[0], end: upcomingRange?.[1] },
    { enabled: upcomingRange !== undefined, placeholderData: keepPreviousData },
  );
  const firstEventId = useMemo(() => events?.find(isAlveusEvent)?.id, [events]);

  // If we have an upcoming event, swap socials with it
  // Swap every 60s
  const [visibleEventId, setVisibleEventId] = useState<string>();
  const eventInterval = useRef<NodeJS.Timeout>();
  useEffect(() => {
    if (!firstEventId) {
      setVisibleEventId(undefined);
      return;
    }

    const swapEvent = () =>
      setVisibleEventId((prev) => (prev ? undefined : firstEventId));
    swapEvent();
    eventInterval.current = setInterval(swapEvent, 60 * 1000);
    return () => clearInterval(eventInterval.current);
  }, [firstEventId]);
  const event = useMemo(
    () =>
      visibleEventId && events?.find((event) => event.id === visibleEventId),
    [visibleEventId, events],
  );

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

      <Transition show={event !== undefined}>
        <div className="text-stroke absolute bottom-2 left-2 font-bold text-white transition-opacity data-[closed]:opacity-0 data-[enter]:duration-700 data-[leave]:duration-300">
          <p>Upcoming:</p>

          {event && (
            <>
              <p className="text-xl">{getFormattedTitle(event, 30)}</p>
              <p className="text-xl">
                {formatDateTimeRelative(
                  event.startAt,
                  {
                    style: "long",
                    time: event.hasTime ? "minutes" : undefined,
                    timezone: event.hasTime,
                  },
                  { zone: DATETIME_ALVEUS_ZONE },
                )}
              </p>
            </>
          )}
        </div>
      </Transition>

      <Transition show={event === undefined}>
        <div className="absolute bottom-2 left-2 flex items-center gap-2 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-700 data-[leave]:duration-300">
          <Image
            src={logoImage}
            alt=""
            height={64}
            className="h-16 w-auto opacity-75 brightness-150 contrast-125 drop-shadow grayscale"
          />

          <div className="text-stroke text-xl font-bold text-white">
            <p>alveussanctuary.org</p>
            <p>@alveussanctuary</p>
          </div>
        </div>
      </Transition>

      <div className="absolute bottom-0 right-0 grid grid-cols-12">
        {time.code.map((bit, idx) => (
          <div
            key={`${bit}-${idx}`}
            style={{
              backgroundColor: bit === "0" ? colors[0] : colors[1],
            }}
            className="h-1 w-1"
          />
        ))}
      </div>
    </div>
  );
};

export default OverlayPage;
