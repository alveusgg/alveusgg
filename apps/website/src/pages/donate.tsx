import { type NextPage } from "next";
import Image from "next/image";

import ambassadors from "@alveusgg/data/build/ambassadors/core";
import type { ActiveAmbassadorKey } from "@alveusgg/data/build/ambassadors/filters";
import { getAmbassadorImages } from "@alveusgg/data/build/ambassadors/images";

import donationEvent from "@/data/env/donation-event";

import { classes } from "@/utils/classes";
import { camelToKebab } from "@/utils/string-case";

import { useConsent } from "@/hooks/consent";

import Consent from "@/components/Consent";
import Box from "@/components/content/Box";
import Donate, { types } from "@/components/content/Donate";
import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";
import Markdown from "@/components/content/Markdown";
import { MayaQuote } from "@/components/content/Maya";
import Meta from "@/components/content/Meta";
import NeonDonateEmbed from "@/components/content/NeonDonateEmbed";
import NonprofitStatus from "@/components/content/NonprofitStatus";
import Section from "@/components/content/Section";

import IconArrowRight from "@/icons/IconArrowRight";
import IconDocument from "@/icons/IconDocument";
import IconEnvelope from "@/icons/IconEnvelope";
import IconLock from "@/icons/IconLock";
import IconMapPin from "@/icons/IconMapPin";
import IconPaw from "@/icons/IconPaw";

import { ambassadorImageHover } from "./ambassadors";

const ambassador: ActiveAmbassadorKey = "winnieTheMoo";
const ambassadorImage = getAmbassadorImages(ambassador)[0];

const supportItems = [
  {
    icon: IconPaw,
    text: "Rescue and home non-releasable animal ambassadors and protect their wild counterparts",
  },
  {
    icon: IconDocument,
    text: "Create impactful conservation education programs",
  },
  {
    icon: IconMapPin,
    text: "Develop high quality animal enclosures and staff facilities",
  },
];

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
        containerClassName="flex flex-wrap gap-8 lg:gap-x-16"
      >
        <div className="flex w-full min-w-0 flex-col gap-8 lg:flex-1">
          {!consent.neon && <Donate type="direct" />}

          <Consent item="donation widget" consent="neon">
            <Box
              dark
              className="-mt-24 w-full overflow-visible bg-alveus-green-900 shadow-2xl before:pointer-events-none before:absolute before:inset-0 before:-scale-y-100 before:rounded-xl before:shadow-2xl"
            >
              <div className="mb-8 flex flex-wrap items-baseline-last justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold tracking-widest text-alveus-tan/75 uppercase">
                    Support Alveus Sanctuary
                  </p>
                  <Heading level={2} className="my-0 text-4xl">
                    Make your donation
                  </Heading>
                </div>

                <div className="flex items-center gap-2 text-alveus-tan/75">
                  <IconLock className="size-4" aria-hidden="true" />
                  <p className="text-xs font-semibold">Secure donation</p>
                </div>
              </div>

              <NeonDonateEmbed
                form="general"
                className="-mx-8 -mb-8 *:w-full *:[&_iframe]:rounded-b-xl *:[&_iframe]:bg-white *:[&_iframe]:outline-none"
              />
            </Box>
          </Consent>

          <Link href="/donate/manage" external className="mt-auto">
            Manage your recurring donations and view donation history
          </Link>
        </div>

        <div className="flex w-full min-w-0 flex-col gap-8 lg:flex-1 xl:w-lg xl:flex-none">
          <Box className="mx-auto w-full max-w-lg p-0 lg:mx-0">
            <div className="p-6 sm:p-8">
              <Heading level={2} className="m-0">
                Your support helps us:
              </Heading>

              <ul className="mt-4 flex flex-col gap-4 border-t border-alveus-green/20 pt-4">
                {supportItems.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-4">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-alveus-green text-alveus-green">
                      <Icon className="size-6" aria-hidden="true" />
                    </span>
                    <p className="py-2 font-semibold text-alveus-green-800">
                      {text}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href={`/ambassadors/${camelToKebab(ambassador)}`}
              custom
              className="group relative block overflow-clip"
            >
              <Image
                src={ambassadorImage.src}
                alt={ambassadorImage.alt}
                placeholder="blur"
                width={512}
                className={classes(
                  "aspect-square h-auto w-full object-cover",
                  ambassadorImageHover,
                )}
                style={{ objectPosition: ambassadorImage.position }}
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent to-40%" />
              <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-baseline justify-between gap-2 p-6 text-white sm:p-8">
                <span className="font-semibold tracking-widest uppercase group-hover:underline">
                  Meet {ambassadors[ambassador].name}
                </span>
                <span className="text-sm">Alveus ambassador</span>
              </div>
            </Link>

            <div className="bg-alveus-green p-6 sm:p-8">
              <MayaQuote short />
            </div>

            <div className="flex items-center gap-4 p-6 sm:p-8">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-alveus-green text-alveus-green">
                <IconEnvelope className="size-6" aria-hidden="true" />
              </span>

              <div>
                <p className="font-semibold text-alveus-green-800">
                  Questions about giving?
                </p>
                <Link
                  href="/contact-us"
                  className="inline-flex items-center gap-1"
                >
                  We&apos;re here to help
                  <IconArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </Box>

          {types.map(
            (key) =>
              key !== "direct" && (
                <Donate key={key} type={key} highlight={key === "twitch"} />
              ),
          )}
        </div>

        <div className="w-full text-sm text-alveus-green">
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
