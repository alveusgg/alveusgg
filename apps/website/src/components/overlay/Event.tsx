import Image from "next/image";
import {
  Children,
  cloneElement,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Ref,
  type ReactElement,
  type HTMLProps,
} from "react";
import { Transition } from "@headlessui/react";
import { keepPreviousData } from "@tanstack/react-query";
import type { CalendarEvent } from "@prisma/client";

import { trpc } from "@/utils/trpc";
import { DATETIME_ALVEUS_ZONE, formatDateTimeRelative } from "@/utils/datetime";
import { classes } from "@/utils/classes";
import { getShortBaseUrl } from "@/utils/short-url";
import { getFormattedTitle, twitchChannels } from "@/data/calendar-events";

import { QRCode } from "@/components/QrCode";

import logoImage from "@/assets/logo.png";

const cycleTime = 60;

const Cycle = ({
  items,
  interval = 60,
}: {
  items: ReactElement<{ className: string; ref: Ref<HTMLElement> }>[];
  interval?: number;
}) => {
  const refs = useRef<(HTMLElement | null)[]>([]);
  const cloned = useMemo(
    () =>
      items.map((item, idx) =>
        cloneElement(item, {
          className: classes(
            item.props.className,
            "transition-opacity data-[closed]:opacity-0 data-[enter]:duration-700 data-[leave]:duration-300",
          ),
          ref: (el) => {
            refs.current[idx] = el;
          },
        }),
      ),
    [items],
  );

  const [index, setIndex] = useState(0);
  useEffect(() => {
    const nextIndex = (index + 1) % items.length;
    const timeout = setTimeout(() => setIndex(nextIndex), interval * 1000);
    return () => clearTimeout(timeout);
  }, [index, items, interval]);

  return Children.map(cloned, (item, idx) => (
    <Transition
      show={idx === index}
      beforeEnter={() => {
        const ref = refs.current[idx];
        if (!ref) return;

        ref.style.zIndex = "1";
      }}
      beforeLeave={() => {
        const ref = refs.current[idx];
        if (!ref) return;

        // Only offset if not absolute positioned
        if (window.getComputedStyle(ref).position !== "absolute") {
          // Offset by the width of the element and any gap between elements
          const { width } = ref.getBoundingClientRect();
          const gap = ref.parentElement
            ? Number(
                window
                  .getComputedStyle(ref.parentElement)
                  .rowGap.replace(/px$/, ""),
              )
            : 0;

          // If we're the last element, we need to offset an element that will be to the left of us
          ref.style[idx === items.length - 1 ? "marginLeft" : "marginRight"] =
            `-${width + gap}px`;
        }

        ref.style.zIndex = "0";
      }}
    >
      {item}
    </Transition>
  ));
};

const Socials = ({ className, ...props }: HTMLProps<HTMLDivElement>) => (
  <div className={classes(className, "flex items-center gap-2")} {...props}>
    <Cycle
      items={useMemo(
        () => [
          <Image
            key="logo"
            src={logoImage}
            alt=""
            height={64}
            className="size-16 object-contain opacity-75 brightness-150 contrast-125 drop-shadow-sm grayscale"
          />,
          <QRCode
            key="qr"
            className="size-16 rounded-lg border-2 border-black bg-white p-1 opacity-75 drop-shadow-sm"
            value={`${getShortBaseUrl()}/socials`}
          />,
        ],
        [],
      )}
      // We want to be back on the logo before the parent cycle switches
      interval={cycleTime / 3}
    />

    <div className="text-xl font-bold text-white text-stroke">
      <p>alveussanctuary.org</p>
      <p>@alveussanctuary</p>
    </div>
  </div>
);

const useUpcoming = () => {
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

    const upcoming = events.find(twitchChannels.alveus.filter);
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

  return event;
};

const Upcoming = ({
  event,
  className,
  ...props
}: { event: CalendarEvent } & HTMLProps<HTMLDivElement>) => (
  <div
    className={classes(className, "font-bold text-white text-stroke")}
    {...props}
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
);

const Event = ({ className }: { className?: string }) => {
  const upcoming = useUpcoming();

  const items = useMemo(
    () =>
      [
        <Socials key="socials" className={className} />,
        upcoming && (
          <Upcoming key="upcoming" event={upcoming} className={className} />
        ),
      ].filter((x) => !!x),
    [upcoming, className],
  );

  return <Cycle items={items} interval={cycleTime} />;
};

export default Event;
