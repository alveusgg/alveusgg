import { type NextPage } from "next";
import Image from "next/image";
import { forwardRef } from "react";

import useGrouped, { type GroupedItems, type Options } from "@/hooks/grouped";

import { formatDateTime } from "@/utils/datetime";
import { classes } from "@/utils/classes";

import events, { type Event } from "@/data/events";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import VideoPlayer from "@/components/content/Video";
import Meta from "@/components/content/Meta";
import Grouped, { type GroupedProps } from "@/components/content/Grouped";

import leafRightImage1 from "@/assets/floral/leaf-right-1.png";
import leafRightImage2 from "@/assets/floral/leaf-right-2.png";
import leafLeftImage1 from "@/assets/floral/leaf-left-1.png";
import leafLeftImage2 from "@/assets/floral/leaf-left-2.png";

const sortByOptions = {
  all: {
    label: "All Events",
    sort: (items) =>
      items.reduce<GroupedItems<Event>>((map, event) => {
        const year = event.date.getUTCFullYear().toString();

        map.set(year, {
          name: year,
          items: [...(map.get(year)?.items || []), event],
        });
        return map;
      }, new Map()),
  },
} as const satisfies Options<Event>;

const EventItems = forwardRef<HTMLDivElement, GroupedProps<Event>>(
  ({ items, option, group, name, index }, ref) => (
    <>
      {name && (
        <Heading
          level={-1}
          className={classes(
            "alveus-green-800 mb-6 mt-8 border-b-2 border-alveus-green-300/25 pb-2 text-4xl",
            index === 0 && "sr-only",
          )}
          id={`${option}:${group}`}
          link
        >
          {name}
        </Heading>
      )}
      <div ref={ref}>
        {items.map((event, idx, arr) => (
          <div
            key={event.slug}
            className={classes(
              "flex flex-wrap gap-y-8 pb-12 pt-8",
              idx === 0 ? "lg:pb-16" : "lg:py-16",
              idx !== arr.length - 1 && "border-b-2 border-alveus-green-300/15",
            )}
          >
            <div className="mx-auto flex basis-full flex-col px-8 lg:basis-1/2">
              <Heading
                level={2}
                className="my-4 scroll-mt-8 text-center text-4xl"
                id={event.slug}
                link
                linkClassName="flex flex-wrap items-end justify-center gap-x-8 gap-y-2"
              >
                {event.name}
                <small className="text-xl text-alveus-green-600">
                  {formatDateTime(event.date, { style: "long" })}
                </small>
              </Heading>

              <div className="my-auto flex flex-wrap py-2">
                {Object.entries(event.stats).map(([key, stat]) => (
                  <div
                    key={key}
                    className="mx-auto basis-full py-2 text-center sm:basis-1/2 lg:px-2"
                  >
                    <p className="text-3xl font-bold">{stat.stat}</p>
                    <p className="text-xl text-alveus-green-700">
                      {stat.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div
              className={classes(
                "mx-auto flex basis-full flex-col px-8 lg:basis-1/2",
                idx % 2 === 0 && "lg:order-first",
              )}
            >
              <VideoPlayer
                className="my-auto aspect-video w-full rounded-xl"
                poster={event.video.poster}
                sources={event.video.sources}
                autoPlay
                loop
                muted
                playsInline
              />
            </div>

            <div className="flex basis-full flex-col gap-3 px-8 text-lg text-gray-600">
              {event.info}
            </div>
          </div>
        ))}
      </div>
    </>
  ),
);

EventItems.displayName = "EventItems";

const EventsPage: NextPage = () => {
  const { option, group, result } = useGrouped({
    items: events,
    options: sortByOptions,
    initial: "all",
  });

  return (
    <>
      <Meta
        title="Events"
        description="We host one-off fundraising events to increase awareness of our conservation missions and to encourage donations to support Alveus."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <div className="relative">
        <Image
          src={leafRightImage1}
          alt=""
          className="pointer-events-none absolute -top-8 right-0 z-10 hidden h-auto w-1/2 max-w-sm select-none lg:block"
        />
        <Image
          src={leafLeftImage2}
          alt=""
          className="pointer-events-none absolute -bottom-24 left-0 z-10 hidden h-auto w-1/2 max-w-[12rem] select-none lg:block"
        />

        <Section dark className="py-24">
          <div className="w-full lg:w-3/5">
            <Heading>Our Events</Heading>
            <p className="text-lg">
              We host one-off fundraising events to increase awareness of our
              conservation missions and to encourage donations to support
              Alveus.
            </p>
          </div>
        </Section>
      </div>

      {/* Grow the last section to cover the page */}
      <div className="relative flex flex-grow flex-col">
        <Image
          src={leafLeftImage1}
          alt=""
          className="pointer-events-none absolute -bottom-32 -left-8 z-10 hidden h-auto w-1/2 max-w-[10rem] -rotate-45 select-none lg:block 2xl:max-w-[12rem]"
        />
        <Image
          src={leafRightImage2}
          alt=""
          className="pointer-events-none absolute -bottom-60 right-0 z-10 hidden h-auto w-1/2 max-w-[10rem] select-none lg:block 2xl:-bottom-64 2xl:max-w-[12rem]"
        />

        <Section className="flex-grow">
          <Grouped
            option={option}
            group={group}
            result={result}
            component={EventItems}
          />
        </Section>
      </div>
    </>
  );
};

export default EventsPage;
