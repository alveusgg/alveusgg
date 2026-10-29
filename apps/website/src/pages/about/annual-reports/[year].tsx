import {
  Field,
  Label,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Switch,
} from "@headlessui/react";
import { type GetStaticPaths, type GetStaticProps, type NextPage } from "next";
import dynamic from "next/dynamic";
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

import IconDownload from "@/icons/IconDownload";
import IconLoading from "@/icons/IconLoading";

const PdfBook = dynamic(() => import("@/components/content/PdfBook"), {
  ssr: false,
  loading: () => <p role="status">Loading report viewer...</p>,
});

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

          {report.image !== undefined && (
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
          )}
        </div>

        <Button href="/about/annual-reports" dark>
          Explore other reports
        </Button>
      </Section>

      {/* Grow the last section to cover the page */}
      <Section
        className="grow"
        containerClassName="flex flex-col gap-16 items-center"
      >
        {report.image !== undefined ? (
          <>
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

            <div
              className={classes("space-y-8", graphic && "sr-only")}
              id="report"
            >
              {report.alt}
            </div>
          </>
        ) : (
          <>
            <PdfBook
              key={report.pdf}
              file={report.pdf}
              title={`${report.year} Annual Report`}
              downloads={
                <Menu as="div" id="990" className="scroll-mt-8">
                  <MenuButton
                    type="button"
                    aria-label="Download report or 990 filing"
                    title="Downloads"
                    className="rounded-full border-2 border-alveus-green p-3 transition-colors hover:bg-alveus-green hover:text-alveus-tan data-open:bg-alveus-green data-open:text-alveus-tan"
                  >
                    <IconDownload size={24} aria-hidden />
                  </MenuButton>
                  <MenuItems
                    anchor="bottom end"
                    modal={false}
                    className="z-20 mt-2 rounded-xl bg-alveus-tan p-1 text-alveus-green shadow-lg outline-1 outline-black/20"
                  >
                    {[
                      {
                        label: "Annual report",
                        href: report.pdf,
                        filename: `alveus-sanctuary-annual-report-${report.year}.pdf`,
                      },
                      {
                        label: "990 filing",
                        href: report.filing,
                        filename: `alveus-sanctuary-990-${report.year}.pdf`,
                      },
                    ].map(({ label, href, filename }) => (
                      <MenuItem key={href}>
                        <a
                          href={href}
                          download={filename}
                          target="_blank"
                          rel="noreferrer"
                          className="block rounded-lg px-4 py-2 data-focus:bg-alveus-green data-focus:text-alveus-tan"
                        >
                          {label}
                        </a>
                      </MenuItem>
                    ))}
                  </MenuItems>
                </Menu>
              }
            />
          </>
        )}

        {report.image !== undefined && (
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
        )}
      </Section>
    </>
  );
};

export default AboutAnnualReportYearPage;
