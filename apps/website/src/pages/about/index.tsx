import { type NextPage } from "next";
import Image, { type StaticImageData } from "next/image";
import { type ReactNode, useState } from "react";

import { env } from "@/env";

import {
  type PartialDateString,
  formatPartialDateString,
} from "@/utils/datetime-partial";

import Box from "@/components/content/Box";
import Button from "@/components/content/Button";
import Heading from "@/components/content/Heading";
import Lightbox from "@/components/content/Lightbox";
import Link from "@/components/content/Link";
import { MayaImage } from "@/components/content/Maya";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import {
  StreamEmbed,
  StreamPreview,
  type StreamSource,
  getStreamUrlIframe,
} from "@/components/content/Stream";
import SubNav from "@/components/content/SubNav";
import Timeline from "@/components/content/Timeline";
import Transparency from "@/components/content/Transparency";
import {
  YouTubeEmbed,
  YouTubeLightbox,
  YouTubePreview,
} from "@/components/content/YouTube";

import IconArrowRight from "@/icons/IconArrowRight";
import IconExternal from "@/icons/IconExternal";
import IconQuote from "@/icons/IconQuote";

import leafLeftImage1 from "@/assets/floral/leaf-left-1.png";
import leafLeftImage2 from "@/assets/floral/leaf-left-2.png";
import leafLeftImage3 from "@/assets/floral/leaf-left-3.png";
import forbes from "@/assets/in-the-news/forbes.svg";
import yahooEntertainment from "@/assets/in-the-news/yahoo-entertainment.svg";

const sectionLinks = [
  { name: "Twitch.tv", href: "#twitch" },
  { name: "In The News", href: "#news" },
  { name: "Founding", href: "#maya" },
  { name: "History", href: "#history" },
  { name: "Tour Part 1", href: "#tour-part-1" },
  { name: "Tour Part 2", href: "#tour-part-2" },
  { name: "Recap 2024", href: "#recap-2024" },
  { name: "Transparency", href: "#transparency" },
];

type Source = {
  text: string;
  link: string;
};

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
} as const satisfies Record<string, Source>;

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
};

type NewsCore = {
  title: string;
};

type NewsArticle = {
  href: string;
  quote: string;
  logo: StaticImageData;
};

type NewsVideo = Partial<Omit<NewsArticle, "logo">> & {
  video: ({ type: "stream" } & StreamSource) | { type: "youtube"; id: string };
};

type News = NewsCore & (NewsArticle | NewsVideo);

const news: Record<string, News> = {
  cbs: {
    title: "CBS News Mornings",
    href: "https://www.cbsnews.com/boston/video/gen-z-jane-goodall-saves-wildlife-with-streaming-wildlife-sanctuary/",
    quote: 'At 26, Maya Higa is the "Gen Z Jane Goodall"',
    video: {
      type: "stream",
      id: "dc685110b475b84f0052991aa9f93110",
      cu: "agf91muwks8sd9ee",
    },
  },
  kxan: {
    title: "KXAN Austin",
    href: "https://www.kxan.com/news/texas/how-a-texas-sanctuary-uses-social-media-to-highlight-animal-conservation-needs/",
    quote:
      "a global outreach where thousands tune in at any given time to watch the animals in their sanctuary habitat",
    video: {
      type: "stream",
      id: "4572586849db66c2251e6e36f0134edc",
      cu: "agf91muwks8sd9ee",
    },
  },
  forbes: {
    title: "Forbes",
    href: "https://www.forbes.com/sites/anharkarim/2025/12/01/what-makes-twitch-streams-so-engaging/",
    quote:
      "Conservationist and Twitch streamer Maya Higa brings education and entertainment to the platform",
    logo: forbes,
  },
  lowes: {
    title: "Lowe's Red Vests x MrBeast",
    href: "https://corporate.lowes.com/newsroom/stories/serving-communities/lowes-red-vests-power-sanctuary-makeover-alongside-mrbeast",
    quote:
      "Seeing the habitats up close and the sanctuary's dedication to protecting animals across Texas was inspiring",
    video: {
      type: "youtube",
      id: "8TieP5VgieE",
    },
  },
  yahoo: {
    title: "Yahoo! Entertainment",
    href: "https://www.yahoo.com/entertainment/articles/winnie-cow-going-viral-twitch-220000265.html",
    quote:
      "Twitch isn't just for gamers anymore, as evidenced by a cow named Winnie who has become a viral sensation on the livestreaming platform",
    logo: yahooEntertainment,
  },
  powderBlue: {
    title: "Powder Blue",
    href: "https://www.creatormag.blog/p/introducing-our-next-cover-star",
    quote:
      "Maya has become a beloved science communicator as well as a staple in the streamer community",
    video: {
      type: "youtube",
      id: "xM62zRCqcnI",
    },
  },
  weatherChannel: {
    title: "The Weather Channel",
    video: {
      type: "stream",
      id: "5cd3c1f8a0c2311c008021bf7973f3fb",
      cu: "agf91muwks8sd9ee",
    },
  },
};

const newsLightboxItems = Object.entries(news).reduce<
  Record<string, ReactNode>
>((acc, [key, item]) => {
  if (!("video" in item)) {
    return acc;
  }

  switch (item.video.type) {
    case "stream":
      return {
        ...acc,
        [key]: <StreamEmbed src={item.video} caption={item.title} controls />,
      };

    case "youtube":
      return {
        ...acc,
        [key]: <YouTubeEmbed videoId={item.video.id} caption={item.title} />,
      };
  }
}, {});

type HistoryCTA = { key: string; cta: ReactNode };
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
          <Heading id="tour-part-1" level={3} className="scroll-mt-52 italic">
            Alveus Tour Part 1
          </Heading>

          <p className="mt-4 text-lg">
            Watch the video and join Maya for a tour of Alveus, exploring the
            parrot aviary, the chicken coop, and the pasture. Meet some of our
            ambassadors and learn about their stories.
          </p>
        </div>

        <div className="basis-full md:basis-1/2 md:px-4">
          <YouTubeLightbox videoId="4_ZrMe_6-CU" />
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
          "Sponsored by QTCinderella and her community.",
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
          <YouTubeLightbox videoId="_PRVsl9Nxok" />
        </div>

        <div className="basis-full md:basis-1/2 md:px-4">
          <Heading id="tour-part-2" level={3} className="scroll-mt-52 italic">
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
        key: "valentines-day-2023",
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
        key: "art-auction-2023",
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
        key: "lindsay",
        date: "2023-07",
        content: [
          "Lindsay joins the Alveus team",
          "Bringing a wealth of animal care experience and knowledge, Lindsay joins the team as an Animal Care Coordinator.",
        ],
        link: {
          text: "Meet our staff",
          href: "/about/staff",
        },
      },
      {
        key: "summer-camp-2023",
        date: "2023-07",
        content: [
          "Summer Camp and merch drop",
          "Alveus hosted a 24-hour long charity stream from the training center, accompanied by a limited-time merch drop to raise funds for the sanctuary.",
        ],
        link: {
          text: "Explore Alveus events",
          href: "/events#summer-camp-2023",
        },
      },
      {
        key: "fall-carnival-2023",
        date: "2023-11",
        content: [
          "Fall Carnival",
          "To celebrate fall and raise some money for the sanctuary, Alveus hosted a carnival-themed stream where live viewers could compete against each other and the ambassadors in mini-games.",
        ],
        link: {
          text: "Explore Alveus events",
          href: "/events#fall-carnival-2023",
        },
      },
      {
        key: "streamer-awards-2024",
        date: "2024-01",
        content: [
          "Nomination for Streamer Awards",
          "Alveus Sanctuary was nominated, along with three other Twitch channels, for the Streamer Awards 2024 in the category of Best Shared Channel.",
        ],
      },
      {
        key: "valentines-day-2024",
        date: "2024-02",
        content: [
          "Valentine's Day fundraiser",
          "Once again, Alveus hosted a fundraiser for Valentine's Day, sending over 450 signed postcards to donors, raising over $32,000 USD.",
        ],
        link: {
          text: "Explore Alveus events",
          href: "/events#valentines-2024",
        },
      },
      {
        key: "sruti",
        date: "2024-04",
        content: [
          "Sruti joins the Alveus team",
          "As the number of ambassadors at Alveus continues to grow, Sruti joins the team as an Animal Care Coordinator.",
        ],
        link: {
          text: "Meet our staff",
          href: "/about/staff",
        },
      },
      {
        key: "wolf-enclosure",
        date: "2024-05", // https://youtu.be/wAsLMuj_iLs?t=4925
        content: [
          "Wolf enclosure constructed",
          "Located behind the crow and fox enclosures, the wolf enclosure is a massive open-air 200ft by 65ft enclosure, including a river/pond, with a 30ft by 30ft air-conditioned indoor area on the side.",
        ],
      },
      {
        key: "art-auction-2024",
        date: "2024-05",
        content: [
          "Art Auction fundraiser",
          "Once again hosted in the Session Yard at Alveus, the art auction sold 35 paintings from the ambassadors, and just under 500 postcards, raising over $44,000 USD.",
        ],
        link: {
          text: "Explore Alveus events",
          href: "/events#art-auction-2024",
        },
      },
      {
        key: "summer-camp-2024",
        date: "2024-07",
        content: [
          "Summer Camp and merch drop",
          "Accompanied by a limited-time merch drop, Alveus hosted a 12-hour long stream for the staff at Alveus to participate in some fun activities, with over 3 million minutes watched live by the end.",
        ],
        link: {
          text: "Explore Alveus events",
          href: "/events#summer-camp-2024",
        },
      },
      {
        key: "amanda",
        date: "2024-07",
        content: [
          "Amanda joins the Alveus team",
          "Revealed during the Summer Camp stream, Amanda joins the team as another Animal Care Coordinator.",
        ],
        link: {
          text: "Meet our staff",
          href: "/about/staff",
        },
      },
      {
        key: "fall-carnival-2024",
        date: "2024-11",
        content: [
          "Fall Carnival",
          "Celebrating fall and halloween once again, live viewers tuned in to a fundraising stream at Alveus where they could participate in games and activities with the ambassadors.",
        ],
        link: {
          text: "Explore Alveus events",
          href: "/events#fall-carnival-2024",
        },
      },
    ],
  },
  {
    key: "recap-2024",
    cta: (
      <div className="flex flex-wrap-reverse items-center gap-y-16">
        <div className="basis-full md:basis-1/2 md:px-4">
          <YouTubeLightbox videoId="y8jQPL_jO2s" />
        </div>

        <div className="basis-full md:basis-1/2 md:px-4">
          <Heading id="recap-2024" level={3} className="scroll-mt-52 italic">
            Alveus Recap 2024
          </Heading>

          <p className="mt-4 text-lg">
            Join Connor in this video as he recaps the progress at Alveus in
            2024, reviewing the additions to the sanctuary as well as the data
            behind the growth of the organization. He also takes a look back at
            how it all started and shares some of the plans for the coming year.
          </p>
        </div>
      </div>
    ),
  },
  {
    key: "2025-and-beyond",
    items: [
      {
        key: "lukas",
        date: "2025-01",
        content: [
          "Lukas joins the Alveus team",
          "Announced at the start of the year, Lukas joins the team as the Herpetology & Invert Lead as well as a Habitat Specialist.",
        ],
        link: {
          text: "Meet our staff",
          href: "/about/staff",
        },
      },
      {
        key: "new-studio",
        date: "2025-03-05",
        content: [
          "New studio launch",
          "Alveus unveils a completely refurbished studio space, featuring live plant walls, an interactive whiteboard, a new fish tank and improved equipment for live streams.",
        ],
      },
      {
        key: "art-auction-2025",
        date: "2025-04",
        content: [
          "Art Auction fundraiser",
          "Celebrating Earth Day and hosted in the Session Yard at Alveus, the art auction sold 36 pieces of art from the ambassadors and staff, as well as over 450 signed prints, raising over $87,000 USD.",
        ],
        link: {
          text: "Explore Alveus events",
          href: "/events#art-auction-2025",
        },
      },
      {
        key: "colton-chandler",
        date: "2025-04",
        content: [
          "Colton and Chandler join the Alveus team",
          "Colton joins the team as Alveus' Creative Producer, and Chandler joins as the YouTube Channel Manager.",
        ],
        link: {
          text: "Meet our staff",
          href: "/about/staff",
        },
      },
      {
        key: "daniel",
        date: "2025-07",
        content: [
          "Daniel joins the Alveus team",
          "Daniel (Dan the Doorman) joins the team as a Facilities Specialist.",
        ],
        link: {
          text: "Meet our staff",
          href: "/about/staff",
        },
      },
      {
        key: "flooded-road",
        date: "2025-07",
        content: [
          "Road washed out by flooding",
          "Following some severe flooding in Texas, the main road to Alveus was completely washed out. Streamers came together quickly in-person to help get a temporary road in place, and the community raised over $250,000 USD to fund a proper rebuild of the road over the next month.",
        ],
        link: {
          text: "See the before and after",
          href: "https://x.com/AlveusSanctuary/status/1949205368581792113",
        },
      },
      {
        key: "summer-camp-2025",
        date: "2025-08",
        content: [
          "Summer Camp and merch drop",
          'Celebrating summer once again, Alveus hosted a 12-hour long stream at Alveus with staff participating in "The Alveus Games", accompanied by a limited-time merch release, helping to raise funds for the sanctuary.',
        ],
        link: {
          text: "Explore Alveus events",
          href: "/events#summer-camp-2025",
        },
      },
      {
        key: "institute-launch",
        date: "2025-10-19",
        content: [
          "Alveus Research & Recovery Institute was launched",
          "Live on stage at TwitchCon, Maya and the Alveus team announced the launch of the Alveus Research & Recovery Institute, with the Pixel Project to fund the initial development, and Mexican Gray and Red wolves revealed as the first species.",
        ],
        link: {
          text: "Learn more about the institute",
          href: "/institute",
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
              <IconArrowRight size={16} className="mt-0.5 ml-1" />
            )}
          </Link>
        </p>
      )}
    </>
  ),
});

const AboutAlveusPage: NextPage = () => {
  const [newsLightboxOpen, setNewsLightboxOpen] = useState<string>();

  return (
    <>
      <Meta
        title="About Alveus"
        description="Alveus is a nonprofit organization founded by Maya Higa that functions as a wildlife sanctuary and as a virtual education center facility to provide permanent homes to non-releasable animal ambassadors."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section
        dark
        className="py-8"
        containerClassName="flex flex-wrap items-center justify-between"
      >
        <div className="flex basis-full flex-col gap-4 pt-4 pb-16 xl:basis-1/2 xl:py-24">
          <Heading className="my-0">About Alveus Sanctuary</Heading>

          <p className="text-lg">
            Alveus is a nonprofit organization founded by Maya Higa that
            functions as a wildlife sanctuary and as a virtual education center
            facility to provide permanent homes to non-releasable animal
            ambassadors.
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
            learning about the conservation stories for each of them. Each and
            every ambassador at Alveus plays an important role as a
            representative of their species, sharing unique stories about
            conservation and consumer choice.
          </p>

          <p className="text-lg">
            Our goal is to inspire online audiences across the world to get
            involved with conservation efforts. We hope to create more awareness
            for the diverse planet we live on, and to encourage people to take
            action to protect it, with every individual being able to make a
            difference.
          </p>
        </div>

        <div className="basis-full p-4 pt-8 xl:basis-1/2 xl:pt-4">
          <div className="mx-auto max-w-2xl xl:mr-0">
            <YouTubeLightbox videoId="jXTqWIc--jo" />

            <Heading level={2} className="text-center">
              Announcing Alveus
            </Heading>

            <p className="text-center italic">
              Watch the video to learn more about why Maya founded Alveus.
            </p>
          </div>
        </div>
      </Section>

      <SubNav links={sectionLinks} className="z-20" />

      <div className="relative">
        <Image
          src={leafLeftImage3}
          alt=""
          className="pointer-events-none absolute -top-20 right-0 z-30 hidden h-auto w-1/2 max-w-48 -scale-x-100 drop-shadow-md select-none lg:block"
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

          <ul className="mt-6 mb-2 flex flex-wrap justify-center md:mt-12">
            {Object.entries(stats).map(([key, stat]) => (
              <li
                key={key}
                className="basis-full py-4 md:basis-1/2 md:px-4 xl:basis-1/3"
              >
                <Box dark className="flex h-full flex-col justify-center">
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
                </Box>
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

      <Section className="bg-alveus-green-100">
        <Heading id="news" level={2} link className="text-center">
          In The News
        </Heading>

        <div className="mt-8 grid w-full grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3">
          {Object.entries(news).map(([key, item]) => (
            <div key={key} className="flex flex-col">
              <div className="order-last">
                <Heading level={3}>
                  {item.href ? (
                    <Link
                      href={item.href}
                      external
                      custom
                      className="flex items-baseline justify-between gap-1 transition-colors hover:text-alveus-green-800 hover:underline"
                    >
                      {item.title}
                      <IconExternal className="relative -bottom-0.5" />
                    </Link>
                  ) : (
                    item.title
                  )}
                </Heading>

                {item.quote ? (
                  <blockquote className="relative pl-10 text-xl text-balance text-alveus-green italic">
                    <div className="absolute inset-y-0 left-0 h-full w-1 rounded-xs bg-alveus-green" />
                    <IconQuote className="absolute top-0 left-3 size-6 opacity-50" />
                    {item.quote}
                  </blockquote>
                ) : (
                  <div className="h-1 w-32 max-w-full rounded-xs bg-alveus-green" />
                )}
              </div>

              {"video" in item ? (
                <Link
                  href={(() => {
                    switch (item.video.type) {
                      case "stream":
                        return getStreamUrlIframe(item.video, {
                          title: `Alveus Sanctuary: ${item.title}`,
                          link: `${env.NEXT_PUBLIC_BASE_URL}/about#news`,
                        });

                      case "youtube":
                        return `https://www.youtube.com/watch?v=${encodeURIComponent(
                          item.video.id,
                        )}`;
                    }
                  })()}
                  external
                  onClick={(e) => {
                    e.preventDefault();
                    setNewsLightboxOpen(key);
                  }}
                  className="group/trigger w-full"
                  custom
                >
                  {item.video.type === "stream" && (
                    <StreamPreview src={item.video} alt={item.title} />
                  )}
                  {item.video.type === "youtube" && (
                    <YouTubePreview videoId={item.video.id} alt={item.title} />
                  )}
                </Link>
              ) : (
                <Link
                  href={item.href}
                  external
                  className="group/trigger flex aspect-video w-full items-center justify-center rounded-2xl bg-linear-to-br from-alveus-green-900/90 to-alveus-green-700/90 p-4 shadow-xl transition hover:scale-102 hover:shadow-2xl"
                  custom
                >
                  <Image
                    src={item.logo}
                    alt=""
                    width={480}
                    className="pointer-events-none h-12 w-auto object-contain drop-shadow-md transition group-hover/trigger:scale-102 group-hover/trigger:drop-shadow-xl"
                  />
                </Link>
              )}
            </div>
          ))}
        </div>

        <Lightbox
          open={newsLightboxOpen}
          onClose={() => setNewsLightboxOpen(undefined)}
          items={newsLightboxItems}
        />

        <p className="mt-8 text-center text-lg text-balance">
          We also collaborate with various organizations to amplify their
          efforts and share their important work with our audience, furthering
          our mission of conservation and education.
        </p>

        <p className="mt-2 text-center text-lg">
          <Link href="/about/orgs">
            Explore some of our NGO collaborations
            <IconArrowRight size={16} className="ml-1 inline-block" />
          </Link>
        </p>
      </Section>

      <Section dark>
        <div className="flex flex-wrap-reverse items-center">
          <div className="basis-full pt-8 md:basis-1/2 md:pt-0 md:pr-8">
            <MayaImage className="mx-auto h-auto w-full max-w-lg lg:mr-0" />
          </div>

          <div className="basis-full md:basis-1/2 md:px-4">
            <Heading id="maya" level={2} className="scroll-mt-32 italic" link>
              Maya Higa founded Alveus in February 2021
            </Heading>
            <p>
              She is one of the top female streamers on Twitch and has amassed a
              large following on YouTube and other social platforms. She has
              experience as a licensed falconer, wildlife rehabilitator,
              zookeeper, and conservation outreach educator.
            </p>

            <Button href="/about/staff" dark className="mt-8">
              Learn more about Maya and the team at Alveus
            </Button>
          </div>
        </div>
      </Section>

      <div className="relative">
        <Image
          src={leafLeftImage1}
          alt=""
          className="pointer-events-none absolute -top-32 left-0 z-10 hidden h-auto w-1/2 max-w-40 drop-shadow-md select-none lg:block 2xl:-bottom-48 2xl:max-w-48"
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
      <div className="relative flex grow flex-col">
        <Image
          src={leafLeftImage2}
          alt=""
          className="pointer-events-none absolute right-0 -bottom-24 z-10 hidden h-auto w-1/2 max-w-48 -scale-x-100 drop-shadow-md select-none lg:block"
        />

        <Transparency className="grow" />
      </div>
    </>
  );
};

export default AboutAlveusPage;
