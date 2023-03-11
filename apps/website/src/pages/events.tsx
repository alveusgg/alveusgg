import { type NextPage } from "next";
import Image from "next/image";
import React from "react";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Video from "@/components/content/Video";
import Meta from "@/components/content/Meta";

import valentines2023Video from "@/assets/events/valentines-2023.mp4";
import artAuction2022Video from "@/assets/events/art-auction-2022.mp4";
import halloween2021Video from "@/assets/events/halloween-2021.mp4";
import fundathon2021Video from "@/assets/events/fundathon-2021.mp4";

import leafRightImage1 from "@/assets/floral/leaf-right-1.png";
import leafLeftImage1 from "@/assets/floral/leaf-left-1.png";

export const events = {
  valentines2023: {
    name: "Valentine's Day 2023",
    date: "14th February 2023",
    video: valentines2023Video,
    stats: {
      totalDonations: {
        title: "Raised for Alveus Sanctuary",
        stat: "$40,076",
      },
      signedPostcards: {
        title: "Signed postcards sent to donors",
        stat: "596",
      },
      dabloons: {
        title: "Dabloons distributed to donors",
        stat: "1,600",
      },
      viewers: {
        title: "Peak viewers on the stream",
        stat: "9,729",
      },
    },
  },
  artAuction2022: {
    name: "Art Auction 2022",
    date: "22nd April 2022",
    video: artAuction2022Video,
    stats: {
      totalDonations: {
        title: "Raised for Alveus Sanctuary",
        stat: "$42,104",
      },
      signedPrints: {
        title: "Signed prints sent to donors",
        stat: "199",
      },
      auctionWinners: {
        title: "Auction winners",
        stat: "23",
      },
      ambassadorPaintings: {
        title: "Ambassador paintings sold",
        stat: "30",
      },
    },
  },
  halloween2021: {
    name: "Halloween 2021",
    date: "31st October 2021",
    video: halloween2021Video,
    stats: {
      totalDonations: {
        title: "Raised for Alveus Sanctuary",
        stat: "$101,971",
      },
      uniqueDonors: {
        title: "Unique donors during the broadcast",
        stat: "1,235",
      },
      namesWritten: {
        title: "Names written on the wall by creators",
        stat: "244",
      },
      creators: {
        title: "Creators attended the event",
        stat: "34",
      },
      viewers: {
        title: "Peak viewers on the stream",
        stat: "93,000",
      },
    },
  },
  fundathon2021: {
    name: "Fund-a-thon 2021",
    date: "10th February 2021",
    video: fundathon2021Video,
    stats: {
      totalDonations: {
        title: "Raised for Alveus Sanctuary",
        stat: "$573,004",
      },
      uniqueDonors: {
        title: "Unique donors during the broadcast",
        stat: "3,904",
      },
      leaves: {
        title: "Engraved leaves on the donator trees",
        stat: "2,455",
      },
      viewers: {
        title: "Peak viewers on the stream",
        stat: "82,000",
      },
    },
  },
};

const EventsPage: NextPage = () => {
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
          className="pointer-events-none absolute -bottom-24 right-0 z-10 hidden h-auto w-1/2 max-w-md select-none lg:block"
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
          className="pointer-events-none absolute -bottom-24 left-0 z-10 hidden h-auto w-1/2 max-w-[12rem] select-none lg:block"
        />

        <Section className="flex-grow">
          {Object.entries(events).map(([key, event], idx) => (
            <div key={key} className="flex flex-wrap-reverse">
              <div className="mx-auto flex basis-full flex-col py-8 md:px-8 lg:basis-1/2">
                <Video
                  className="my-auto aspect-video w-full rounded-xl"
                  poster={event.video.poster}
                  sources={event.video.sources}
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              </div>

              <div
                className={`mx-auto flex basis-full flex-col py-8 lg:basis-1/2 lg:px-8 ${
                  idx % 2 ? "lg:order-first" : ""
                }`}
              >
                <Heading
                  level={2}
                  className="flex flex-wrap items-end justify-center gap-x-8 gap-y-2 text-center text-4xl"
                >
                  {event.name}
                  <small className="text-xl text-alveus-green-600">
                    {event.date}
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
            </div>
          ))}
        </Section>
      </div>
    </>
  );
};

export default EventsPage;
