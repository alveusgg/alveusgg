import { type ComponentType } from "react";

import { classes } from "@/utils/classes";
import { typeSafeObjectKeys } from "@/utils/helpers";

import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";

import { type IconProps } from "@/icons/BaseIcon";
import IconAmazon from "@/icons/IconAmazon";
import IconArrowUp from "@/icons/IconArrowUp";
import IconBitcoin from "@/icons/IconBitcoin";
import IconBox from "@/icons/IconBox";
import IconPayPal from "@/icons/IconPayPal";
import IconTwitch from "@/icons/IconTwitch";

import Box from "./Box";

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

const Donate = ({
  type,
  highlight = false,
  ...overrides
}: { type: Type; highlight?: boolean } & Partial<DonateLink>) => {
  const link = { ...links[type], ...overrides };

  return (
    <Box
      dark
      className={classes(
        "group p-0 transition hover:scale-102 hover:shadow-2xl",
        highlight && "bg-carnival",
      )}
    >
      <Link
        href={link.link}
        external={link.external}
        custom
        className="block p-4"
      >
        <div className="mb-2 flex items-center gap-4">
          <div
            className={classes(
              "relative block overflow-clip rounded-xl border-2 border-alveus-tan bg-alveus-tan p-2 transition-colors",
              highlight
                ? "text-carnival group-hover:bg-carnival group-hover:text-alveus-tan"
                : "text-alveus-green group-hover:bg-alveus-green group-hover:text-alveus-tan",
            )}
          >
            <link.icon
              size={24}
              className="transition-opacity group-hover:opacity-0"
            />
            <IconArrowUp className="absolute inset-2 -translate-x-full translate-y-full rotate-45 opacity-0 transition group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
          </div>
          <Heading level={2} className="my-0">
            {link.title}
          </Heading>
        </div>
        <p>{link.description}</p>
      </Link>
    </Box>
  );
};

export default Donate;
