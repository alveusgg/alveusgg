import { type NextPage } from "next";
import React from "react";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import IconSync from "@/icons/IconSync";

const NotFound: NextPage = () => {
  return (
    <>
      <Meta
        title="404 - Page Not Found"
        description="The page you are looking could not be found."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      {/* Grow the last section to cover the page */}
      <Section className="flex-grow">
        <Heading>404 - Page Not Found</Heading>
      </Section>

      {/* TODO: remove this! */}
      <IconSync />
    </>
  );
};

export default NotFound;
