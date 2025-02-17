import Image from "next/image";
import {
  Children,
  cloneElement,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefCallback,
  type ReactElement,
} from "react";
import { Transition } from "@headlessui/react";
import { keepPreviousData } from "@tanstack/react-query";

import { trpc } from "@/utils/trpc";
import { DATETIME_ALVEUS_ZONE, formatDateTimeRelative } from "@/utils/datetime";
import { classes } from "@/utils/classes";
import { getShortBaseUrl } from "@/utils/short-url";
import { getFormattedTitle, twitchChannels } from "@/data/calendar-events";

import { QRCode } from "@/components/QrCode";

import logoImage from "@/assets/logo.png";

const Cycle = ({
  items,
  interval = 60,
}: {
  items: ReactElement<{ className: string; ref: RefCallback<HTMLElement> }>[];
  interval?: number;
}) => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const nextIndex = (index + 1) % items.length;
    const timeout = setTimeout(() => setIndex(nextIndex), interval * 1000);
    return () => clearTimeout(timeout);
  }, [index, items, interval]);

  const refs = useRef<(HTMLElement | null)[]>([]);

  return Children.map(items, (item, i) => (
    <Transition
      show={i === index}
      beforeEnter={() => {
        const ref = refs.current[i];
        if (!ref) return;

        ref.style.zIndex = "1";
      }}
      beforeLeave={() => {
        const ref = refs.current[i];
        if (!ref) return;

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
        ref.style[i === items.length - 1 ? "marginLeft" : "marginRight"] =
          `-${width + gap}px`;
        ref.style.zIndex = "0";
      }}
    >
      {cloneElement(item, {
        className: classes(
          item.props.className,
          "transition-opacity data-[closed]:opacity-0 data-[enter]:duration-700 data-[leave]:duration-300",
        ),
        ref: (el: HTMLElement | null) => {
          refs.current[i] = el;
        },
      })}
    </Transition>
  ));
};

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
          <Cycle
            items={[
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
            ]}
            interval={20}
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
