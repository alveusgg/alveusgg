import { type ComponentType } from "react";

import { typeSafeObjectKeys } from "@/utils/helpers";

import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";

import { type IconProps } from "@/icons/BaseIcon";
import IconAmazon from "@/icons/IconAmazon";
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
  givingBlock: {
    icon: IconBitcoin,
    title: "The Giving Block",
    link: "/giving-block",
    external: true,
    description:
      "Donate cryptocurrency, stocks or via card to Alveus using The Giving Block.",
  },
} as const satisfies Record<string, DonateLink>;

export const types = typeSafeObjectKeys(links);
export type Type = keyof typeof links;

const Donate = ({ type }: { type: Type }) => {
  const link = links[type];

  return (
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
};

export default Donate;
