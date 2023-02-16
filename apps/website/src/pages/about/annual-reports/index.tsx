import { type NextPage } from "next"
import Head from "next/head"
import Link from "next/link"
import React from "react"
import Section from "../../../components/content/Section"
import Heading from "../../../components/content/Heading"
import IconAngleRight from "../../../icons/IconAngleRight"

const reports = {
  2021: {
    title: "2021 Annual Report",
    link: "/about/annual-reports/2021",
  },
};

const AnnualReportsPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Annual Reports | Alveus.gg</title>
        <meta name="robots" content="noindex" />
      </Head>

      {/* Nav background */}
      <div className="hidden lg:block bg-alveus-green-900 h-40 -mt-40" />

      <Section dark>
        <Heading>Annual Reports</Heading>
        <p>Read through the reports published each year on the current status of Alveus and its mission.</p>
      </Section>

      {/* Grow the last section to cover the page */}
      <Section className="flex-grow">
        <div className="max-w-xl mx-auto p-4 flex flex-col gap-8">
          {Object.entries(reports).map(([ key, report ]) => (
            <Link
              key={key}
              href={report.link}
              className="group flex items-center justify-between gap-2 rounded-xl p-4 bg-alveus-green text-alveus-tan shadow-xl hover:shadow-2xl hover:scale-105 transition-shadow transition-transform"
            >
              <Heading level={2} className="my-0">{report.title}</Heading>
              <IconAngleRight size={24} className="text-alveus-green group-hover:text-alveus-tan transition-colors" />
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
};

export default AnnualReportsPage;
