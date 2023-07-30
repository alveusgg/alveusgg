import { type NextPage } from "next";
import React from "react";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Link from "@/components/content/Link";
import socials from "@/components/shared/data/socials";

const ContactUsPage: NextPage = () => {
  return (
    <>
      <Meta
        title="Contact Us"
        description="Contact us for any questions or concerns you may have. We are not openly hiring."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      {/* Grow the last section to cover the page */}
      <Section
        className="flex min-h-[85vh] flex-grow items-center"
        containerClassName="flex flex-col items-center text-center text-alveus-green"
      >
        <Heading className="text-6xl">Contact Us</Heading>
        <p className="my-3 text-xl font-semibold">We are not openly hiring.</p>

        <p className="my-3 text-xl font-semibold">
          For business inquiries: <br />
          <Link href="mailto:TeamAlveus@unitedtalent.com">
            TeamAlveus@unitedtalent.com
          </Link>
        </p>

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
