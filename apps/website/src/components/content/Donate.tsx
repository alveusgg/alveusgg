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
import IconDollar from "@/icons/IconDollar";
import IconEnvelope from "@/icons/IconEnvelope";
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
  twitch: {
    icon: IconTwitch,
    title: "Twitch Charity",
    link: "/donate/twitch",
    external: true,
    description: "Donate to Alveus on Twitch.tv via PayPal's Giving Fund.",
  },
  wishlist: {
    icon: IconAmazon,
    title: "Amazon Wishlist",
    link: "/amazon",
    external: true,
    description:
      "Donate specific items we are in need of at Alveus through our Amazon wishlist.",
  },
  poBox: {
    icon: IconBox,
    title: "PO Box",
    link: "/wishlist#po-box",
    external: false,
    description:
      "Send something to our PO Box. Perhaps a snack for our staff or ambassador enrichment?",
  },
  givingBlock: {
    icon: IconBitcoin,
    title: "The Giving Block",
    link: "/donate/giving-block",
    external: true,
    description: "Donate cryptocurrency to Alveus using The Giving Block.",
  },
  direct: {
    icon: IconDollar,
    title: "Donate Directly",
    link: "/donate/direct",
    external: true,
    description:
      "Make a one-time donation to Alveus, or set up a recurring donation for ongoing support.",
  },
  grants: {
    icon: IconEnvelope,
    title: "Foundation & Corporate Grants",
    link: "/donate/grants",
    external: false,
    description:
      "Learn about our funding priorities and how your foundation or corporation can support Alveus.",
  },
} as const satisfies Record<string, DonateLink>;

export const types = typeSafeObjectKeys(links);
export type Type = keyof typeof links;

const Donate = ({
  type,
  highlight = false,
  dark = true,
  ...overrides
}: {
  type: Type;
  highlight?: boolean;
  dark?: boolean;
} & Partial<DonateLink>) => {
  const link = { ...links[type], ...overrides };

  return (
    <Box
      dark={dark}
      className={classes(
        "group flex flex-col p-0 transition hover:scale-102 hover:shadow-2xl motion-reduce:transition-none motion-reduce:hover:scale-100",
        highlight && "bg-carnival",
      )}
    >
      <Link
        href={link.link}
        external={link.external}
        custom
        className={classes(
          "block grow rounded-xl p-4 focus-visible:outline-2 focus-visible:-outline-offset-4",
          dark
            ? "focus-visible:outline-alveus-tan"
            : "focus-visible:outline-alveus-green",
        )}
      >
        <div className="mb-2 flex items-center gap-4">
          <div
            className={classes(
              "relative block overflow-clip rounded-xl border-2 p-2 transition-colors",
              !dark
                ? "border-alveus-green bg-alveus-green text-alveus-tan group-hover:bg-alveus-tan group-hover:text-alveus-green"
                : highlight
                  ? "border-alveus-tan bg-alveus-tan text-carnival group-hover:bg-carnival group-hover:text-alveus-tan"
                  : "border-alveus-tan bg-alveus-tan text-alveus-green group-hover:bg-alveus-green group-hover:text-alveus-tan",
            )}
          >
            <link.icon
              size={24}
              className="transition-opacity group-hover:opacity-0"
            />
            <IconArrowUp className="absolute inset-2 -translate-x-full translate-y-full rotate-45 opacity-0 transition group-hover:translate-0 group-hover:opacity-100" />
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
