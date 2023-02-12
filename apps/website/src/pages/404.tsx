import { type NextPage } from "next";
import Head from "next/head";

import React from "react"
import Section from "../components/content/Section"
import Heading from "../components/content/Heading"

const NotFound: NextPage = () => {
  return (
    <>
      <Head>
        <title>404 - Page Not Found | Alveus.gg</title>
      </Head>

      {/* Nav background */}
      <div className="hidden lg:block bg-alveus-green-900 h-40 -mt-40" />

      {/* Grow the last section to cover the page */}
      <Section className="flex-grow">
        <Heading>404 - Page Not Found</Heading>
      </Section>
    </>
  );
};

export default NotFound;
