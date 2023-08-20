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

import IconArrowRight from "@/icons/IconArrowRight";

import mayaImage from "@/assets/maya.png";
import leafLeftImage1 from "@/assets/floral/leaf-left-1.png";
import leafLeftImage2 from "@/assets/floral/leaf-left-2.png";
import leafLeftImage3 from "@/assets/floral/leaf-left-3.png";
import imageGuidestarSeal from "@/assets/guidestar-candid-gold-seal.svg";

const sources = {
  twitchAdvertising: {
    text: "Twitch Advertising, Audience. August 2023",
    link: "https://twitchadvertising.tv/audience/",
  },
  influencerMarketingHub: {
    text: "Influencer Marketing Hub, Twitch Statistics. August 2023",
    link: "https://influencermarketinghub.com/twitch-stats/",
  },
  semrush: {
    text: "Semrush, Twitch.tv. June 2023",
    link: "https://www.semrush.com/website/twitch.tv/overview/",
  },
} as const;

type Stat = {
  source: keyof typeof sources;
  title: string;
  value: string;
  caption: string;
};

const stats: Record<string, Stat> = {
  dailyViewers: {
    source: "twitchAdvertising",
    title: "Twitch's Daily Viewers",
    value: "35 Million",
    caption:
      "Each day, an average of 35 million visitors tune in to a Twitch stream.",
  },
  viewerAge: {
    source: "twitchAdvertising",
    title: "Viewers Aged 18 to 34",
    value: "> 70%",
    caption: "On Twitch, over 70% of the viewers are aged between 18 and 34.",
  },
  watchTime: {
    source: "influencerMarketingHub",
    title: "Average Daily Watch Time",
    value: "95 Minutes",
    caption:
      "The average user spends 95 minutes each day watching live streams on Twitch.",
  },
  sitePopularity: {
    source: "semrush",
    title: "Global Site Popularity",
    value: "35th",
    caption: "Worldwide, Twitch.tv is the 35th most popular website online.",
  },
  marketShare: {
    source: "semrush",
    title: "U.S Market Share on Twitch",
    value: "> 20%",
    caption:
      "The United States accounts for over 20% of Twitch's market share.",
  },
} as const;

type HistoryCTA = { key: string; cta: React.ReactNode };
type HistoryItem = {
  key: string;
  date: PartialDateString;
  content: [string, ...string[]];
  link?: {
    text: string;
    href: string;
  };
};
type HistoryItems = { key: string; items: HistoryItem[] };

const history: [HistoryItems, ...(HistoryCTA | HistoryItems)[]] = [
  {
    key: "initial-construction",
    items: [
      {
        key: "idea",
        date: "2020-12", // https://youtu.be/7DvtjAqmWl8?t=138
        content: ["Initial idea + 3-5 year plan written"],
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
        link: {
          text: "Explore Alveus events",
          href: "/events#fundathon-2021",
        },
      },
      {
        key: "fencing-pasture",
        date: "2021-05", // https://youtu.be/pTnYmPKDaF8?t=2373 + https://youtu.be/QPsbX1HefRk?t=1230
        content: [
          "Fencing and pasture installed",
          "A total of 4,000 linear feet of predator-proof fencing was installed around the property, and a barn was built at the top of the pasture.",
        ],
      },
      {
        key: "parrot-aviary",
        date: "2021-06", // https://youtu.be/rSaWp3pEvFE?t=5729
        content: [
          "Parrot Aviary constructed",
          "A 20ft by 20ft wire-mesh enclosure with a solid floor and planters, plus an addon with enclosed rooms for the parrots to shelter in and storage for supplies.",
          "Sponsored by Michele Raffin (previous owner of the parrots), and flimflam.",
        ],
      },
      {
        key: "crow-aviary",
        date: "2021-07", // https://youtu.be/BgtVRjQC0Vk?t=917
        content: [
          "Crow Aviary constructed",
          "A 15ft by 18ft wire-mesh enclosure, with a solid rear wall.",
          "Sponsored by PointCrow.",
        ],
      },
      {
        key: "chicken-coop",
        date: "2021-08", // https://youtu.be/W05oJEwNI_s?t=810
        content: [
          "Chicken Coop constructed",
          "A 10ft by 20ft wire-mesh enclosure with a bark/dirt floor, and a 6ft by 6ft indoor area for shelter at night.",
        ],
      },
    ],
  },
  {
    key: "tour-part-1",
    cta: (
      <div className="flex flex-wrap items-center gap-y-16">
        <div className="basis-full md:basis-1/2 md:px-4">
          <Heading id="tour-part-1" level={3} className="italic">
            Alveus Tour Part 1
          </Heading>

          <p className="mt-4 text-lg">
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
          "A large 50ft by 40ft wire-mesh building with grass inside, allowing for training and enrichment activities as well as hosting content collaborations.",
        ],
      },
      {
        key: "first-studio-stream",
        date: "2021-08-16",
        content: [
          "First stream from the studio",
          "Animal Quest Episode 1: Chicken Edition was the first official stream hosted from the Alveus studio.",
        ],
        link: {
          text: "Watch the episode",
          href: "/animal-quest/chicken-edition",
        },
      },
      {
        key: "kayla-connor",
        date: "2021-10", // https://youtu.be/7DvtjAqmWl8?t=145
        content: [
          "Kayla and Connor join the team",
          "Kayla joins Alveus as the Animal Care & Training Manager, and Connor joins as the Operations Manager.",
        ],
        link: {
          text: "Meet our staff",
          href: "/about/staff",
        },
      },
      {
        key: "halloween-fundraiser",
        date: "2021-10-31",
        content: [
          "Halloween fundraiser stream",
          "Over $101,000 USD raised through donations during the live event at Alveus, with 34 creators from the industry joining us.",
        ],
        link: {
          text: "Explore Alveus events",
          href: "/events#halloween-2021",
        },
      },
      {
        key: "fox-enclosure",
        date: "2022-01", // https://youtu.be/DN8apMfuNCY?t=19152 + https://youtu.be/Bu0HVHcMc_M?t=6822
        content: [
          "Fox enclosure constructed",
          "A 40ft by 26ft wire-mesh enclosure, with a grass/dirt floor, trees + tree-house, and an air-conditioned indoor area.",
          "Sponsored by QTCinderalla and her community.",
        ],
      },
      {
        key: "first-collab-stream",
        date: "2022-04-21",
        content: [
          "First educational collaboration stream",
          "Jack Manifold and his community joined us at Alveus for a stream exploring Alveus, getting to know many of our ambassadors at the sanctuary and learning about their conservation missions.",
        ],
        link: {
          text: "Watch the collaboration",
          href: "/collaborations#jack-manifold",
        },
      },
      {
        key: "art-auction",
        date: "2022-04",
        content: [
          "Art Auction fundraiser",
          "Livestream viewers donated over $42,000 USD for signed prints and artwork produced by the ambassadors at Alveus.",
        ],
        link: {
          text: "Explore Alveus events",
          href: "/events#art-auction-2022",
        },
      },
      {
        key: "falcon-aviary",
        date: "2022-09", // https://youtu.be/Gat85y-RGBo?t=11592 + https://youtu.be/gbTYxTTHK30
        content: [
          "Falcon/Crow Aviary constructed",
          "Originally built for Orion, Alveus' falcon, prior to his passing. Re-purposed as the new crow aviary.",
          "A two-part enclosure with a 8ft by 17ft sheltered indoor area and a 12ft by 17ft wire-mesh outdoor area, all with pea-gravel flooring.",
          "Sponsored by Oni Studios, and Merkx.",
        ],
      },
    ],
  },
  {
    key: "tour-part-2",
    cta: (
      <div className="flex flex-wrap-reverse items-center gap-y-16">
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
          <Heading id="tour-part-2" level={3} className="italic">
            Alveus Tour Part 2
          </Heading>

          <p className="mt-4 text-lg">
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
        key: "valentines-day",
        date: "2023-02",
        content: [
          "Valentine's Day fundraiser",
          "Over $40,000 USD was donated by viewers of the livestream event, with hand-crafted plushies being sent to 24 donors.",
        ],
        link: {
          text: "Explore Alveus events",
          href: "/events#valentines-2023",
        },
      },
      {
        key: "art-auction",
        date: "2023-04",
        content: [
          "Art Auction fundraiser",
          "Over 30 pieces of artwork produced by our ambassadors, and over 250 signed prints, were donated for during the event, raising over $63,000 USD.",
        ],
        link: {
          text: "Explore Alveus events",
          href: "/events#art-auction-2023",
        },
      },
      {
        key: "marmoset-enclosure",
        date: "2023-06", // https://youtu.be/3LV02t0ZWR8?t=820
        content: [
          "Marmoset enclosure retro-fitted",
          "The original crow aviary was retro-fitted, with a new 8ft by 18ft indoor area added to the rear to provide air-conditioned shelter for the marmosets and space to store supplies.",
        ],
      },
      {
        key: "summer-camp",
        date: "2023-07-21",
        content: [
          "Summer Camp and first merch drop",
          "Alveus hosted a 24-hour long charity stream from the training center, accompanied by our first limited-time merch drop to raise funds for the sanctuary.",
        ],
        link: {
          text: "Explore Alveus events",
          href: "/events#summer-camp-2023",
        },
      },
    ],
  },
];

const transformHistoryItem = (item: HistoryItem) => ({
  key: item.key,
  date: formatPartialDateString(item.date),
  content: (
    <>
      <p className="font-serif text-lg font-bold">{item.content[0]}</p>
      {item.content.slice(1).map((paragraph, idx) => (
        <p key={idx} className="mt-2">
          {paragraph}
        </p>
      ))}
      {item.link && (
        <p className="mt-2">
          <Link
            external={!item.link.href.startsWith("/")}
            href={item.link.href}
            dark
            className="flex items-center"
          >
            {item.link.text}
            {item.link.href.startsWith("/") && (
              <IconArrowRight size={16} className="ml-1 mt-0.5" />
            )}
          </Link>
        </p>
      )}
    </>
  ),
});

const AboutAlveusPage: NextPage = () => {
  return (
    <>
      <Meta
        title="About Alveus"
        description="Alveus is a nonprofit organization founded by Maya Higa that functions as an exotic animal sanctuary and as a virtual education center facility to provide permanent homes to non-releasable exotic animals."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section
        dark
        className="py-8"
        containerClassName="flex flex-wrap items-center justify-between"
      >
        <div className="flex basis-full flex-col gap-4 pb-16 pt-4 md:basis-1/2 md:py-24">
          <Heading className="my-0">About Alveus Sanctuary</Heading>

          <p className="text-lg">
            Alveus is a nonprofit organization founded by Maya Higa that
            functions as an exotic animal sanctuary and as a virtual education
            center facility to provide permanent homes to non-releasable exotic
            animals.
          </p>

          <p className="text-lg">
            We aim to spread conservation awareness and education to the next
            generation through harnessing the power of online platforms, such as
            Twitch, YouTube, Instagram and TikTok. We are committed to
            delivering high-quality, curated and well-researched educational
            content that tells a story, through series such as Animal Quest, and
            through collaborations with other creators.
          </p>

          <p className="text-lg">
            Viewers can also follow along with our ambassadors and their daily
            lives at the sanctuary, fostering a deeper connection between our
            audience, the ambassadors, and the species they represent, while
            learning about the conservation stories for each of them. Each
            ambassador at Alveus is chosen with a purpose, being representatives
            of their species with unique stories to be told about conservation
            or consumer choice.
          </p>

          <p className="text-lg">
            Our goal is to inspire online audiences across the world to get
            involved with conservation efforts. We hope to create more awareness
            for the diverse planet we live on, and to encourage people to take
            action to protect it, with every individual being able to make a
            difference.
          </p>
        </div>

        <div className="max-w-2xl basis-full p-4 pt-8 md:mx-0 md:basis-1/2 md:pt-4">
          <Lightbox>
            {({ Trigger }) => (
              <Trigger videoId="jXTqWIc--jo">
                <Preview videoId="jXTqWIc--jo" />

                <Heading level={2} className="text-center">
                  Announcing Alveus
                </Heading>

                <p className="text-center italic">
                  Watch the video to learn more about why Maya founded Alveus.
                </p>
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
          <Heading id="twitch" level={2} link>
            Why Twitch.tv
          </Heading>

          <p className="mx-auto max-w-3xl">
            Twitch offers Alveus and our guests the opportunity to connect with
            online viewers from around the globe. Through educational content
            collaborations with other creators, and with our own streams, we can
            maximize the number of people we can reach who may otherwise not be
            exposed to conservation efforts and stories.
          </p>

          <p className="mt-4">
            We see Twitch as an untapped reservoir for doing good.
          </p>

          <ul className="mb-2 mt-6 flex flex-wrap justify-center md:mt-12">
            {Object.entries(stats).map(([key, stat]) => (
              <li
                key={key}
                className="basis-full py-4 md:basis-1/2 md:px-4 xl:basis-1/3"
              >
                <div className="flex h-full flex-col justify-center rounded-2xl bg-alveus-green px-6 py-6 text-alveus-tan shadow-lg transition-shadow hover:shadow-xl">
                  <div className="mx-auto max-w-xs">
                    <p className="text-center text-xl font-bold">
                      {stat.title}
                    </p>
                    <p className="my-4 text-center text-3xl font-extrabold">
                      {stat.value}
                    </p>
                    <p className="text-center">
                      {stat.caption}{" "}
                      <Link
                        href="#twitch-sources"
                        custom
                        className="align-super text-xs transition-colors hover:text-red-300 hover:underline"
                      >
                        [
                        {Object.keys(sources).findIndex(
                          (source) => source === stat.source,
                        ) + 1}
                        ]
                      </Link>
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <ul className="mt-8 text-left text-xs opacity-75" id="twitch-sources">
            {Object.values(sources).map((source, idx) => (
              <li key={idx} className="mb-1">
                [{idx + 1}]{" "}
                <Link external href={source.link}>
                  {source.text}
                </Link>
              </li>
            ))}
          </ul>
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
            <Heading id="maya" level={2} className="italic" link>
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
            link
          >
            Alveus&apos; History
          </Heading>

          <Timeline
            after={"cta" in (history[1] || {}) ? "-bottom-20" : undefined}
            items={history[0].items.map(transformHistoryItem)}
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
              items={section.items.map(transformHistoryItem)}
            />
          </Section>
        ) : (
          <Section key={section.key} dark>
            {section.cta}
          </Section>
        ),
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
            <Heading id="transparency" level={2} link>
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
