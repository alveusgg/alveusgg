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

const AboutMayaPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>About Maya | Alveus.gg</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={leafRightImage1.src}
          alt=""
          className="hidden lg:block absolute z-10 -bottom-8 right-0 w-1/2 max-w-md"
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={leafLeftImage1.src}
          alt=""
          className="hidden lg:block absolute z-10 -bottom-24 left w-1/2 max-w-[12rem]"
        />

        <Section>
          <div className="flex flex-wrap-reverse items-center">
            <div className="basis-full md:basis-1/2 pt-8 md:pt-0 md:pr-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mayaImage.src}
                alt="Maya Higa, holding an owl in one photo, and a falcon in the second photo"
                className="w-full max-w-lg mx-auto"
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={leafRightImage2.src}
          alt=""
          className="hidden lg:block absolute z-10 -top-24 right-0 w-1/2 max-w-[12rem]"
        />

        <Section dark className="py-24" containerClassName="flex flex-col items-center">
          <p className="my-2 font-serif text-7xl font-bold">Maya raised over $1,000,000</p>
          <p className="my-2 font-serif text-4xl font-bold">Using Twitch!</p>
          <IconTwitch size={64} className="mt-6 hover:text-alveus-green-900 transition-colors" />
        </Section>
      </div>

      <Section className="text-center">
        <Heading level={2} className="text-5xl text-alveus-green">
          Maya&apos;s Experience
        </Heading>
        {/* TODO: Timeline */}
      </Section>
    </>
  );
};

export default AboutMayaPage;
