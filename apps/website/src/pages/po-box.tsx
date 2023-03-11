import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import React from "react";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";

const POBoxPage: NextPage = () => {
  return (
    <>
      <Meta
        title="PO Box"
        description="Want to send something to Alveus, perhaps a gift to support the ambassadors? Here's our PO Box."
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
        <Heading className="text-6xl">PO Box</Heading>

        <p className="my-3 text-xl font-semibold">
          500 E Whitestone Blvd #2350, Cedar Park, TX 78613
        </p>

        <p>Use our PO Box to send things to Alveus.</p>
        <p>Perhaps a gift to support the ambassadors?</p>

        <p className="my-3 text-xl font-semibold">
          Please do not send anything to this address that is not intended for
          Alveus.
        </p>

        <ul className="my-3 flex flex-wrap gap-4">
          <li>
            <Link
              className="rounded-full border-2 border-alveus-green px-6 py-2 text-xl transition-colors hover:bg-alveus-green hover:text-alveus-tan"
              href="/donate"
            >
              Donate
            </Link>
          </li>
          <li>
            <Link
              className="rounded-full border-2 border-alveus-green px-6 py-2 text-xl transition-colors hover:bg-alveus-green hover:text-alveus-tan"
              href="/contact-us"
            >
              Contact Us
            </Link>
          </li>
        </ul>
      </Section>
    </>
  );
};

export default POBoxPage;
