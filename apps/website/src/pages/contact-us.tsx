import { type NextPage } from "next";
import React from "react";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Link from "@/components/content/Link";

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

        <div className="flex flex-wrap gap-x-6">
          <p className="my-3 text-xl font-semibold">
            For merch inquiries: <br />
            <Link href="https://shopalveus.org/pages/contact" external>
              shopalveus.org/pages/contact
            </Link>
          </p>

          <p className="my-3 text-xl font-semibold">
            For plushie inquiries: <br />
            <Link href="https://youtooz.com/pages/contact-us" external>
              youtooz.com/pages/contact-us
            </Link>
          </p>
        </div>

        <ul className="my-3 flex flex-wrap gap-4">
          <li>
            <Link
              className="block rounded-full border-2 border-alveus-green px-6 py-2 text-xl transition-colors hover:bg-alveus-green hover:text-alveus-tan"
              href="/donate"
              custom
            >
              Donate
            </Link>
          </li>
          <li>
            <Link
              className="block rounded-full border-2 border-alveus-green px-6 py-2 text-xl transition-colors hover:bg-alveus-green hover:text-alveus-tan"
              href="/po-box"
              custom
            >
              PO Box
            </Link>
          </li>
        </ul>
      </Section>
    </>
  );
};

export default ContactUsPage;
