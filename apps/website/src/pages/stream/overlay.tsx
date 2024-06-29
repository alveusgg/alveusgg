import { Transition } from "@headlessui/react";
import type { NextPage } from "next";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import { classes } from "@/utils/classes";
import {
  DATETIME_ALVEUS_ZONE,
  formatDateTimeParts,
  formatDateTimeRelative,
} from "@/utils/datetime";
import { trpc } from "@/utils/trpc";

import logoImage from "@/assets/logo.png";

import type { WeatherResponse } from "../api/stream/weather";

const OverlayPage: NextPage = () => {
  // Get the current time and date
  // Refresh every 250ms
  const [time, setTime] = useState<{ time: string; date: string }>();
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
    { enabled: upcomingRange !== undefined, keepPreviousData: true },
  );
  const firstEventId = useMemo(
    () =>
      events?.find((event) =>
        [
          "alveus regular stream",
          "alveus special stream",
          "collaboration stream",
        ].includes(event.category.toLowerCase()),
      )?.id,
    [events],
  );

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

      <Transition
        show={event !== undefined}
        enter="transition-opacity duration-700"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        {event && (
          <div className="text-stroke absolute bottom-2 left-2 font-bold text-white">
            <p>Upcoming:</p>
            <p className="text-xl">
              {event.title}
              {" @ "}
              {event.link.toLowerCase().replace(/^(https?:)?\/\/(www\.)?/, "")}
            </p>
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
          </div>
        )}
      </Transition>

      <Transition
        show={event === undefined}
        enter="transition-opacity duration-700"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="absolute bottom-2 left-2 flex items-center gap-2">
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
    </div>
  );
};

export default OverlayPage;
