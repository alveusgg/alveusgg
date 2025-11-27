import { keepPreviousData } from "@tanstack/react-query";
import Image from "next/image";
import { type HTMLProps, useEffect, useMemo, useRef, useState } from "react";

import type { CalendarEvent } from "@alveusgg/database";

import { getFormattedTitle } from "@/data/calendar-events";
import { channels } from "@/data/twitch";

import { classes } from "@/utils/classes";
import { formatDateTimeRelative } from "@/utils/datetime";
import { getShortBaseUrl } from "@/utils/short-url";
import { DATETIME_ALVEUS_ZONE } from "@/utils/timezone";
import { trpc } from "@/utils/trpc";

import { QRCode } from "@/components/QrCode";
import Cycle from "@/components/overlay/Cycle";

import logoImage from "@/assets/logo.png";

const cycleTime = 60;

const Socials = ({ className, ...props }: HTMLProps<HTMLDivElement>) => (
  <div className={classes(className, "flex items-center gap-2")} {...props}>
    <div className="relative size-16">
      <Cycle
        items={useMemo(
          () => [
            <Image
              key="logo"
              src={logoImage}
              alt=""
              height={64}
              className="absolute inset-0 object-contain opacity-75 brightness-150 contrast-125 drop-shadow-sm grayscale"
            />,
            <QRCode
              key="qr"
              className="absolute inset-0 rounded-lg border-2 border-black/75 bg-white p-0.5 opacity-90 drop-shadow-sm"
              value={`${getShortBaseUrl()}/socials`}
            />,
          ],
          [],
        )}
        // We want to be back on the logo before the parent cycle switches
        interval={cycleTime / 3 + 1}
      />
    </div>

    <div className="text-xl font-bold text-white text-stroke">
      <p>alveussanctuary.org</p>
      <p>@alveussanctuary</p>
    </div>
  </div>
);

const Upcoming = ({ className, ...props }: HTMLProps<HTMLDivElement>) => {
  // Set the range for upcoming events to the next 3 days
  // Refresh every 60s
  const [upcomingRange, setUpcomingRange] = useState<[Date, Date]>();
  const upcomingRangeInterval = useRef<NodeJS.Timeout>(null);
  useEffect(() => {
    const updateRange = () => {
      const now = new Date();
      const next = new Date(now);
      next.setDate(next.getDate() + 3);
      setUpcomingRange([now, next]);
    };

    updateRange();
    upcomingRangeInterval.current = setInterval(updateRange, 60 * 1000);
    return () => clearInterval(upcomingRangeInterval.current ?? undefined);
  }, []);

  // Get the upcoming events and the first event ID
  // Refresh when the range changes
  const { data: events } = trpc.calendarEvents.getCalendarEvents.useQuery(
    { start: upcomingRange?.[0], end: upcomingRange?.[1] },
    { enabled: upcomingRange !== undefined, placeholderData: keepPreviousData },
  );

  // Ensure we hold a stable reference to the event
  const [event, setEvent] = useState<CalendarEvent>();
  useEffect(() => {
    if (!events) return;

    const upcoming = events.find(channels.alveus.calendarEventFilter);
    if (!upcoming) {
      setEvent(undefined);
      return;
    }

    const hasChanged =
      !event ||
      Object.entries(upcoming).some(([key, value]) => {
        if (!(key in event)) return true;
        const val = event[key as keyof CalendarEvent];

        // Handle dates as they are objects
        if (value instanceof Date && val instanceof Date) {
          return value.getTime() !== val.getTime();
        }
        return value !== val;
      });
    if (hasChanged) {
      setEvent(upcoming);
    }
  }, [events, event]);

  if (!event) return null;

  return (
    <div
      className={classes(className, "font-bold text-white text-stroke")}
      {...props}
    >
      <p>Upcoming:</p>
      <p className="text-xl">
        {getFormattedTitle(event, channels.alveus.username, 30)}
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
  );
};

const Event = ({ className }: { className?: string }) => {
  const items = useMemo(
    () =>
      [
        <Socials key="socials" className={className} />,
        <Upcoming key="upcoming" className={className} />,
      ].filter((x) => !!x),
    [className],
  );

  return <Cycle items={items} interval={cycleTime} />;
};

export default Event;
