import { useMemo } from "react";
import { type GetStaticPaths, type GetStaticProps, type NextPage } from "next";
import Image from "next/image";

import {
  getReport,
  isReportYear,
  type ReportYear,
  reportYears,
} from "@/data/annual-reports";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Button from "@/components/content/Button";
import Meta from "@/components/content/Meta";

type AboutAnnualReportYearPageProps = {
  year: ReportYear;
};

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: reportYears.map((year) => ({
      params: { year: year.toString() },
    })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<
  AboutAnnualReportYearPageProps
> = async (context) => {
  const year = Number(context.params?.year);
  if (!isReportYear(year)) return { notFound: true };

  return {
    props: {
      year,
    },
  };
};

const AboutAnnualReportYearPage: NextPage<AboutAnnualReportYearPageProps> = ({
  year,
}) => {
  // TODO: Make Report#alt serializable, pass whole report as prop
  const report = useMemo(() => getReport(year), [year]);

  return (
    <>
      <Meta
        title={`${report.year} | Annual Reports`}
        description={`Read through the ${report.year} Annual Report published by Alveus.`}
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section
        dark
        containerClassName="flex flex-wrap gap-4 justify-between items-end"
      >
        <Heading>{report.year} Annual Report</Heading>
        <Button href="/about/annual-reports" dark>
          Explore other reports
        </Button>
      </Section>

      {/* Grow the last section to cover the page */}
      <Section className="flex-grow">
        <Image
          src={report.image}
          quality={100}
          className="mx-auto h-auto w-full max-w-3xl bg-alveus-green"
          alt="Report graphic"
          aria-describedby="report"
        />

        <div className="sr-only space-y-8" id="report">
          {report.alt}
        </div>
      </Section>
    </>
  );
};

export default AboutAnnualReportYearPage;
