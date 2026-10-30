import { type NextPage } from "next";

import donationEvent from "@/data/env/donation-event";

import { useConsent } from "@/hooks/consent";

import Consent from "@/components/Consent";
import Donate, { types } from "@/components/content/Donate";
import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";
import Markdown from "@/components/content/Markdown";
import Meta from "@/components/content/Meta";
import NeonDonateEmbed from "@/components/content/NeonDonateEmbed";
import NonprofitStatus from "@/components/content/NonprofitStatus";
import Section from "@/components/content/Section";

import IconArrowRight from "@/icons/IconArrowRight";

const DonatePage: NextPage = () => {
  const { consent } = useConsent();

  return (
    <>
      <Meta
        title="Donate"
        description="Help Alveus carry on its mission to inspire online audiences to engage in conservation efforts while providing high-quality animal care to our ambassadors."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section
        dark
        className="py-8"
        containerClassName="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)] lg:gap-12"
      >
        <div className="flex flex-col gap-4 pt-4 pb-8 lg:max-w-4xl lg:py-8 xl:max-w-5xl">
          <Heading className="my-0">Donate</Heading>
          <p className="text-lg">
            Help Alveus carry on its mission to inspire online audiences to
            engage in conservation efforts while providing high-quality animal
            care to our ambassadors.
          </p>
        </div>

        <NonprofitStatus />
      </Section>

      {donationEvent && (
        <Section
          dark
          className="bg-carnival"
          containerClassName="flex flex-col md:flex-row gap-8 items-start md:items-end"
        >
          <div className="grow">
            <Heading level={2} id="event" link>
              {donationEvent.title}
            </Heading>
            {donationEvent.description && (
              <div className="text-lg text-balance">
                <Markdown content={donationEvent.description} dark />
              </div>
            )}
          </div>

          <Link
            href={donationEvent.link}
            external={donationEvent.external}
            custom
            className="rounded-full border-2 border-white px-4 py-2 text-lg whitespace-nowrap text-white transition-colors hover:bg-white hover:text-carnival md:px-4 md:py-2 md:text-xl"
          >
            {donationEvent.cta}
            <IconArrowRight className="ml-3 inline-block size-6" />
          </Link>
        </Section>
      )}

      {/* Grow the last section to cover the page */}
      <Section
        className="grow"
        containerClassName="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        <div className="flex flex-col gap-8">
          {!consent.neon && <Donate type="direct" />}

          <Consent item="donation widget" consent="neon">
            <NeonDonateEmbed
              form="general"
              className="contents *:w-full *:[&_iframe]:rounded-xl *:[&_iframe]:bg-alveus-tan/50 *:[&_iframe]:backdrop-blur-md *:[&_iframe]:outline-none"
            />
          </Consent>

          <Link href="/donate/manage" external className="mt-auto">
            Manage your recurring donations and view donation history
          </Link>
        </div>

        <div className="flex flex-col gap-8">
          {types.map(
            (key) =>
              key !== "direct" && (
                <Donate key={key} type={key} highlight={key === "twitch"} />
              ),
          )}
        </div>

        <div className="col-span-full text-sm text-alveus-green">
          <p>
            Alveus Sanctuary will honor any of the giving preferences of donors
            for any pre-approved program, or project where possible. In the
            event that this is not possible, donations will be utilized for the
            general benefit of the sanctuary.
          </p>
        </div>
      </Section>
    </>
  );
};

export default DonatePage;
