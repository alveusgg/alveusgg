import { type NextPage } from "next";

import newsletters from "@/data/newsletters";

import { formatDateTime } from "@/utils/datetime";

import Button from "@/components/content/Button";
import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import Transparency from "@/components/content/Transparency";

import IconEnvelope from "@/icons/IconEnvelope";
import IconEnvelopeOpen from "@/icons/IconEnvelopeOpen";

const NewslettersPage: NextPage = () => {
  return (
    <>
      <Meta
        title="Newsletter Archive"
        description="Read through the previous email newsletters we've sent out to our community."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section
        dark
        containerClassName="flex flex-wrap gap-8 justify-between items-center"
      >
        <div>
          <Heading>Newsletter Archive</Heading>
          <p>
            Read through the previous email newsletters we&apos;ve sent out to
            our community.
          </p>
        </div>

        <Button href="/forms/announcements" dark>
          Get future emails
        </Button>
      </Section>

      <Section containerClassName="flex">
        <ul className="mx-auto grid grid-cols-auto-2 gap-y-1 md:grid-cols-auto-4">
          {newsletters.map(({ date, subject, sender }) => (
            <li key={date} className="contents">
              <Link
                href={`/newsletters/${date}`}
                custom
                className="group col-span-full grid grid-cols-subgrid items-center gap-x-2 gap-y-1 rounded bg-alveus-green-50/75 px-4 py-2 text-lg text-alveus-green-800 backdrop-blur-sm transition hover:bg-alveus-green-100/75 hover:shadow"
              >
                <span className="relative flex items-center gap-2 justify-self-start md:justify-self-auto">
                  <IconEnvelope
                    size={20}
                    className="mt-0.5 group-hover:opacity-0"
                  />
                  <IconEnvelopeOpen
                    size={20}
                    className="absolute top-1/2 -mt-px -translate-y-1/2 opacity-0 group-hover:opacity-100"
                  />

                  <span>{sender}</span>
                </span>

                <span className="justify-self-end md:justify-self-auto">
                  {formatDateTime(new Date(date), { style: "long" })}
                </span>

                <span className="col-span-full md:col-span-1">{subject}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {/* Grow the last section to cover the page */}
      <Transparency className="grow" />
    </>
  );
};

export default NewslettersPage;
