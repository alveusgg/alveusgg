import { type NextPage } from "next";
import Image from "next/image";
import React from "react";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import IconTwitch from "@/icons/IconTwitch";
import IconCalendar from "@/icons/IconCalendar";

import mayaImage from "@/assets/maya.png";
import leafRightImage1 from "@/assets/floral/leaf-right-1.png";
import leafRightImage2 from "@/assets/floral/leaf-right-2.png";
import leafLeftImage1 from "@/assets/floral/leaf-left-1.png";
import leafLeftImage3 from "@/assets/floral/leaf-left-3.png";

const experience = [
  {
    date: "August, 2015",
    text: "Level 3 certification in Parelli Natural Horsemanship",
  },
  {
    date: "June, 2016",
    text: "County 4-H All Star Ambassador",
  },
  {
    date: "June, 2018",
    text: "Outreach Education and Exotic Animal Husbandry intern at Zoo to You Conservation Ambassadors",
  },
  {
    date: "January, 2019",
    text: "Outreach Education and Exotic Animal Husbandry intern at Charles Paddock Zoo",
  },
  {
    date: "February, 2019",
    text: "Falconry license issued by the Department of Fish and Wildlife",
  },
  {
    date: "June, 2019",
    text: "Education and Husbandry intern at Free Flight Exotic Bird Sanctuary",
  },
  {
    date: "June, 2020",
    text: "Graduated from California Polytechnic University at San Luis Obispo (earning Bachelor of Science in Agricultural Education and Communication)",
  },
  {
    date: "October, 2020 – October, 2021",
    text: "Board of Directors for a wildlife rehabilitation center in Central Texas (role focused on raptor rehabilitation and husbandry)",
  },
  {
    date: "February, 2021",
    text: "Founded Alveus Sanctuary",
  },
  {
    date: "March, 2021 – March, 2022",
    text: "Governing board of Make a Wish Foundation in Central and South Texas",
  },
];

const AboutMayaPage: NextPage = () => {
  return (
    <>
      <Meta
        title="About Maya"
        description="Maya Higa is one of the top female streamers on Twitch and a rising star on YouTube. Maya founded Alveus Sanctuary, a non-profit exotic animal sanctuary and virtual education center in central Texas and raised more than $500,000 during her first fundraising stream thanks to her amazing community and fellow streamers."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <div className="relative">
        <Image
          src={leafRightImage1}
          alt=""
          className="pointer-events-none absolute -top-8 right-0 z-10 hidden h-auto w-1/2 max-w-md select-none lg:block xl:max-w-lg"
        />

        <Section dark className="py-24">
          <div className="w-full lg:w-3/5">
            <Heading level={1}>About Maya Higa</Heading>
            <p className="text-lg">
              Maya Higa is one of the top female streamers on Twitch and a
              rising star on YouTube. Her passions include wildlife conservation
              and education and she integrates these into her content regularly,
              creating some of the most unique content on Twitch. Maya is a
              licensed falconer and wildlife conservationist. Her livestreams
              feature falconry, wildlife rehab, conservation education, and
              charity fundraising. She created a conservation podcast in 2019
              which has since aired more than 60 episodes on her channel and
              raised more than $92,000 for wildlife protection organizations
              around the globe. Maya founded Alveus Sanctuary, a non-profit
              exotic animal sanctuary and virtual education center in central
              Texas and raised more than $500,000 during her first fundraising
              stream thanks to her amazing community and fellow streamers.
            </p>
          </div>
        </Section>
      </div>

      <div className="relative">
        <Image
          src={leafLeftImage1}
          alt=""
          className="pointer-events-none absolute -bottom-32 left-0 z-10 hidden h-auto w-1/2 max-w-[10rem] select-none lg:block 2xl:-bottom-48 2xl:max-w-[12rem]"
        />

        <Section>
          <div className="flex flex-wrap-reverse items-center">
            <div className="basis-full pt-8 md:basis-1/2 md:pr-8 md:pt-0">
              <Image
                src={mayaImage}
                alt="Maya Higa, holding an owl in one photo, and a falcon in the second photo"
                className="ml-auto h-auto w-full max-w-lg"
              />
            </div>

            <div className="basis-full md:basis-1/2 md:px-4">
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
          className="pointer-events-none absolute -bottom-24 right-0 z-10 hidden h-auto w-1/2 max-w-[12rem] select-none lg:block"
        />

        <Section
          dark
          className="py-24"
          containerClassName="flex flex-col items-center"
        >
          <p className="my-2 text-center font-serif text-7xl font-bold">
            Maya raised over $1,000,000
          </p>
          <p className="my-2 font-serif text-4xl font-bold">Using Twitch!</p>
          <IconTwitch
            size={64}
            className="mt-6 transition-colors hover:text-alveus-green-900"
          />
        </Section>
      </div>

      {/* Grow the last section to cover the page */}
      <div className="relative flex flex-grow flex-col">
        <Image
          src={leafLeftImage3}
          alt=""
          className="pointer-events-none absolute -bottom-20 left-0 z-10 hidden h-auto w-1/2 max-w-[12rem] select-none lg:block"
        />

        <Section className="flex-grow">
          <Heading level={2} className="text-center text-5xl text-alveus-green">
            Maya&apos;s Experience
          </Heading>

          <div className="relative z-0 mx-auto mt-16 max-w-6xl">
            <div className="absolute left-5 -z-10 h-full w-1 -translate-x-1/2 bg-alveus-green md:left-1/2" />
            <ol>
              {experience.map((item, idx) => (
                <li key={item.date} className="relative my-4 flex items-start">
                  <div
                    className={`absolute left-5 inline-block ${
                      idx % 2 ? "md:left-1/2" : "md:left-auto md:right-1/2"
                    }`}
                  >
                    <div
                      className={`
                    mt-1
                    hidden
                    border-y-[1rem] border-solid border-y-transparent md:block
                    ${
                      idx % 2
                        ? "ml-6 border-l-0 border-r-[1rem] border-r-alveus-green"
                        : "mr-6 border-l-[1rem] border-r-0 border-l-alveus-green"
                    }`}
                    />
                    <div
                      className={`
                    ml-6
                    mt-1 border-y-[1rem] border-l-0 border-r-[1rem]
                    border-solid border-y-transparent border-r-alveus-green md:hidden`}
                    />
                  </div>
                  <div className="rounded-full bg-alveus-green p-3 text-alveus-tan">
                    <IconCalendar size={16} />
                  </div>
                  <div
                    className={`hidden basis-1/2 px-4 pt-2 md:block ${
                      idx % 2 ? "md:order-first" : "md:order-last"
                    }`}
                  >
                    <p
                      className={`text-md text-alveus-green-500 ${
                        idx % 2 ? "text-right" : "text-left"
                      }`}
                    >
                      {item.date}
                    </p>
                  </div>
                  <div
                    className={`basis-full px-4 md:basis-1/2 ${
                      idx % 2 ? "md:order-last" : "md:order-first"
                    }`}
                  >
                    <div className="text-md rounded-lg bg-alveus-green p-6 text-alveus-tan">
                      <p className="mb-4 md:hidden">{item.date}</p>
                      <p>{item.text}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Section>
      </div>
    </>
  );
};

export default AboutMayaPage;
