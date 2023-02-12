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
import IconCalendar from "../../icons/IconCalendar"
import Image from "next/image"

const experience = [
  {
    date: 'August, 2015',
    text: 'Level 3 certification in Parelli Natural Horsemanship',
  },
  {
    date: 'June, 2016',
    text: 'County 4-H All Star Ambassador',
  },
  {
    date: 'June, 2018',
    text: 'Outreach Education and Exotic Animal Husbandry intern at Zoo to You Conservation Ambassadors',
  },
  {
    date: 'January, 2019',
    text: 'Outreach Education and Exotic Animal Husbandry intern at Charles Paddock Zoo',
  },
  {
    date: 'February, 2019',
    text: 'Falconry license issued by the Department of Fish and Wildlife',
  },
  {
    date: 'June, 2019',
    text: 'Education and Husbandry intern at Free Flight Exotic Bird Sanctuary',
  },
  {
    date: 'June, 2020',
    text: 'Graduated from California Polytechnic University at San Luis Obispo (earning Bachelor of Science in Agricultural Education and Communication)',
  },
  {
    date: 'October, 2020 – Present',
    text: 'Board of Directors for a wildlife rehabilitation center in Central Texas (role focused on raptor rehabilitation and husbandry)',
  },
  {
    date: 'February, 2021',
    text: 'Founded Alveus Sanctuary',
  },
  {
    date: 'March, 2021 – Present',
    text: 'Governing board of Make a Wish Foundation in Central and South Texas',
  },
];

const AboutMayaPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>About Maya | Alveus.gg</title>
        <meta name="robots" content="noindex" />
      </Head>

      {/* Nav background */}
      <div className="hidden lg:block bg-alveus-green-900 h-40 -mt-40" />

      <div className="relative">
        <Image
          src={leafRightImage1}
          alt=""
          className="hidden lg:block absolute z-10 -bottom-8 right-0 w-1/2 h-auto max-w-md select-none pointer-events-none"
        />

        <Section dark className="py-24">
          <div className="w-full lg:w-3/5">
            <Heading level={1}>
              About Maya Higa
            </Heading>
            <p className="text-lg">
              Maya Higa is one of the top female streamers on Twitch and a rising star on YouTube.

              Her passions include wildlife conservation and education and she integrates these into her content
              regularly, creating some of the most unique content on Twitch. Maya is a licensed falconer and wildlife
              conservationist.

              Her livestreams feature falconry, wildlife rehab, conservation education, and charity fundraising.

              She created a conservation podcast in 2019 which has since aired more than 60 episodes on her channel and
              raised more than $92,000 for wildlife protection organizations around the globe.

              Maya founded Alveus Sanctuary, a non-profit exotic animal sanctuary and virtual education center in
              central Texas and raised more than $500,000 during her first fundraising stream thanks to her amazing
              community and fellow streamers.
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
                className="w-full h-auto max-w-lg mx-auto"
              />
            </div>

            <div className="basis-full md:basis-1/2">
              <p className="my-2 font-serif text-4xl text-alveus-green text-center font-bold">
                <span>&ldquo;</span>
                I love the natural world with my whole heart and entire being.
                All I want is to inspire that same love in others.
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
          className="hidden lg:block absolute z-10 -top-24 right-0 w-1/2 h-auto max-w-[12rem] select-none pointer-events-none"
        />

        <Section dark className="py-24" containerClassName="flex flex-col items-center">
          <p className="my-2 font-serif text-7xl font-bold">Maya raised over $1,000,000</p>
          <p className="my-2 font-serif text-4xl font-bold">Using Twitch!</p>
          <IconTwitch size={64} className="mt-6 hover:text-alveus-green-900 transition-colors" />
        </Section>
      </div>

      {/* Grow the last section to cover the page */}
      <Section className="flex-grow">
        <Heading level={2} className="text-5xl text-alveus-green text-center">
          Maya&apos;s Experience
        </Heading>

        <div className="relative z-0 max-w-6xl mx-auto mt-16">
          <div className="absolute -z-10 left-5 md:left-1/2 -translate-x-1/2 w-1 h-full bg-alveus-green" />
          <ol>
            {experience.map((item, idx) => (
              <li key={item.date} className="flex items-start my-4 relative">
                <div className={`absolute inline-block left-5 ${idx % 2 ? 'md:left-1/2' : 'md:left-auto md:right-1/2'}`}>
                  <div className={`
                  hidden
                  md:block
                  border-solid border-y-transparent border-y-[1rem] mt-1
                  ${idx % 2
                    ? 'border-r-alveus-green border-r-[1rem] border-l-0 ml-6'
                    : 'border-l-alveus-green border-l-[1rem] border-r-0 mr-6'}`} />
                  <div className={`
                  md:hidden
                  border-solid border-y-transparent border-y-[1rem] mt-1
                  border-r-alveus-green border-r-[1rem] border-l-0 ml-6`} />
                </div>
                <div className="bg-alveus-green text-alveus-tan p-3 rounded-full">
                  <IconCalendar size={16} />
                </div>
                <div className={`basis-1/2 px-4 pt-2 hidden md:block ${idx % 2 ? 'md:order-first' : 'md:order-last'}`}>
                  <p className={`text-md text-alveus-green-500 ${idx % 2 ? 'text-right' : 'text-left'}`}>
                    {item.date}
                  </p>
                </div>
                <div className={`basis-full md:basis-1/2 px-4 ${idx % 2 ? 'md:order-last' : 'md:order-first'}`}>
                  <div className="text-md p-6 bg-alveus-green text-alveus-tan rounded-lg">
                    <p className="mb-4 md:hidden">
                      {item.date}
                    </p>
                    <p>
                      {item.text}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Section>
    </>
  );
};

export default AboutMayaPage;
