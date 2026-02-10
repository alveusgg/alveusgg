import { Field, Label, Switch } from "@headlessui/react";
import { type GetStaticPaths, type GetStaticProps, type NextPage } from "next";
import Image from "next/image";
import { useMemo, useState } from "react";

import {
  type ReportYear,
  getReport,
  isReportYear,
  reportYears,
} from "@/data/annual-reports";

import { classes } from "@/utils/classes";

import Box from "@/components/content/Box";
import Button from "@/components/content/Button";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import Transparency from "@/components/content/Transparency";

import IconDownload from "@/icons/IconDownload";
import IconLoading from "@/icons/IconLoading";

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
  const [graphic, setGraphic] = useState(true);

  return (
    <>
      <Meta
        title={`${report.year} | Annual Reports`}
        description={`Read through the ${report.year} Annual Report published by Alveus Sanctuary.`}
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section
        dark
        containerClassName="flex flex-wrap gap-4 justify-between items-center"
      >
        <div>
          <Heading>{report.year} Annual Report</Heading>

          <Field className="-mx-4 mt-4 flex items-center text-sm leading-none">
            <button
              className="px-4 py-1"
              type="button"
              onClick={() => setGraphic(false)}
            >
              Text
            </button>

            <Label className="sr-only">Show report graphic</Label>
            <Switch
              checked={graphic}
              onChange={setGraphic}
              className="group inline-flex h-6 w-11 shrink-0 items-center rounded-full bg-alveus-green-300 transition-colors data-checked:bg-alveus-tan"
            >
              <span className="size-4 translate-x-1 rounded-full bg-alveus-green transition-transform group-data-checked:translate-x-6" />
            </Switch>

            <button
              className="px-4 py-1"
              type="button"
              onClick={() => setGraphic(true)}
            >
              Graphic
            </button>
          </Field>
        </div>

        <Button href="/about/annual-reports" dark>
          Explore other reports
        </Button>
      </Section>

      <Section containerClassName="flex flex-col gap-16 items-center">
        {graphic && (
          <Box
            dark
            className="w-full max-w-3xl p-0"
            ringClassName="ring-black/15"
          >
            <IconLoading className="absolute top-1/2 left-1/2 -z-10 -translate-1/2" />
            <Image
              src={report.image}
              quality={100}
              className="h-auto w-full"
              alt="Report graphic"
              aria-describedby="report"
            />
          </Box>
        )}

        <div className={classes("space-y-8", graphic && "sr-only")} id="report">
          {report.alt}
        </div>

        <div className="scroll-mt-8 text-center" id="990">
          <Button
            href={report.filing}
            download={`alveus-sanctuary-990-${report.year}.pdf`}
            external
            className="inline-flex items-center gap-1 py-2 pr-4 text-base"
          >
            Download {report.year} 990 Filing <IconDownload size={20} />
          </Button>
        </div>
      </Section>

      {/* Grow the last section to cover the page */}
      <Transparency className="grow" />
    </>
  );
};

export default AboutAnnualReportYearPage;
