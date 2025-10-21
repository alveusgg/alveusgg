import { type NextPage } from "next";

import donationEvent from "@/data/env/donation-event";

import { useConsent } from "@/hooks/consent";

import Consent from "@/components/Consent";
import Donate, { types } from "@/components/content/Donate";
import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";
import Markdown from "@/components/content/Markdown";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import TheGivingBlockEmbed from "@/components/content/TheGivingBlockEmbed";

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

      <Section dark>
        <Heading>Donate</Heading>
        <p className="text-lg">
          Help Alveus carry on its mission to inspire online audiences to engage
          in conservation efforts while providing high-quality animal care to
          our ambassadors.
        </p>
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
      <Section className="grow" containerClassName="flex flex-wrap">
        <div className="flex basis-full flex-col gap-8 py-4 lg:basis-1/2 lg:px-4">
          {types.map(
            (key) =>
              key !== "givingBlock" && (
                <Donate key={key} type={key} highlight={key === "twitch"} />
              ),
          )}
        </div>

        <div className="flex basis-full flex-col gap-8 py-4 lg:basis-1/2 lg:px-4">
          {!consent.givingBlock && <Donate type="givingBlock" />}

          <Consent item="donation widget" consent="givingBlock">
            <TheGivingBlockEmbed className="flex w-full justify-center" />
          </Consent>
        </div>

        <div className="mt-6 text-sm text-alveus-green">
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
