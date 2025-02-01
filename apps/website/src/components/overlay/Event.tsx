import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Transition } from "@headlessui/react";
import { keepPreviousData } from "@tanstack/react-query";

import { trpc } from "@/utils/trpc";
import { DATETIME_ALVEUS_ZONE, formatDateTimeRelative } from "@/utils/datetime";
import { classes } from "@/utils/classes";
import { getFormattedTitle, twitchChannels } from "@/data/calendar-events";

import logoImage from "@/assets/logo.png";

const Event = ({ className }: { className?: string }) => {
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
  const firstEventId = useMemo(
    () => events?.find(twitchChannels.alveus.filter)?.id,
    [events],
  );

  // If we have an upcoming event, swap socials with it
  // Swap every 60s
  const [visibleEventId, setVisibleEventId] = useState<string>();
  const eventInterval = useRef<NodeJS.Timeout>(null);
  useEffect(() => {
    if (!firstEventId) {
      setVisibleEventId(undefined);
      return;
    }

    const swapEvent = () =>
      setVisibleEventId((prev) => (prev ? undefined : firstEventId));
    swapEvent();
    eventInterval.current = setInterval(swapEvent, 60 * 1000);
    return () => clearInterval(eventInterval.current ?? undefined);
  }, [firstEventId]);
  const event = useMemo(
    () =>
      visibleEventId && events?.find((event) => event.id === visibleEventId),
    [visibleEventId, events],
  );

  return (
    <>
      <Transition show={event !== undefined}>
        <div
          className={classes(
            className,
            "font-bold text-white transition-opacity text-stroke data-[closed]:opacity-0 data-[enter]:duration-700 data-[leave]:duration-300",
          )}
        >
          <p>Upcoming:</p>

          {event && (
            <>
              <p className="text-xl">
                {getFormattedTitle(event, twitchChannels.alveus.username, 30)}
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
            </>
          )}
        </div>
      </Transition>

      <Transition show={event === undefined}>
        <div
          className={classes(
            className,
            "flex items-center gap-2 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-700 data-[leave]:duration-300",
          )}
        >
          <Image
            src={logoImage}
            alt=""
            height={64}
            className="h-16 w-auto opacity-75 brightness-150 contrast-125 drop-shadow-sm grayscale"
          />

          <div className="text-xl font-bold text-white text-stroke">
            <p>alveussanctuary.org</p>
            <p>@alveussanctuary</p>
          </div>
        </div>
      </Transition>
    </>
  );
};

export default Event;
