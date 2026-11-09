import { type NextPage } from "next";
import Image, { type StaticImageData } from "next/image";
import { type ComponentType, type ReactNode, useState } from "react";

import { env } from "@/env";

import { classes } from "@/utils/classes";
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
import Timeline, { TimelineItem } from "@/components/content/Timeline";
import {
  YouTubeEmbed,
  YouTubeLightbox,
  YouTubePreview,
} from "@/components/content/YouTube";

import { type IconProps } from "@/icons/BaseIcon";
import IconArrowRight from "@/icons/IconArrowRight";
import IconBolt from "@/icons/IconBolt";
import IconBox from "@/icons/IconBox";
import IconChevronDown from "@/icons/IconChevronDown";
import IconDocument from "@/icons/IconDocument";
import IconDollar from "@/icons/IconDollar";
import IconExternal from "@/icons/IconExternal";
import IconQuote from "@/icons/IconQuote";
import IconUserGroup from "@/icons/IconUserGroup";

import imageCharityNavigatorBadge from "@/assets/charity-navigator-badge.svg";
import leafLeftImage2 from "@/assets/floral/leaf-left-2.png";
import leafLeftImage3 from "@/assets/floral/leaf-left-3.png";
import amazonAds from "@/assets/in-the-news/amazon-ads.svg";
import cnn from "@/assets/in-the-news/cnn.svg";
import forbes from "@/assets/in-the-news/forbes.svg";
import npr from "@/assets/in-the-news/npr.svg";
import optimistDaily from "@/assets/in-the-news/optimist-daily.svg";
import radioNewZealand from "@/assets/in-the-news/radio-new-zealand.svg";
import yahooEntertainment from "@/assets/in-the-news/yahoo-entertainment.svg";
import youtube from "@/assets/in-the-news/youtube.svg";

const sectionLinks = [
  { name: "Twitch.tv", href: "#twitch" },
  { name: "In The News", href: "#news" },
  { name: "Founding", href: "#maya" },
  { name: "History", href: "#history" },
  { name: "Tour", href: "#tour-2026" },
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
  cnn: {
    title: "CNN",
    href: "https://edition.cnn.com/world/trail-cam-livestreams-inspiring-new-generation-conservationists-c2e-spc",
    quote:
      "How trail cams and livestreams are inspiring a new generation of conservationists",
    logo: cnn,
  },
  youtube: {
    title: "YouTube Official Blog",
    href: "https://blog.youtube/creator-and-artist-stories/maya-higa-alveus-animal-sanctuary/",
    quote:
      "How 27-year-old Maya Higa is bypassing traditional zoos to build the first virtual-only animal sanctuary.",
    logo: youtube,
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
  rnz: {
    title: "Radio New Zealand",
    href: "https://www.rnz.co.nz/life/people/gen-z-s-jane-goodall-has-an-online-only-wildlife-sanctuary-in-texas",
    quote:
      "'Gen Z's Jane Goodall' has an online-only wildlife sanctuary in Texas",
    logo: radioNewZealand,
  },
  npr: {
    title: "NPR",
    href: "https://www.npr.org/2026/10/30/nx-s1-5954066/the-future-of-conservation-is-live-streamed",
    quote: "The future of conservation is live-streamed",
    logo: npr,
  },
  amazon: {
    title: "Amazon Ads",
    href: "https://advertising.amazon.com/library/expert-advice/maya-higa-wildlife-streamer",
    quote:
      "For Higa, success on Twitch isn't just about building a following—it's about creating meaningful change, one viewer at a time.",
    logo: amazonAds,
  },
  yahoo: {
    title: "Yahoo! Entertainment",
    href: "https://www.yahoo.com/entertainment/articles/winnie-cow-going-viral-twitch-220000265.html",
    quote:
      "Twitch isn't just for gamers anymore, as evidenced by a cow named Winnie who has become a viral sensation on the livestreaming platform",
    logo: yahooEntertainment,
  },
  optimistDaily: {
    title: "The Optimist Daily",
    href: "https://www.optimistdaily.com/2026/11/maya-higa-built-a-wildlife-sanctuary-on-twitch-funded-by-the-people-who-watch-it/",
    quote:
      "A teaching platform built around the creator-viewer relationship works differently from a broadcast. Viewers are compelled to come back.",
    logo: optimistDaily,
  },
  powderBlue: {
    title: "Powder Blue",
    href: "https://offlineonline.substack.com/p/introducing-our-next-cover-star",
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

type HistoryType = "build" | "fundraiser" | "team" | "milestone";

const historyTypes: Record<
  HistoryType,
  { label: string; icon: ComponentType<IconProps> }
> = {
  build: { label: "Build", icon: IconBox },
  fundraiser: { label: "Fundraiser", icon: IconDollar },
  team: { label: "Team", icon: IconUserGroup },
  milestone: { label: "Milestone", icon: IconBolt },
};

type HistoryCTA = { key: string; cta: ReactNode };
type HistoryItem = {
  key: string;
  date: PartialDateString;
  type?: Exclude<HistoryType, "milestone">;
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
        type: "build",
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
        type: "fundraiser",
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
        type: "build",
        content: [
          "Fencing and pasture installed",
          "A total of 4,000 linear feet of predator-proof fencing was installed around the property, and a barn was built at the top of the pasture.",
        ],
      },
      {
        key: "parrot-aviary",
        date: "2021-06", // https://youtu.be/rSaWp3pEvFE?t=5729
        type: "build",
        content: [
          "Parrot Aviary constructed",
          "A 20ft by 20ft wire-mesh enclosure with a solid floor and planters, plus an addon with enclosed rooms for the parrots to shelter in and storage for supplies.",
          "Sponsored by Michele Raffin (previous owner of the parrots), and flimflam.",
        ],
      },
      {
        key: "crow-aviary",
        date: "2021-07", // https://youtu.be/BgtVRjQC0Vk?t=917
        type: "build",
        content: [
          "Crow Aviary constructed",
          "A 15ft by 18ft wire-mesh enclosure, with a solid rear wall.",
          "Sponsored by PointCrow.",
        ],
      },
      {
        key: "chicken-coop",
        date: "2021-08", // https://youtu.be/W05oJEwNI_s?t=810
        type: "build",
        content: [
          "Chicken Coop constructed",
          "A 10ft by 20ft wire-mesh enclosure with a bark/dirt floor, and a 6ft by 6ft indoor area for shelter at night.",
        ],
      },
    ],
  },
  {
    key: "tour-2021",
    cta: (
      <div className="flex flex-wrap items-center gap-y-16">
        <div className="basis-full md:basis-1/2 md:px-4">
          <Heading id="tour-2021" level={3} className="scroll-mt-52 italic">
            Alveus Tour: 2021
          </Heading>

          <p className="mt-4 text-lg">
            Watch the video to join Maya for a tour of Alveus as it was in late
            2021, exploring the parrot aviary, the chicken coop, and the
            pasture. Meet some of our ambassadors and learn about their stories.
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
        type: "build",
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
        type: "team",
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
        type: "fundraiser",
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
        type: "build",
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
        type: "fundraiser",
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
        type: "build",
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
    key: "tour-2022",
    cta: (
      <div className="flex flex-wrap-reverse items-center gap-y-16">
        <div className="basis-full md:basis-1/2 md:px-4">
          <YouTubeLightbox videoId="_PRVsl9Nxok" />
        </div>

        <div className="basis-full md:basis-1/2 md:px-4">
          <Heading id="tour-2022" level={3} className="scroll-mt-52 italic">
            Alveus Tour: 2022
          </Heading>

          <p className="mt-4 text-lg">
            Join Maya for a tour around more of Alveus as it was in late 2022,
            exploring the training center, the studio, the reptile room and
            critter cave, the nutrition house, the crow aviary and the new fox
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
        type: "fundraiser",
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
        type: "fundraiser",
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
        type: "build",
        content: [
          "Marmoset enclosure retro-fitted",
          "The original crow aviary was retro-fitted, with a new 8ft by 18ft indoor area added to the rear to provide air-conditioned shelter for the marmosets and space to store supplies.",
        ],
      },
      {
        key: "lindsay",
        date: "2023-07",
        type: "team",
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
        type: "fundraiser",
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
        type: "fundraiser",
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
        type: "fundraiser",
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
        type: "team",
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
        type: "build",
        content: [
          "Wolf enclosure constructed",
          "Located behind the crow and fox enclosures, the wolf enclosure is a massive open-air 200ft by 65ft enclosure, including a river/pond, with a 30ft by 30ft air-conditioned indoor area on the side.",
        ],
      },
      {
        key: "art-auction-2024",
        date: "2024-05",
        type: "fundraiser",
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
        type: "fundraiser",
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
        type: "team",
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
        type: "fundraiser",
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
        type: "team",
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
        type: "build",
        content: [
          "New studio launch",
          "Alveus unveils a completely refurbished studio space, featuring live plant walls, an interactive whiteboard, a new fish tank and improved equipment for live streams.",
        ],
      },
      {
        key: "art-auction-2025",
        date: "2025-04",
        type: "fundraiser",
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
        type: "team",
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
        type: "team",
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
        key: "rocky",
        date: "2025-08",
        type: "team",
        content: [
          "Rocky joins the Alveus team",
          "Rocky joins the team as a Facilities Specialist.",
        ],
        link: {
          text: "Meet our staff",
          href: "/about/staff",
        },
      },
      {
        key: "summer-camp-2025",
        date: "2025-08",
        type: "fundraiser",
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
      {
        key: "linden",
        date: "2025-12",
        type: "team",
        content: [
          "Linden joins the Alveus team",
          "Linden joins the team as a Horticulturist.",
        ],
        link: {
          text: "Meet our staff",
          href: "/about/staff",
        },
      },
      {
        key: "jacob",
        date: "2026-01",
        type: "team",
        content: [
          "Jacob joins the Alveus team",
          "Jacob joins the team as Alveus' Development and Administration Coordinator.",
        ],
        link: {
          text: "Meet our staff",
          href: "/about/staff",
        },
      },
      {
        key: "miranda",
        date: "2026-03",
        type: "team",
        content: [
          "Miranda joins the Alveus team",
          "Alveus continues to grow, with Miranda joining the team as an Animal Care Coordinator.",
        ],
        link: {
          text: "Meet our staff",
          href: "/about/staff",
        },
      },
      {
        key: "art-auction-2026",
        date: "2026-04",
        type: "fundraiser",
        content: [
          "Art Auction fundraiser",
          "The most successful art auction yet sold 54 pieces of art from the ambassadors, staff and a guest artist, as well as over 800 signed postcards, raising over $117,000 USD.",
        ],
        link: {
          text: "Explore Alveus events",
          href: "/events#art-auction-2026",
        },
      },
      {
        key: "chris",
        date: "2026-06",
        type: "team",
        content: [
          "Chris joins the Alveus team",
          "Chris joins the FAID department as a Facilities Specialist.",
        ],
        link: {
          text: "Meet our staff",
          href: "/about/staff",
        },
      },
    ],
  },
  {
    key: "tour-2026",
    cta: (
      <div className="flex flex-wrap-reverse items-center gap-y-16">
        <div className="basis-full md:basis-1/2 md:px-4">
          <YouTubeLightbox videoId="tDFy0e-8FwA" />
        </div>

        <div className="basis-full md:basis-1/2 md:px-4">
          <Heading id="tour-2026" level={3} className="scroll-mt-52 italic">
            Alveus Tour: 2026
          </Heading>

          <p className="mt-4 text-lg">
            Watch the video to join Maya for a tour around all of Alveus as it
            was in 2026, getting a behind-the-scenes look at the sanctuary, and
            meeting many of the ambassadors around the property in their
            enclosures.
          </p>
        </div>
      </div>
    ),
  },
];

const historyYears = history.reduce<[string, (HistoryItem | HistoryCTA)[]][]>(
  (acc, section) => {
    for (const entry of "items" in section ? section.items : [section]) {
      const last = acc.at(-1);
      const year = "date" in entry ? entry.date.slice(0, 4) : last?.[0];
      if (last && last[0] === year) last[1].push(entry);
      else if (year) acc.push([year, [entry]]);
    }
    return acc;
  },
  [],
);

const HistoryItemContent = ({ item }: { item: HistoryItem }) => {
  const type = item.type ?? "milestone";
  const dark = type === "milestone";
  const amount =
    type === "fundraiser" &&
    item.content
      .slice(1)
      .join(" ")
      .match(/(over\s+)?\$[\d,]+/i)?.[0]
      .replace(/^over/i, "Over");

  return (
    <>
      <p
        className={classes(
          "text-sm font-semibold tracking-wide uppercase",
          dark ? "text-alveus-green-200" : "text-alveus-green-600",
        )}
      >
        {formatPartialDateString(item.date)} &middot; {historyTypes[type].label}
      </p>
      <Heading
        level={4}
        className={classes("mt-1 mb-0", dark ? "text-2xl" : "text-xl")}
      >
        {item.content[0]}
      </Heading>
      {amount && (
        <p className="mt-1 font-serif text-3xl font-bold text-red-700 tabular-nums">
          {amount}
        </p>
      )}
      {item.content.slice(1).map((paragraph, idx) => (
        // eslint-disable-next-line @eslint-react/no-array-index-key -- These paragraphs are static content in the timeline entry.
        <p key={idx} className="mt-2">
          {paragraph}
        </p>
      ))}
      {item.link && (
        <p className="mt-2">
          <Link
            external={!item.link.href.startsWith("/")}
            href={item.link.href}
            dark={dark}
            className="inline-flex items-center gap-1"
          >
            {item.link.text}
            {item.link.href.startsWith("/") && (
              <IconArrowRight className="size-4" />
            )}
          </Link>
        </p>
      )}
    </>
  );
};

const AboutAlveusPage: NextPage = () => {
  const [newsLightboxOpen, setNewsLightboxOpen] = useState<string>();
  const [openYears, setOpenYears] = useState<Record<string, boolean>>(() => ({
    2020: true,
    2021: true,
    [historyYears.at(-1)?.[0] ?? ""]: true,
  }));
  const [visibleTypes, setVisibleTypes] = useState<
    Record<HistoryType, boolean>
  >({ build: true, fundraiser: true, team: true, milestone: true });

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
        className="max-xl:py-8"
        containerClassName="grid grid-cols-1 xl:grid-cols-2 gap-x-8 gap-y-16 items-center"
      >
        <div className="flex flex-col gap-4">
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

        <div className="flex flex-col gap-4 xl:order-last xl:col-span-full">
          <div className="mx-auto h-1 w-full max-w-sm rounded-md bg-alveus-green-50/50" />
          <p className="text-center font-serif text-xl text-alveus-green-50 italic">
            Alveus Sanctuary&apos;s mission is to use the internet to cultivate
            our next generation of conservationists and to secure a flourishing
            future for all living things.
          </p>
          <div className="mx-auto h-1 w-full max-w-sm rounded-md bg-alveus-green-50/50" />
        </div>

        <div>
          <div className="mx-auto max-w-2xl">
            <YouTubeLightbox videoId="-YwzCOVeLEE" />

            <Heading level={2} className="text-center">
              The Wildlife Sanctuary You Can Visit from Anywhere | TED
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
              <li key={source.link} className="mb-1">
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

      <Section>
        <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Heading id="history" level={2} className="my-0" link>
            Alveus&apos; History
          </Heading>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div
              role="group"
              aria-label="Filter by type"
              className="flex flex-wrap items-center gap-2"
            >
              {(
                Object.entries(historyTypes) as [
                  HistoryType,
                  (typeof historyTypes)[HistoryType],
                ][]
              ).map(([key, { label, icon: Icon }]) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={visibleTypes[key]}
                  onClick={() =>
                    setVisibleTypes((prev) => ({
                      ...prev,
                      [key]: !prev[key],
                    }))
                  }
                  className={classes(
                    "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-alveus-green-700 motion-reduce:transition-none",
                    visibleTypes[key]
                      ? "border-alveus-green bg-alveus-green text-alveus-tan"
                      : "border-alveus-green-300 bg-transparent text-alveus-green-700 line-through",
                  )}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setOpenYears({})}
              className="text-red-600 underline transition-colors hover:text-blue-600"
            >
              Collapse all
            </button>
          </div>
        </div>

        <Timeline>
          {historyYears.map(([year, entries]) => {
            const items = entries.filter(
              (entry): entry is HistoryItem =>
                "date" in entry && visibleTypes[entry.type ?? "milestone"],
            );
            const open = !!openYears[year];

            return (
              <section key={year} className="relative mb-6">
                <Heading
                  level={3}
                  id={`history-${year}`}
                  className="relative z-10 my-0 scroll-mt-4 pl-14 md:pl-0 md:text-center"
                >
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={`history-${year}-panel`}
                    onClick={() =>
                      setOpenYears((prev) => ({
                        ...prev,
                        [year]: !prev[year],
                      }))
                    }
                    className="inline-flex items-center gap-3 rounded-xl bg-alveus-tan px-4 py-2 focus-visible:outline-2 focus-visible:outline-alveus-green-700"
                  >
                    <span className="text-5xl text-alveus-green-800 tabular-nums">
                      {year}
                    </span>
                    <span className="font-sans text-base font-normal text-alveus-green-700">
                      {items.length} {items.length === 1 ? "event" : "events"}
                    </span>
                    <IconChevronDown
                      className={classes(
                        "size-5 text-alveus-green-700 transition-transform motion-reduce:transition-none",
                        open && "rotate-180",
                      )}
                    />
                  </button>
                </Heading>

                <div
                  id={`history-${year}-panel`}
                  hidden={!open}
                  className="pt-4"
                >
                  <ol className="flex flex-col gap-6">
                    {entries.map((entry) =>
                      "cta" in entry ? (
                        <li
                          key={entry.key}
                          className="relative z-10 overflow-clip rounded-xl bg-alveus-green px-4 py-10 text-alveus-tan md:px-8"
                        >
                          {entry.cta}
                        </li>
                      ) : (
                        items.includes(entry) && (
                          <TimelineItem
                            key={entry.key}
                            icon={historyTypes[entry.type ?? "milestone"].icon}
                            dark={!entry.type}
                            right={items.indexOf(entry) % 2 === 1}
                          >
                            <HistoryItemContent item={entry} />
                          </TimelineItem>
                        )
                      ),
                    )}
                  </ol>
                  {items.length === 0 && (
                    <p className="mt-6 pl-14 text-alveus-green-700 md:pl-0 md:text-center">
                      No events match the current filter.
                    </p>
                  )}
                </div>
              </section>
            );
          })}
        </Timeline>
      </Section>

      {/* TODO: CTA slice for ambassadors? */}

      {/* Grow the last section to cover the page */}
      <div className="relative flex grow flex-col">
        <Image
          src={leafLeftImage2}
          alt=""
          className="pointer-events-none absolute right-0 -bottom-24 z-10 hidden h-auto w-1/2 max-w-48 -scale-x-100 drop-shadow-md select-none lg:block"
        />

        <Section
          dark
          className="grow bg-alveus-green-900"
          containerClassName="space-y-4"
        >
          <div className="flex flex-col gap-4 md:flex-row-reverse md:items-center md:gap-10">
            <div>
              <Heading id="transparency" level={2} link>
                Platinum rated transparency
              </Heading>

              <p>
                Alveus&apos; transparency has been rated platinum on Candid
                (GuideStar). Candid is a leading source of information on
                non-profit organizations, helping donors and funders make
                informed decisions about their support. Check out our{" "}
                <Link
                  href="https://www.guidestar.org/profile/shared/520ab07a-b688-42a0-b9ec-417861b54b13"
                  external
                  dark
                >
                  non-profit profile on Candid
                </Link>
                .
              </p>
            </div>

            <Link
              className="shrink-0"
              external
              custom
              href="https://www.guidestar.org/profile/shared/520ab07a-b688-42a0-b9ec-417861b54b13"
            >
              <Image
                className="size-40"
                src="https://widgets.guidestar.org/prod/v1/pdp/transparency-seal/10965548/svg"
                width={200}
                height={200}
                alt="Platinum Transparency Seal by Candid"
              />
            </Link>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-10">
            <div>
              <Heading level={2}>Three-star charity rating</Heading>

              <p>
                Alveus has also attained a three-star rating from Charity
                Navigator, a powerful trust indicator recognizing our commitment
                to accountability and transparency. Charity Navigator is
                America&apos;s largest and most-utilized independent charity
                evaluator, an unbiased and trusted source of information for
                more than 11 million donors annually. Explore our{" "}
                <Link
                  href="https://www.charitynavigator.org/ein/861772907"
                  external
                  dark
                >
                  Charity Navigator profile
                </Link>
                .
              </p>
            </div>

            <Link
              className="shrink-0"
              external
              custom
              href="https://www.charitynavigator.org/ein/861772907"
            >
              <Image
                className="size-40"
                src={imageCharityNavigatorBadge}
                width={200}
                height={200}
                alt="Three-Star Charity Rating Badge by Charity Navigator"
              />
            </Link>
          </div>

          <div className="text-center">
            <Heading level={2}>Annual reports</Heading>
            <p className="mx-auto mt-4 max-w-3xl text-balance">
              Each year we publish a report that covers key stats on the growth
              and current status of Alveus, the impact we&apos;ve made toward
              our continued mission, and an in-depth breakdown of the financials
              behind the sanctuary.
            </p>
            <Button
              href="/about/annual-reports"
              dark
              className="mt-8 inline-flex items-center gap-2 px-6"
            >
              <IconDocument className="size-5" />
              Browse reports
            </Button>
          </div>
        </Section>
      </div>
    </>
  );
};

export default AboutAlveusPage;
