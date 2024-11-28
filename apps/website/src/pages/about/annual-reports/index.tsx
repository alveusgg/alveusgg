import { type NextPage } from "next";

import { reportYears } from "@/data/annual-reports";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Button from "@/components/content/Button";

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

      <Section dark>
        <Heading>Annual Reports</Heading>
        <p>
          Read through the reports published each year on the current status of
          Alveus and its mission.
        </p>
      </Section>

      {/* Grow the last section to cover the page */}
      <Section className="grow">
        <div className="mx-auto flex flex-wrap justify-evenly gap-8 p-4">
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
    </>
  );
};

export default AnnualReportsPage;
