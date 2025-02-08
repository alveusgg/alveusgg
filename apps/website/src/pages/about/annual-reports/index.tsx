import { type NextPage } from "next";

import { reportYears } from "@/data/annual-reports";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Button from "@/components/content/Button";
import Transparency from "@/components/content/Transparency";

import IconChevronRight from "@/icons/IconChevronRight";

const AnnualReportsPage: NextPage = () => {
  return (
    <>
      <Meta
        title="Annual Reports"
        description="Read through the reports published each year on the current status of Alveus and its mission."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section dark className="py-8">
        <Heading className="text-center">Annual Reports</Heading>
      </Section>

      <Section containerClassName="flex flex-col md:flex-row gap-8">
        <div className="text-balance md:basis-1/2">
          <p className="text-lg text-alveus-green-900">
            Each year we publish a report that covers key stats on the growth
            and current status of Alveus, the impact we&apos;ve made toward our
            continued mission, and an in-depth breakdown of the financials
            behind the sanctuary.
          </p>
        </div>
        <div className="flex flex-col items-start gap-4 md:basis-1/2">
          {reportYears.map((year) => (
            <Button
              key={year}
              href={`/about/annual-reports/${year}`}
              className="group inline-flex items-center sm:shrink-0"
            >
              <Heading
                level={2}
                className="my-0 font-sans text-2xl font-semibold"
              >
                {year} Annual Report
              </Heading>
              <IconChevronRight
                size={24}
                className="-mr-1 ml-2 mt-1 shrink-0 transition-all group-hover:-mr-2 group-hover:ml-3"
              />
            </Button>
          ))}
        </div>
      </Section>

      {/* Grow the last section to cover the page */}
      <Transparency className="grow" />
    </>
  );
};

export default AnnualReportsPage;
