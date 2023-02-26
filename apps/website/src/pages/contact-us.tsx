import { type NextPage } from "next";
import Head from "next/head";
import React from "react";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import socials from "@/components/shared/data/socials";

const ContactUsPage: NextPage = () => {
  return (
    <>
      <Meta
        title="Contact Us"
        description="Contact us for any questions or concerns you may have. We are not openly hiring."
      />

      <Head>
        <meta name="robots" content="noindex" />
      </Head>

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      {/* Grow the last section to cover the page */}
      <Section
        className="flex min-h-[85vh] flex-grow items-center"
        containerClassName="flex flex-col items-center text-center text-alveus-green"
      >
        <Heading className="text-6xl">Contact Us</Heading>

        <p className="my-3 text-xl font-semibold">
          <a href="mailto:maya@alveussanctuary.org" className="hover:underline">
            maya@alveussanctuary.org
          </a>
        </p>

        <p>You can send in a resume to maya@alveussanctuary.org.</p>
        <p>You will be put on a list for future reference.</p>

        <p className="my-3 text-xl font-semibold">We are not openly hiring.</p>

        <ul className="my-3 flex flex-wrap gap-4">
          {Object.entries(socials).map(([key, social]) => (
            <li key={key}>
              <a
                className="block rounded-2xl bg-alveus-green p-3 text-alveus-tan transition-colors hover:bg-alveus-tan hover:text-alveus-green"
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
