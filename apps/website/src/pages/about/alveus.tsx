import { type NextPage } from "next"
import Head from "next/head"
import React from "react"

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

const socials = {
  instagram: {
    link: "https://www.instagram.com/alveussanctuary",
    title: "Instagram"
  },
  tiktok: {
    link: "https://www.tiktok.com/@alveussanctuary",
    title: "TikTok",
  },
  twitter: {
    link: "https://twitter.com/AlveusSanctuary",
    title: "Twitter",
  },
  twitch: {
    link: "https://twitch.tv/alveussanctuary",
    title: "Twitch.tv",
  },
  youtube: {
    link: "https://www.youtube.com/c/AlveusSanctuary",
    title: "YouTube",
  },
};

const AboutAlveusPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>About Alveus | Alveus.gg</title>
      </Head>

      <section>
        <h1>About Alveus Sanctuary</h1>
        <p>
          Alveus is a non profit organization founded by Maya Higa that functions as an exotic animal sanctuary and as a
          virtual education center facility to provide permanent homes to non-releasable exotic animals.
        </p>
      </section>

      <section>
        <h2>Watch the Launch Video</h2>
        <p>The Start of it all!</p>
        <p>Find out more about Alveus and our aims here.</p>
        {/* TODO: Lightbox */}
        <a href="https://www.youtube.com/watch?v=jXTqWIc--jo" target="_blank" rel="noreferrer">Watch the Video</a>
      </section>

      <section>
        <h2>Why Twitch.tv</h2>
        <p>
          Twitch offers our guests the opportunity to connect with viewers from around the globe.
          Here are some statistics that represent Twitch and it&apos;s users:
        </p>

        <ul>
          {Object.entries(stats).map(([ key, stat ]) => (
            <li key={key}>
              <a href={stat.source} target="_blank" rel="noreferrer">
                <span>{stat.title}</span>
                <span>{stat.value}</span>
                <span>{stat.caption}</span>
              </a>
            </li>
          ))}
        </ul>

        <p>Click each box for source.</p>
      </section>

      <section>
        <h2>Views By Country</h2>

        <ul>
          {Object.entries(views).map(([ key, country ]) => (
            <li key={key}>
              <p>{country.name}</p>
              <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700">
                <div
                  className="bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full"
                  style={{ width: `${country.value}%` }}
                >
                  {country.value}
                  %
                </div>
              </div>
            </li>
          ))}
        </ul>

        <p>
          (Source:
          {' '}
          <a href="https://www.similarweb.com/website/twitch.tv" target="_blank" rel="noreferrer">
            SimilarWeb
          </a>
          )
        </p>
      </section>

      <section>
        <p>1,000,000 Dollars Raised</p>
        <p>Using Twitch!</p>
      </section>

      <section>
        <h2>Our Collaborations</h2>
        <p>We work with other content creators to educate our combined audiences!</p>
        {/* TODO: YouTube embeds */}
      </section>

      <section>
        <h2>Stay Updated!</h2>
        <p>follow @alveussanctuary on all social platforms to keep up to date!</p>

        <ul>
          {Object.entries(socials).map(([ key, social ]) => (
            <li key={key}>
              <a href={social.link} target="_blank" rel="noreferrer">
                <span>{social.title}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
};

export default AboutAlveusPage;
