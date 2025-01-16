import { type NextPage } from "next";
import Image from "next/image";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Timeline from "@/components/content/Timeline";
import Maya from "@/components/content/Maya";
import IconTwitch from "@/icons/IconTwitch";

import leafRightImage1 from "@/assets/floral/leaf-right-1.png";
import leafRightImage2 from "@/assets/floral/leaf-right-2.png";
import leafLeftImage1 from "@/assets/floral/leaf-left-1.png";
import leafLeftImage3 from "@/assets/floral/leaf-left-3.png";

const experience = [
  {
    key: "horsemanship-certification",
    date: "August, 2015",
    content: <p>Level 3 certification in Parelli Natural Horsemanship</p>,
  },
  {
    key: "all-star-ambassador",
    date: "June, 2016",
    content: <p>County 4-H All Star Ambassador</p>,
  },
  {
    key: "zoo-to-you",
    date: "June, 2018",
    content: (
      <p>
        Outreach Education and Exotic Animal Husbandry intern at Zoo to You
        Conservation Ambassadors
      </p>
    ),
  },
  {
    key: "charles-paddock-zoo",
    date: "January, 2019",
    content: (
      <p>
        Outreach Education and Exotic Animal Husbandry intern at Charles Paddock
        Zoo
      </p>
    ),
  },
  {
    key: "falconry-license",
    date: "February, 2019",
    content: (
      <p>Falconry license issued by the Department of Fish and Wildlife</p>
    ),
  },
  {
    key: "free-flight-exotic-bird-sanctuary",
    date: "June, 2019",
    content: (
      <p>Education and Husbandry intern at Free Flight Exotic Bird Sanctuary</p>
    ),
  },
  {
    key: "cal-poly-graduation",
    date: "June, 2020",
    content: (
      <p>
        Graduated from California Polytechnic University at San Luis Obispo
        (earning Bachelor of Science in Agricultural Education and
        Communication)
      </p>
    ),
  },
  {
    key: "central-texas-wildlife",
    date: "October, 2020 – October, 2021",
    content: (
      <p>
        Board of Directors for a wildlife rehabilitation center in Central Texas
        (role focused on raptor rehabilitation and husbandry)
      </p>
    ),
  },
  {
    key: "found-alveus-sanctuary",
    date: "February, 2021",
    content: <p>Founded Alveus Sanctuary</p>,
  },
  {
    key: "make-a-wish",
    date: "March, 2021 – March, 2022",
    content: (
      <p>
        Governing board of Make a Wish Foundation in Central and South Texas
      </p>
    ),
  },
  {
    key: "whale-dolphin-conservation",
    date: "January, 2023 – Present",
    content: <p>Whale and Dolphin Conservation (WDC) Ambassador</p>,
  },
];

const AboutMayaPage: NextPage = () => {
  return (
    <>
      <Meta
        title="About Maya"
        description="Maya Higa is one of the top female streamers on Twitch and a rising star on YouTube. Maya founded Alveus Sanctuary, a non-profit wildlife sanctuary and virtual education center in central Texas, and raised more than $500,000 during her first fundraising stream thanks to her amazing community and fellow streamers."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <div className="relative">
        <Image
          src={leafRightImage1}
          alt=""
          className="pointer-events-none absolute -top-8 right-0 z-10 hidden h-auto w-1/2 max-w-md select-none drop-shadow-md lg:block xl:max-w-lg"
        />

        <Section dark className="py-24">
          <div className="w-full lg:w-3/5">
            <Heading level={1}>About Maya Higa</Heading>
            <p className="text-lg">
              Maya Higa is one of the top female streamers on Twitch and has
              amassed over 1 million subscribers on YouTube. She integrates her
              passion for wildlife conservation and education into her content
              regularly, creating some of the most unique content on Twitch.
              Maya has experience as a licensed falconer, wildlife
              rehabilitator, zookeeper, and conservation outreach educator. Her
              livestreams and videos feature conservation education and charity
              fundraising. She created a conservation podcast in 2019 which
              aired more than 60 episodes and raised more than $92,000 for
              conservation organizations around the globe. In 2021, Maya founded
              Alveus Sanctuary, a non-profit wildlife sanctuary and virtual
              education center in central Texas.
            </p>
          </div>
        </Section>
      </div>

      <div className="relative">
        <Image
          src={leafLeftImage1}
          alt=""
          className="pointer-events-none absolute -bottom-32 left-0 z-10 hidden h-auto w-1/2 max-w-40 select-none drop-shadow-md lg:block 2xl:-bottom-48 2xl:max-w-48"
        />

        <Section>
          <div className="flex flex-wrap-reverse items-center">
            <div className="basis-full pt-8 lg:basis-1/2 lg:pr-8 lg:pt-0">
              <Maya className="mx-auto h-auto w-full max-w-lg lg:mr-0" />
            </div>

            <div className="basis-full lg:basis-1/2 lg:px-4">
              <p className="my-2 text-center font-serif text-4xl font-bold text-alveus-green">
                <span>&ldquo;</span>I love the natural world with my whole heart
                and entire being. All I want is to inspire that same love in
                others.
                <span>&rdquo;</span>
              </p>
            </div>
          </div>
        </Section>
      </div>

      <div className="relative">
        <Image
          src={leafRightImage2}
          alt=""
          className="pointer-events-none absolute -bottom-24 right-0 z-10 hidden h-auto w-1/2 max-w-48 select-none drop-shadow-md lg:block"
        />

        <Section
          dark
          className="py-24"
          containerClassName="flex flex-col items-center"
        >
          <p className="my-2 text-center font-serif text-7xl font-bold">
            Maya raised over $2,500,000
          </p>
          <p className="my-2 font-serif text-4xl font-bold">Using Twitch!</p>
          <IconTwitch
            size={64}
            className="mt-6 transition-colors hover:text-alveus-green-900"
          />
        </Section>
      </div>

      {/* Grow the last section to cover the page */}
      <div className="relative flex grow flex-col">
        <Image
          src={leafLeftImage3}
          alt=""
          className="pointer-events-none absolute -bottom-20 left-0 z-10 hidden h-auto w-1/2 max-w-48 select-none drop-shadow-md lg:block"
        />

        <Section className="grow">
          <Heading
            level={2}
            className="mb-16 text-center text-5xl text-alveus-green"
          >
            Maya&apos;s Experience
          </Heading>

          <Timeline items={experience} />
        </Section>
      </div>
    </>
  );
};

export default AboutMayaPage;
