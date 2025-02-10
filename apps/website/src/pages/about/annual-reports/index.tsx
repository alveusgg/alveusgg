import { type ComponentProps } from "react";
import { type NextPage } from "next";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

import { filings, reportYears } from "@/data/annual-reports";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Button from "@/components/content/Button";
import Transparency from "@/components/content/Transparency";

import IconChevronRight from "@/icons/IconChevronRight";
import IconChevronDown from "@/icons/IconChevronDown";

const DropdownButton = ({
  ...props
}: Omit<ComponentProps<typeof Button>, "as">) => (
  <Button {...props} as="button" type="button" />
);

const AnnualReportsPage: NextPage = () => {
  return (
    <>
      <Meta
        title="Annual Reports"
        description="Read through the reports published each year on the current status of Alveus and its mission, view our 990 filings, and learn more about our transparency."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section dark className="py-8">
        <Heading className="text-center">Annual Reports</Heading>
      </Section>

      <Section containerClassName="space-y-16">
        <div className="flex flex-col gap-8 md:flex-row xl:gap-16">
          <div className="text-balance md:basis-1/2 xl:basis-3/5">
            <p className="text-lg text-alveus-green-900">
              Each year we publish a report that covers key stats on the growth
              and current status of Alveus, the impact we&apos;ve made toward
              our continued mission, and an in-depth breakdown of the financials
              behind the sanctuary.
            </p>
          </div>
          <div className="flex flex-col items-start gap-4 md:basis-1/2 xl:basis-2/5">
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
        </div>

        <div className="flex flex-col gap-8 md:flex-row xl:gap-16">
          <div className="text-balance md:basis-1/2 xl:basis-3/5">
            <p>
              As a 501(c)(3) nonprofit, we are required to file a 990 form each
              year with the IRS. These forms are public record, available to
              download here, and give a detailed look at our financials.
            </p>
          </div>
          <div className="md:basis-1/2 xl:basis-2/5">
            <Menu>
              <MenuButton
                as={DropdownButton}
                className="group/button inline-flex items-center gap-1 py-2 pr-4"
              >
                Download 990 Filings
                <IconChevronDown
                  size={16}
                  className="transition-transform translate-y-0.5 group-data-[open]/button:-scale-y-100"
                />
              </MenuButton>

              <MenuItems
                anchor="bottom"
                transition
                className="group/items absolute left-0 top-full z-30 -ml-4 mt-1.5 flex flex-col rounded bg-alveus-tan text-alveus-green shadow-lg outline outline-1 outline-black/20 transition ease-in-out data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[closed]:scale-95"
                as="ul"
                modal={false}
              >
                {filings.map(({ year, link }) => (
                  <MenuItem key={year} as="li" className="group/item">
                    <a
                      href={link}
                      target="_blank"
                      download={`alveus-sanctuary-990-${year}.pdf`}
                      rel="noreferrer"
                      className="block rounded px-4 py-1 transition-colors hover:bg-alveus-green hover:text-alveus-tan group-data-[focus]/item:outline-blue-500 group-data-[focus]/item:group-focus-visible/items:outline"
                    >
                      {`alveus-sanctuary-990-${year}.pdf`}
                    </a>
                  </MenuItem>
                ))}
              </MenuItems>
            </Menu>
          </div>
        </div>
      </Section>

      {/* Grow the last section to cover the page */}
      <Transparency className="grow" />
    </>
  );
};

export default AnnualReportsPage;
