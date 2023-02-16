import { type NextPage } from "next"
import Head from "next/head"
import Link from "next/link"
import React from "react"
import Section from "../components/content/Section"
import Heading from "../components/content/Heading"
import IconAmazon from "../icons/IconAmazon"
import IconPayPal from "../icons/IconPayPal"

const links = {
  wishlist: {
    icon: IconAmazon,
    title: "Amazon Wishlist",
    link: "/wishlist",
    description: "Donate specific items we are in need of at Alveus through our Amazon Wishlist.",
  },
  paypal: {
    icon: IconPayPal,
    title: "PayPal",
    link: "/paypal",
    description: "Donate via credit/debit card, bank account or PayPal funds directly to Alveus.",
  },
};

const DonatePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Donate | Alveus.gg</title>
        <meta name="robots" content="noindex" />
      </Head>

      {/* Nav background */}
      <div className="hidden lg:block bg-alveus-green-900 h-40 -mt-40" />

      <Section dark>
        <Heading>Donate</Heading>
        <p>
          Help Alveus carry on its mission to inspire online audiences to engage in conservation efforts while providing
          high-quality animal care to our ambassadors.
        </p>
      </Section>

      {/* Grow the last section to cover the page */}
      <Section className="flex-grow" containerClassName="flex flex-wrap">
        <div className="basis-full md:basis-1/2 py-4 md:px-4 flex flex-col gap-8">
          {Object.entries(links).map(([ key, link ]) => (
            <Link
              key={key}
              href={link.link}
              target="_blank"
              rel="noreferrer"
              className="group rounded-xl p-4 bg-alveus-green text-alveus-tan shadow-xl hover:shadow-2xl hover:scale-105 transition-shadow transition-transform"
            >
              <div className="flex items-center gap-4 mb-1">
                <div className="block border-2 border-alveus-tan text-alveus-green group-hover:text-alveus-tan bg-alveus-tan group-hover:bg-alveus-green transition-colors p-2 rounded-xl">
                  <link.icon size={24} />
                </div>
                <Heading level={2}>{link.title}</Heading>
              </div>
              <p>{link.description}</p>
            </Link>
          ))}
        </div>

        <div className="basis-full md:basis-1/2 py-4 md:px-4 flex flex-col items-center gap-8">
          <iframe src="https://tgbwidget.com/?charityID=861772907" width="100%" height="604px" frameBorder="0" />
        </div>
      </Section>
    </>
  );
};

export default DonatePage;
