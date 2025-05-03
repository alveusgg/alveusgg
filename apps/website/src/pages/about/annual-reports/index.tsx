import { type NextPage } from "next";

import { reportYears } from "@/data/annual-reports";

import { classes } from "@/utils/classes";

import Button from "@/components/content/Button";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
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

      <Section dark>
        <Heading>Annual Reports</Heading>
        <p>
          Each year we publish a report that covers key stats on the growth and
          current status of Alveus, the impact we&apos;ve made toward our
          continued mission, and an in-depth breakdown of the financials behind
          the sanctuary.
        </p>
      </Section>

      <Section>
        <div className="mx-auto flex flex-wrap justify-evenly gap-8 p-4">
          {reportYears.map((year, idx) => (
            <Button
              key={year}
              href={`/about/annual-reports/${year}`}
              className="group inline-flex items-center sm:shrink-0"
            >
              <Heading
                level={2}
                className={classes(
                  "my-0 font-sans",
                  idx === 0 ? "text-2xl font-semibold" : "text-xl font-normal",
                )}
              >
                {year} Annual Report
              </Heading>
              <IconChevronRight
                size={24}
                className="mt-1 -mr-1 ml-2 shrink-0 transition-all group-hover:-mr-2 group-hover:ml-3"
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
