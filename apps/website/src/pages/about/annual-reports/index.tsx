import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import React from "react";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import IconAngleRight from "@/icons/IconAngleRight";

const reports = {
  2021: {
    title: "2021 Annual Report",
    link: "/about/annual-reports/2021",
  },
};

const AnnualReportsPage: NextPage = () => {
  return (
    <>
      <Meta
        title="Annual Reports"
        description="Read through the reports published each year on the current status of Alveus and its mission."
      />

      <Head>
        <meta name="robots" content="noindex" />
      </Head>

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section dark>
        <Heading>Annual Reports</Heading>
        <p>
          Read through the reports published each year on the current status of
          Alveus and its mission.
        </p>
      </Section>

      {/* Grow the last section to cover the page */}
      <Section className="flex-grow">
        <div className="mx-auto flex max-w-xl flex-col gap-8 p-4">
          {Object.entries(reports).map(([key, report]) => (
            <Link
              key={key}
              href={report.link}
              className="group flex items-center justify-between gap-2 rounded-xl bg-alveus-green p-4 text-alveus-tan shadow-xl transition-shadow transition-transform hover:scale-105 hover:shadow-2xl"
            >
              <Heading level={2} className="my-0">
                {report.title}
              </Heading>
              <IconAngleRight
                size={24}
                className="text-alveus-green transition-colors group-hover:text-alveus-tan"
              />
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
};

export default AnnualReportsPage;
