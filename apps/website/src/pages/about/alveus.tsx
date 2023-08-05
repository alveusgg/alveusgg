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

type HistoryCTA = { key: string; cta: React.ReactNode };
type HistoryItem = {
  key: string;
  date: PartialDateString;
  content: [string, ...string[]];
};
type HistoryItems = { key: string; items: HistoryItem[] };

const history: [HistoryItems, ...(HistoryCTA | HistoryItems)[]] = [
  {
    key: "initial-construction",
    items: [
      {
        key: "idea",
        date: "2020-12", // https://youtu.be/7DvtjAqmWl8?t=138
        content: ["Initial idea + 3-5 year plan"],
      },
      {
        key: "founding",
        date: "2021-02-10",
        content: [
          "Alveus Sanctuary was founded by Maya",
          "A 15-acre property in Texas was purchased on which Alveus would be built.",
          "Ella joined the team from the start to handle animal care duties.",
        ],
      },
      {
        key: "fund-a-thon",
        date: "2021-02",
        content: [
          "Fund-a-thon charity stream",
          "Over $573,000 USD raised through donations during the 20-hour long livestream to kick-start the sanctuary.",
        ],
      },
      {
        key: "fencing-pasture",
        date: "2021-05", // https://youtu.be/pTnYmPKDaF8?t=2373 + https://youtu.be/QPsbX1HefRk?t=1230
        content: [
          "Fencing and pasture installed",
          "A total of 4,000 linear feet of predator-proof fencing was installed around the property for a cost of $72,000 USD.",
        ],
      },
      {
        key: "parrot-aviary",
        date: "2021-06", // https://youtu.be/rSaWp3pEvFE?t=5729
        content: [
          "Parrot Aviary constructed",
          "A 20ft by 20ft wire-mesh enclosure at a cost of $52,000 USD, plus an addon with enclosed rooms for the parrots to shelter in at a further cost of $7,000 USD.",
          "Sponsored by Michele Raffin (previous owner of the parrots), and flimflam.",
        ],
      },
      {
        key: "crow-aviary",
        date: "2021-07", // https://youtu.be/BgtVRjQC0Vk?t=917
        content: [
          "Crow Aviary constructed",
          "A wire-mesh enclosure, built for a total of $8,000 USD.",
          "Sponsored by PointCrow.",
        ],
      },
      {
        key: "chicken-coop",
        date: "2021-08", // https://youtu.be/W05oJEwNI_s?t=810
        content: [
          "Chicken Coop constructed",
          "A 10ft by 20ft wire-mesh enclosure, with a 6ft by 6ft indoor area, built for a total of $8,000 USD.",
        ],
      },
    ],
  },
  {
    key: "tour-part-1",
    cta: (
      <div className="flex flex-wrap items-center gap-y-8">
        <div className="basis-full md:basis-1/2 md:px-4">
          <Heading id="tour-part-1" level={2} className="italic">
            Alveus Tour Part 1
          </Heading>

          <p className="text-lg">
            Watch the video and join Maya for a tour of Alveus, exploring the
            parrot aviary, the chicken coop, and the pasture. Meet some of our
            ambassadors and learn about their stories.
          </p>
        </div>

        <div className="basis-full md:basis-1/2 md:px-4">
          <Lightbox>
            {({ Trigger }) => (
              <Trigger videoId="4_ZrMe_6-CU">
                <Preview videoId="4_ZrMe_6-CU" />
              </Trigger>
            )}
          </Lightbox>
        </div>
      </div>
    ),
  },
  {
    key: "expanding-the-team",
    items: [
      {
        key: "training-center",
        date: "2021-08", // https://youtu.be/i0DbJjU41eM?t=1409
        content: [
          "Training Center constructed",
          "A large wire-mesh building with grass inside, allowing for training and enrichment activities as well as hosting content collaborations, built for a total of $135,000 USD.",
        ],
      },
      {
        key: "first-studio-stream",
        date: "2021-08-16",
        content: [
          "First stream from the studio",
          "Animal Quest Episode 1: Chicken Edition was the first official stream hosted from the Alveus studio.",
        ],
      },
      {
        key: "kayla-connor",
        date: "2021-10", // https://youtu.be/7DvtjAqmWl8?t=145
        content: [
          "Kayla and Connor join the team",
          "Kayla joins Alveus as the Animal Care & Training Manager, and Connor joins as the Operations Manager.",
        ],
      },
      {
        key: "halloween-fundraiser",
        date: "2021-10-31",
        content: [
          "Halloween fundraiser stream",
          "Over $101,000 USD raised through donations during the live event at Alveus, with 34 creators from the industry joining us.",
        ],
      },
      {
        key: "fox-enclosure",
        date: "2022-01", // https://youtu.be/DN8apMfuNCY?t=19152 + https://youtu.be/Bu0HVHcMc_M?t=6822
        content: [
          "Fox enclosure constructed",
          "A 40ft by 26ft wire-mesh enclosure, with a grass/dirt floor, trees + tree-house, built for a total of $48,000 USD.",
          "Sponsored by QTCinderalla and her community.",
        ],
      },
      {
        key: "first-collab-stream",
        date: "2022-04-22",
        content: [
          "First educational collaboration stream",
          "Jack Manifold and his community joined us at Alveus for a stream exploring Alveus, getting to know many of our ambassadors at the sanctuary and learning about their conservation missions.",
        ],
      },
      {
        key: "falcon-aviary",
        date: "2022-09", // https://youtu.be/Gat85y-RGBo?t=11592 + https://youtu.be/gbTYxTTHK30
        content: [
          "Falcon/Crow Aviary constructed",
          "Originally build for Orion, Alveus' falcon, prior to his passing. Re-purposed as the new crow aviary.",
          "A two-part enclosure with a sheltered indoor area and a wire-mesh outdoor area, built for a total of $15,000 USD.",
          "Sponsored by Oni Studios, and Merck X.",
        ],
      },
    ],
  },
  {
    key: "tour-part-2",
    cta: (
      <div className="flex flex-wrap-reverse items-center gap-y-8">
        <div className="basis-full md:basis-1/2 md:px-4">
          <Lightbox>
            {({ Trigger }) => (
              <Trigger videoId="_PRVsl9Nxok">
                <Preview videoId="_PRVsl9Nxok" />
              </Trigger>
            )}
          </Lightbox>
        </div>

        <div className="basis-full md:basis-1/2 md:px-4">
          <Heading id="tour-part-2" level={2} className="italic">
            Alveus Tour Part 2
          </Heading>

          <p className="text-lg">
            Watch the video and join Maya for a tour around more of Alveus,
            exploring the training center, the studio, the reptile room and
            critter cave, the nutrition house, crow aviary and the new fox
            enclosure.
          </p>
        </div>
      </div>
    ),
  },
  {
    key: "24-7-streams-and-beyond",
    items: [
      {
        key: "24-7-streams",
        date: "2022-11-16",
        content: [
          "24/7 live-cam streams started",
          "Alveus started streaming 24/7 on Twitch with live cams of many of our ambassadors.",
        ],
      },
      {
        key: "marmoset-enclosure",
        date: "2023-06", // https://youtu.be/3LV02t0ZWR8?t=820
        content: [
          "Marmoset enclosure retro-fitted",
          "The original crow aviary was retro-fitted to house marmosets, with a new indoor area added to the rear.",
        ],
      },
      {
        key: "summer-camp",
        date: "2023-07-21",
        content: [
          "Summer Camp and first merch drop",
          "Alveus hosted a 24-hour long charity stream from the training center, accompanied by our first limited-time merch drop to raise funds for the sanctuary.",
        ],
      },
      // TODO: Lindsay joins
    ],
  },
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
            className="mb-16 text-center text-5xl text-alveus-green"
          >
            Alveus&apos; History
          </Heading>

          <Timeline
            after={"cta" in (history[1] || {}) ? "-bottom-20" : undefined}
            items={history[0].items.map(({ key, date, content }) => ({
              key,
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
        </Section>
      </div>

      {history.slice(1).map((section, idx) =>
        "items" in section ? (
          <Section key={section.key}>
            <Timeline
              before={"cta" in (history[idx] || {}) ? "-top-20" : undefined}
              after={
                "cta" in (history[idx + 2] || {}) ? "-bottom-20" : undefined
              }
              items={section.items.map(({ key, date, content }) => ({
                key,
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
          </Section>
        ) : (
          <Section key={section.key} dark>
            {section.cta}
          </Section>
        )
      )}

      {/* TODO: CTA slice for ambassadors? */}

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
