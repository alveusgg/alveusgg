import { type NextPage } from "next";
import { type ComponentType } from "react";

import donationEvent from "@/data/env/donation-event";

import { useConsent } from "@/hooks/consent";

import Consent from "@/components/Consent";
import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";
import Markdown from "@/components/content/Markdown";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import TheGivingBlockEmbed from "@/components/content/TheGivingBlockEmbed";

import { type IconProps } from "@/icons/BaseIcon";
import IconAmazon from "@/icons/IconAmazon";
import IconArrowRight from "@/icons/IconArrowRight";
import IconBitcoin from "@/icons/IconBitcoin";
import IconBox from "@/icons/IconBox";
import IconPayPal from "@/icons/IconPayPal";
import IconTwitch from "@/icons/IconTwitch";

type DonateLink = {
  icon: ComponentType<IconProps>;
  title: string;
  link: string;
  external: boolean;
  description: string;
};

const links = {
  wishlist: {
    icon: IconAmazon,
    title: "Amazon Wishlist",
    link: "/wishlist",
    external: true,
    description:
      "Donate specific items we are in need of at Alveus through our Amazon wishlist.",
  },
  twitch: {
    icon: IconTwitch,
    title: "Twitch Charity",
    link: "/twitch-charity",
    external: true,
    description:
      "Donate to Alveus on Twitch via PayPal's Giving Fund, using a credit/debit card or PayPal account.",
  },
  paypal: {
    icon: IconPayPal,
    title: "PayPal",
    link: "/paypal",
    external: true,
    description:
      "Use your PayPal account, or your credit/debit card, to donate directly to Alveus.",
  },
  poBox: {
    icon: IconBox,
    title: "PO Box",
    link: "/po-box",
    external: false,
    description:
      "Send something to our PO Box. Perhaps a snack for our staff or ambassador enrichment?",
  },
} as const satisfies Record<string, DonateLink>;

const givingBlock: DonateLink = {
  icon: IconBitcoin,
  title: "The Giving Block",
  link: "/giving-block",
  external: true,
  description:
    "Donate cryptocurrency, stocks or via card to Alveus using The Giving Block.",
};

const DonateItem = ({ link }: { link: DonateLink }) => (
  <Link
    href={link.link}
    external={link.external}
    custom
    className="group rounded-xl bg-alveus-green p-4 text-alveus-tan shadow-xl transition hover:scale-102 hover:shadow-2xl"
  >
    <div className="mb-1 flex items-center gap-4">
      <div className="block rounded-xl border-2 border-alveus-tan bg-alveus-tan p-2 text-alveus-green transition-colors group-hover:bg-alveus-green group-hover:text-alveus-tan">
        <link.icon size={24} />
      </div>
      <Heading level={2}>{link.title}</Heading>
    </div>
    <p>{link.description}</p>
  </Link>
);

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
          {Object.entries(links).map(([key, link]) => (
            <DonateItem key={key} link={link} />
          ))}
        </div>

        <div className="flex basis-full flex-col gap-8 py-4 lg:basis-1/2 lg:px-4">
          {!consent.givingBlock && <DonateItem link={givingBlock} />}

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
