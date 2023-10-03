import { type NextPage } from "next";
import Image from "next/image";
import Link from "next/link";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";

import report2022Image from "@/assets/reports/2022.svg";

const AboutAnnualReport2022Page: NextPage = () => {
  return (
    <>
      <Meta
        title="2022 | Annual Reports"
        description="Read through the 2022 Annual Report published by Alveus."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section
        dark
        containerClassName="flex flex-wrap gap-4 justify-between items-end"
      >
        <Heading>2022 Annual Report</Heading>
        <Link
          href="/about/annual-reports"
          className="text-md rounded-full border-2 border-white px-4 py-2 transition-colors hover:border-alveus-tan hover:bg-alveus-tan hover:text-alveus-green"
        >
          Explore other reports
        </Link>
      </Section>

      {/* Grow the last section to cover the page */}
      <Section className="flex-grow">
        <Image
          src={report2022Image}
          quality={100}
          alt=""
          className="mx-auto h-auto w-full max-w-3xl"
        />
      </Section>
    </>
  );
};

export default AboutAnnualReport2022Page;
