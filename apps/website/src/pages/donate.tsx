import { type NextPage } from "next";
import Link from "next/link";
import React from "react";

import { useConsent } from "@/hooks/consent";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Consent from "@/components/Consent";

import IconAmazon from "@/icons/IconAmazon";
import IconPayPal from "@/icons/IconPayPal";
import IconBox from "@/icons/IconBox";
import IconBitcoin from "@/icons/IconBitcoin";
import { type IconProps } from "@/icons/BaseIcon";

type DonateLink = {
  icon: React.ComponentType<IconProps>;
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
      "Donate specific items we are in need of at Alveus through our Amazon Wishlist.",
  },
  paypal: {
    icon: IconPayPal,
    title: "PayPal",
    link: "/paypal",
    external: true,
    description:
      "Donate via credit/debit card, bank account or PayPal funds directly to Alveus.",
  },
  poBox: {
    icon: IconBox,
    title: "PO Box",
    link: "/po-box",
    external: false,
    description:
      "Send something to Alveus via our PO Box. Perhaps a gift to support the ambassadors?",
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

const DonateItem: React.FC<{ link: DonateLink }> = ({ link }) => (
  <Link
    href={link.link}
    {...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}
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
        <p>
          Help Alveus carry on its mission to inspire online audiences to engage
          in conservation efforts while providing high-quality animal care to
          our ambassadors.
        </p>
      </Section>

      {/* Grow the last section to cover the page */}
      <Section className="flex-grow" containerClassName="flex flex-wrap">
        <div className="flex basis-full flex-col gap-8 py-4 md:basis-1/2 md:px-4">
          {Object.entries(links).map(([key, link]) => (
            <DonateItem key={key} link={link} />
          ))}
        </div>

        <div className="flex basis-full flex-col gap-8 py-4 md:basis-1/2 md:px-4">
          {!consent.givingBlock && <DonateItem link={givingBlock} />}

          <Consent item="donation widget" consent="givingBlock">
            <iframe
              src="https://tgbwidget.com/?charityID=861772907"
              width="100%"
              height="604px"
              frameBorder="0"
            />
          </Consent>
        </div>
      </Section>
    </>
  );
};

export default DonatePage;
