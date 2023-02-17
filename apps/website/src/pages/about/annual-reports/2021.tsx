import { type NextPage } from "next"
import Head from "next/head"
import Image from "next/image"
import Link from "next/link"
import React from "react"

import Section from "../../../components/content/Section"
import Heading from "../../../components/content/Heading"

import report2021Image from "../../../assets/reports/2021.png"

const AboutAnnualReport2021Page: NextPage = () => {
  return (
    <>
      <Head>
        <title>2021 Annual Report | Alveus.gg</title>
        <meta name="robots" content="noindex" />
      </Head>

      {/* Nav background */}
      <div className="hidden lg:block bg-alveus-green-900 h-40 -mt-40" />

      <Section dark containerClassName="flex flex-wrap gap-4 justify-between items-end">
        <Heading>2012 Annual Report</Heading>
        <Link
          href="/about/annual-reports"
          className="text-md px-4 py-2 rounded-full border-2 border-white hover:bg-alveus-tan hover:text-alveus-green hover:border-alveus-tan transition-colors"
        >
          Explore other reports
        </Link>
      </Section>

      {/* Grow the last section to cover the page */}
      <Section className="flex-grow">
        <Image
          src={report2021Image}
          quality={100}
          alt=""
          className="mx-auto w-full max-w-[700px] h-auto"
        />
      </Section>
    </>
  )
};

export default AboutAnnualReport2021Page;
