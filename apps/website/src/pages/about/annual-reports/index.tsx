import { type NextPage } from "next";

import { getReport, reportYears } from "@/data/annual-reports";

import Button from "@/components/content/Button";
import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";

import IconDownload from "@/icons/IconDownload";

const reports = reportYears.map(getReport);

const LatestBadge = () => (
  <span className="rounded-md bg-alveus-green px-2 py-0.5 font-sans text-sm font-semibold text-alveus-tan">
    Latest
  </span>
);

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

      {/* Grow the last section to cover the page */}
      <Section className="grow">
        {/* overflow-hidden clips the header background to the rounded corners */}
        <div className="overflow-hidden rounded-2xl border border-alveus-green-200 bg-alveus-tan-50">
          {/* Explicit roles keep the table semantics when rows stack on phones
              (display: block otherwise drops them in some browsers) */}
          <table role="table" className="block w-full text-left md:table">
            <caption className="sr-only">
              Annual reports by year, with each year&apos;s full report and Form
              990 filing
            </caption>
            <thead
              role="rowgroup"
              className="sr-only bg-alveus-green-100 text-sm text-alveus-green-800 md:not-sr-only md:table-header-group"
            >
              <tr role="row">
                <th role="columnheader" scope="col" className="px-4 py-3">
                  Year
                </th>
                <th role="columnheader" scope="col" className="px-4 py-3">
                  Summary
                </th>
                <th role="columnheader" scope="col" className="px-4 py-3">
                  Report
                </th>
                <th role="columnheader" scope="col" className="px-4 py-3">
                  Form 990
                </th>
              </tr>
            </thead>
            <tbody
              role="rowgroup"
              className="block divide-y divide-alveus-green-200 md:table-row-group"
            >
              {reports.map((report, idx) => (
                <tr
                  key={report.year}
                  role="row"
                  className="flex flex-col gap-3 p-4 md:table-row md:p-0"
                >
                  <th
                    role="rowheader"
                    scope="row"
                    className="font-serif text-2xl text-alveus-green-800 tabular-nums md:p-4 md:align-top md:whitespace-nowrap"
                  >
                    <span className="flex items-center gap-2">
                      {report.year}
                      {idx === 0 && <LatestBadge />}
                    </span>
                  </th>
                  <td role="cell" className="md:max-w-md md:p-4 md:align-top">
                    {report.summary}
                  </td>
                  <td
                    role="cell"
                    className="md:p-4 md:align-top md:whitespace-nowrap"
                  >
                    <Button
                      href={`/about/annual-reports/${report.year}`}
                      filled
                      className="px-4 py-1.5 text-base"
                    >
                      Read {report.year} Report
                    </Button>
                  </td>
                  <td
                    role="cell"
                    className="md:p-4 md:align-top md:whitespace-nowrap"
                  >
                    <Link
                      href={report.filing}
                      download={`alveus-sanctuary-990-${report.year}.pdf`}
                      className="inline-flex items-center gap-1"
                    >
                      Download 990 Filing
                      <span className="sr-only"> for {report.year}</span>
                      <IconDownload size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
};

export default AnnualReportsPage;
