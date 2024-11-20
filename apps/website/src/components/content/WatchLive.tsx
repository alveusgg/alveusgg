import { Fragment } from "react";
import Link from "next/link";
import {
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
  Transition,
} from "@headlessui/react";

import IconChevronDown from "@/icons/IconChevronDown";

import Button from "./Button";

const defaultLink = {
  href: "/live",
  platform: "Twitch",
};

const dropdownLinks = [
  {
    href: "/live/twitch",
    platform: "Twitch",
  },
  {
    href: "/live/youtube",
    platform: "YouTube",
  },
];

const WatchLive = () => (
  <Button as="div" dark className="group/link p-0">
    <Link
      className="whitespace-pre-wrap py-2 pl-4"
      href={defaultLink.href}
      target="_blank"
      rel="noreferrer"
    >
      Watch Live on{" "}
    </Link>

    <Menu as="span" className="relative">
      <MenuButton className="group/button inline-flex items-center gap-0.5 py-2 pr-4">
        <span className="relative">
          {defaultLink.platform}

          <span className="absolute inset-x-0 bottom-0 block h-0.5 max-w-0 bg-alveus-green transition-all group-hover/button:max-w-full group-data-[active]/button:max-w-full group-data-[active]/button:bg-alveus-tan group-data-[active]/button:group-hover/link:bg-alveus-green" />
        </span>

        <IconChevronDown
          size={16}
          className="translate-y-0.5 transition-transform group-data-[active]/button:translate-y-1"
        />
      </MenuButton>

      <MenuItems
        transition
        className="group/items absolute left-0 top-full z-30 -ml-4 mt-1.5 flex flex-col rounded bg-alveus-tan text-alveus-green shadow-lg outline outline-1 outline-black/20 transition ease-in-out data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75"
        as="ul"
        modal={false}
      >
        {dropdownLinks.map((link) => (
          <MenuItem key={link.href} as="li" className="group/item">
            <a
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="block rounded px-4 py-1 transition-colors hover:bg-alveus-green hover:text-alveus-tan group-data-[focus]/item:outline-blue-500 group-data-[focus]/item:group-focus-visible/items:outline"
            >
              {link.platform}
            </a>
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  </Button>
);

export default WatchLive;
