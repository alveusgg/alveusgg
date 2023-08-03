import { type NextPage } from "next";
import Image from "next/image";
import React from "react";
import type { PartialDateString } from "@alveusgg/data/src/types";

import { formatPartialDateString } from "@/utils/datetime";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Link from "@/components/content/Link";
import Timeline from "@/components/content/Timeline";
import { Lightbox, Preview } from "@/components/content/YouTube";

import mayaImage from "@/assets/maya.png";
import leafLeftImage1 from "@/assets/floral/leaf-left-1.png";
import leafLeftImage2 from "@/assets/floral/leaf-left-2.png";
import leafLeftImage3 from "@/assets/floral/leaf-left-3.png";
import imageGuidestarSeal from "@/assets/guidestar-candid-gold-seal.svg";

// TODO: Review/update these stats (maybe bring in geo-related stats from previous page)
const stats = {
  averageTime: {
    source: "https://influencermarketinghub.com/twitch-statistics/",
    title: "Average User Time Spent on Twitch.tv",
    value: "95 Minutes",
    caption:
      "On average Twitch users spend 95 minutes per day on the platform.",
  },
  sitePopularity: {
    source: "https://www.alexa.com/topsites",
    title: "Site Popularity",
    value: "35th",
    caption: "Twitch.tv is the 35th most popular website online.",
  },
  dailyViewers: {
    source: "https://muchneeded.com/twitch-statistics/",
    title: "Twitch's Daily Viewers",
    value: "15 Million",
    caption: "Twitch garners on average 15 million daily viewers.",
  },
  millennialUsers: {
    source: "https://muchneeded.com/twitch-statistics/",
    title: "Millennial Twitch Users",
    value: "71%",
    caption: "Millennials account for 71% of Twitch users.",
  },
  marketShare: {
    source: "https://www.similarweb.com/website/twitch.tv#overview",
    title: "U.S Market Share on Twitch",
    value: "20%",
    caption: "The United States accounts for 20% of Twitch's market share.",
  },
};

const history: { date: PartialDateString; content: [string, ...string[]] }[] = [
  {
    date: "2021-02",
    content: [
      "Alveus Sanctuary was founded by Maya",
      // TODO: Add more details (land purchase?)
    ],
  },
  {
    date: "2021-04",
    content: [
      "Parrot Aviary constructed",
      "A 20ft by 20ft wire-mesh enclosure at a cost of $52,000 USD, plus an addon with enclosed rooms for the parrots to shelter in at a further cost of $7,000 USD.",
      "Sponsored by Michele Raffin (previous owner of the parrots), and flimflam.",
    ],
  },
  // TODO: Add all other enclosures
  // TODO: Add key fundraising milestones
];

const AboutAlveusPage: NextPage = () => {
  return (
    <>
      <Meta
        title="About Alveus"
        description="Alveus is a non profit organization founded by Maya Higa that functions as an exotic animal sanctuary and as a virtual education center facility to provide permanent homes to non-releasable exotic animals."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section
        dark
        className="py-8"
        containerClassName="flex flex-wrap items-center justify-between"
      >
        <div className="flex w-full flex-col gap-4 pb-16 pt-4 md:w-2/5 md:py-24">
          <Heading className="my-0">About Alveus Sanctuary</Heading>
          <p className="text-lg">
            Alveus is a non profit organization founded by Maya Higa that
            functions as an exotic animal sanctuary and as a virtual education
            center facility to provide permanent homes to non-releasable exotic
            animals.
          </p>
          <p className="text-lg">
            Watch the video to learn more about why Maya founded Alveus, and the
            mission of the organization.
          </p>
        </div>

        <div className="w-full max-w-2xl p-4 pt-8 md:mx-0 md:w-3/5 md:pt-4">
          <Lightbox>
            {({ Trigger }) => (
              <Trigger videoId="jXTqWIc--jo">
                <Preview videoId="jXTqWIc--jo" />
                <Heading level={2} className="text-center">
                  Announcing Alveus
                </Heading>
              </Trigger>
            )}
          </Lightbox>
        </div>
      </Section>

      <div className="relative">
        <Image
          src={leafLeftImage3}
          alt=""
          className="pointer-events-none absolute -top-20 right-0 z-10 hidden h-auto w-1/2 max-w-[12rem] -scale-x-100 select-none lg:block"
        />

        <Section className="text-center">
          <Heading id="twitch" level={2}>
            Why Twitch.tv
          </Heading>
          <p className="mx-auto max-w-2xl">
            Twitch offers our guests the opportunity to connect with viewers
            from around the globe, and allows us to target a demographic that is
            otherwise far less likely to be exposed to conservation education.
            We see Twitch as an untapped reservoir for doing good.
          </p>

          <ul className="mb-2 mt-6 flex flex-wrap justify-center md:mt-12">
            {Object.entries(stats).map(([key, stat]) => (
              <li key={key} className="basis-full py-4 md:basis-1/3 md:px-4">
                <Link
                  href={stat.source}
                  className="flex h-full flex-col justify-center rounded-2xl bg-alveus-green px-6 py-6 text-alveus-tan shadow-lg transition-shadow hover:shadow-xl"
                  external
                  custom
                >
                  <p className="text-center text-xl font-bold">{stat.title}</p>
                  <p className="my-4 text-center text-3xl font-extrabold">
                    {stat.value}
                  </p>
                  <p className="text-center">{stat.caption}</p>
                </Link>
              </li>
            ))}
          </ul>

          <p>Click each box for source.</p>
        </Section>
      </div>

      <Section dark>
        <div className="flex flex-wrap-reverse items-center">
          <div className="basis-full pt-8 md:basis-1/2 md:pr-8 md:pt-0">
            <Image
              src={mayaImage}
              alt="Maya Higa, holding an owl in one photo, and a falcon in the second photo"
              className="ml-auto h-auto w-full max-w-lg"
            />
          </div>

          <div className="basis-full md:basis-1/2 md:px-4">
            <Heading id="maya" level={2} className="italic">
              Maya Higa founded Alveus in February 2021
            </Heading>
            <p>
              She is a top streamer on Twitch.tv, with a large following across
              many social platforms. She is a licensed falconer and wildlife
              conservationist with a passion for educating others.
            </p>

            <Link
              className="mt-8 inline-block rounded-full border-2 border-alveus-tan px-6 py-2 text-xl transition-colors hover:bg-alveus-tan hover:text-alveus-green"
              custom
              href="/about/maya"
            >
              Learn more about Maya
            </Link>
          </div>
        </div>
      </Section>

      <div className="relative">
        <Image
          src={leafLeftImage1}
          alt=""
          className="pointer-events-none absolute -top-32 left-0 z-10 hidden h-auto w-1/2 max-w-[10rem] select-none lg:block 2xl:-bottom-48 2xl:max-w-[12rem]"
        />

        <Section>
          <Heading
            id="history"
            level={2}
            className="text-center text-5xl text-alveus-green"
          >
            Alveus&apos; History
          </Heading>

          <Timeline
            items={history.map(({ date, content }) => ({
              date: formatPartialDateString(date),
              content: (
                <>
                  <p className="text-lg">{content[0]}</p>
                  {content.slice(1).map((paragraph, idx) => (
                    <p key={idx} className="mt-2">
                      {paragraph}
                    </p>
                  ))}
                </>
              ),
            }))}
          />

          {/* TODO: Embed tour videos? Maybe split the timeline into parts? */}
          {/* TODO: Link to the events page from fundraising items? */}
        </Section>
      </div>

      {/* TODO: CTA slice for ambassadors */}

      {/* Grow the last section to cover the page */}
      <div className="relative flex flex-grow flex-col">
        <Image
          src={leafLeftImage2}
          alt=""
          className="pointer-events-none absolute -bottom-24 right-0 z-10 hidden h-auto w-1/2 max-w-[12rem] -scale-x-100 select-none lg:block"
        />

        <Section
          dark
          className="flex-grow bg-alveus-green-900"
          containerClassName="flex flex-col-reverse md:flex-row-reverse gap-4 md:gap-10"
        >
          <div>
            <Heading id="seal" level={2}>
              Gold rated transparency
            </Heading>

            <p>
              Alveus&apos; transparency has been rated gold on Candid
              (GuideStar). Candid is a leading source of information on
              non-profit organizations, helping donors and funders make informed
              decisions about their support. Check out our{" "}
              <Link
                external
                href="https://www.guidestar.org/profile/86-1772907"
              >
                non-profit profile on Candid
              </Link>
              .
            </p>
          </div>

          <Link
            className="flex-shrink-0"
            external
            custom
            href="https://www.guidestar.org/profile/86-1772907"
          >
            <Image
              className="h-40 w-40"
              src={imageGuidestarSeal}
              width={200}
              height={200}
              alt="Gold Transparency Seal 2023 by Candid"
            />
          </Link>
        </Section>
      </div>
    </>
  );
};

export default AboutAlveusPage;
