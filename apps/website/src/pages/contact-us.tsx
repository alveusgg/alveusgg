import { type NextPage } from "next"
import Head from "next/head"
import React from "react"

import Section from "../components/content/Section"
import Heading from "../components/content/Heading"
import socials from "../components/shared/data/socials"

const ContactUsPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Contact Us | Alveus.gg</title>
        <meta name="robots" content="noindex" />
      </Head>

      {/* Nav background */}
      <div className="hidden lg:block bg-alveus-green-900 h-40 -mt-40" />

      {/* Grow the last section to cover the page */}
      <Section
        className="flex-grow min-h-[85vh] flex items-center"
        containerClassName="flex flex-col items-center text-center text-alveus-green"
      >
        <Heading className="text-6xl">Contact Us</Heading>

        <p className="text-xl font-semibold my-3">
          <a href="mailto:maya@alveussanctuary.org" className="hover:underline">
            maya@alveussanctuary.org
          </a>
        </p>

        <p>You can send in a resume to maya@alveussanctuary.org.</p>
        <p>You will be put on a list for future reference.</p>

        <p className="text-xl font-semibold my-3">We are not openly hiring.</p>

        <ul className="flex flex-wrap gap-4 my-3">
          {Object.entries(socials).map(([ key, social ]) => (
            <li key={key}>
              <a
                className="block text-alveus-tan hover:text-alveus-green bg-alveus-green hover:bg-alveus-tan transition-colors p-3 rounded-2xl"
                href={social.link}
                target="_blank"
                rel="noreferrer"
              >
                <social.icon size={24} />
              </a>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
};

export default ContactUsPage;
