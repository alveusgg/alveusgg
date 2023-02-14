import { type NextPage } from "next"
import Head from "next/head"
import React from "react"
import Section from "../../components/content/Section"
import Heading from "../../components/content/Heading"
import IconTwitch from "../../icons/IconTwitch"
import mayaImage from "../../assets/maya.png";
import leafRightImage1 from "../../assets/floral/leaf-right-1.png"
import leafRightImage2 from "../../assets/floral/leaf-right-2.png"
import leafLeftImage1 from "../../assets/floral/leaf-left-1.png"
import leafLeftImage2 from "../../assets/floral/leaf-left-2.png"
import Image from "next/image"

const stats = {
  averageTime: {
    source: "https://influencermarketinghub.com/twitch-statistics/",
    title: "Average User Time Spent on Twitch.tv",
    value: "95 Minutes",
    caption: "On average Twitch users spend 95 minutes per day on the platform.",
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

const views = {
  us: { name: 'United States', value: 27 },
  de: { name: 'Germany', value: 7 },
  kr: { name: 'South Korea', value: 6 },
  ru: { name: 'Russia', value: 6 },
  fr: { name: 'France', value: 4 },
  ca: { name: 'Canada', value: 4 },
  br: { name: 'Brazil', value: 4 },
  gb: { name: 'United Kingdom', value: 3 },
  tw: { name: 'Taiwan', value: 3 },
  se: { name: 'Sweden', value: 2 },
};

const AboutAlveusPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>About Alveus | Alveus.gg</title>
        <meta name="robots" content="noindex" />
      </Head>

      {/* Nav background */}
      <div className="hidden lg:block bg-alveus-green-900 h-40 -mt-40" />

      <div className="relative">
        <Image
          src={leafRightImage1}
          alt=""
          className="hidden lg:block absolute z-10 -bottom-24 right-0 w-1/2 h-auto max-w-md select-none pointer-events-none"
        />

        <Section dark className="py-24">
          <div className="w-full lg:w-3/5">
            <Heading level={1}>
              About Alveus Sanctuary
            </Heading>
            <p className="text-lg">
              Alveus is a non profit organization founded by Maya Higa that functions as an exotic animal sanctuary and as a
              virtual education center facility to provide permanent homes to non-releasable exotic animals.
            </p>
          </div>
        </Section>
      </div>

      <div className="relative">
        <Image
          src={leafLeftImage1}
          alt=""
          className="hidden lg:block absolute z-10 -bottom-24 left w-1/2 h-auto max-w-[12rem] select-none pointer-events-none"
        />

        <Section>
          <div className="flex flex-wrap-reverse items-center">
            <div className="basis-full md:basis-1/2 pt-8 md:pt-0 md:pr-8">
              <Image
                src={mayaImage}
                alt="Maya Higa, holding an owl in one photo, and a falcon in the second photo"
                className="w-full h-auto max-w-lg ml-auto"
              />
            </div>

            <div className="basis-full md:basis-1/2 md:px-4">
              <Heading level={2}>
                Watch the Launch Video
              </Heading>
              <p className="my-2 font-serif text-lg font-bold italic">
                The Start of it all!
              </p>
              <p className="my-4 text-lg">
                Find out more about Alveus and our aims here.
              </p>
              {/* TODO: Lightbox */}
              <a
                className="inline-block text-xl hover:bg-alveus-green hover:text-alveus-tan transition-colors px-6 py-4 rounded-full border-2 border-alveus-green"
                href="https://www.youtube.com/watch?v=jXTqWIc--jo"
                target="_blank"
                rel="noreferrer"
              >
                Watch the Video
              </a>
            </div>
          </div>
        </Section>
      </div>

      <Section dark className="text-center">
        <Heading level={2}>
          Why Twitch.tv
        </Heading>
        <p>
          Twitch offers our guests the opportunity to connect with viewers from around the globe.
          Here are some statistics that represent Twitch and it&apos;s users:
        </p>

        <ul className="mt-6 md:mt-12 mb-2 flex flex-wrap justify-center">
          {Object.entries(stats).map(([ key, stat ]) => (
            <li key={key} className="basis-full md:basis-1/3 py-4 md:px-4">
              <a
                className="h-full flex flex-col justify-center bg-alveus-green-900 px-6 py-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
                href={stat.source}
                target="_blank"
                rel="noreferrer"
              >
                <p className="text-xl text-center font-bold">{stat.title}</p>
                <p className="my-4 text-3xl text-center font-extrabold">{stat.value}</p>
                <p className="text-center">{stat.caption}</p>
              </a>
            </li>
          ))}
        </ul>

        <p>
          Click each box for source.
        </p>
      </Section>

      <div className="relative">
        <Image
          src={leafRightImage2}
          alt=""
          className="hidden lg:block absolute z-10 -top-24 right-0 w-1/2 h-auto max-w-[12rem] select-none pointer-events-none"
        />

        <Section>
          <Heading level={2} className="text-center">
            Views By Country
          </Heading>

          <ul className="mt-6 mb-3 flex flex-wrap justify-center">
            {Object.entries(views).map(([ key, country ]) => (
              <li key={key} className="basis-full md:basis-1/2 py-2 md:px-4">
                <p>{country.name}</p>
                <div className="w-full bg-alveus-green rounded-full overflow-clip">
                  <div
                    className="bg-alveus-green-900 text-xs text-alveus-tan text-right py-2 leading-none"
                    style={{ width: `${country.value}%` }}
                  >
                    <span className="px-3">
                      {country.value}
                      %
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <p className="text-center text-xs text-gray-500">
            (Source:
            {' '}
            <a
              className="text-red-600 hover:text-blue-600 transition-colors"
              href="https://www.similarweb.com/website/twitch.tv"
              target="_blank"
              rel="noreferrer"
            >
              SimilarWeb
            </a>
            )
          </p>
        </Section>
      </div>

      <div className="relative">
        <Image
          src={leafLeftImage2}
          alt=""
          className="hidden lg:block absolute z-10 -bottom-24 left w-1/2 h-auto max-w-[12rem] select-none pointer-events-none"
        />

        <Section dark className="py-24" containerClassName="flex flex-col items-center">
          <p className="my-2 font-serif text-7xl font-bold">1,000,000 Dollars Raised</p>
          <p className="my-2 font-serif text-4xl font-bold">Using Twitch!</p>
          <IconTwitch size={64} className="mt-6 hover:text-alveus-green-900 transition-colors" />
        </Section>
      </div>

      {/* Grow the last section to cover the page */}
      <Section className="text-center flex-grow">
        <Heading level={2}>
          Our Collaborations
        </Heading>
        <p>
          We work with other content creators to educate our combined audiences!
        </p>
        {/* TODO: YouTube embeds */}
      </Section>
    </>
  );
};

export default AboutAlveusPage;
