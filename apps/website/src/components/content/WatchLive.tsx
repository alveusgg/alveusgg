import { Fragment } from "react";
import Link from "next/link";
import { Menu, Transition } from "@headlessui/react";

import IconChevronDown from "@/icons/IconChevronDown";
import { classes } from "@/utils/classes";

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
  <Link
    className="group inline-block rounded-full border-2 border-white px-4 py-2 text-lg transition-colors hover:border-alveus-tan hover:bg-alveus-tan hover:text-alveus-green"
    href={defaultLink.href}
    target="_blank"
    rel="noreferrer"
  >
    Watch Live on{" "}
    <Menu as="span" className="relative">
      {({ open }) => (
        <>
          <Menu.Button className="inline-flex items-center gap-0.5">
            {defaultLink.platform}
            <IconChevronDown
              size={16}
              className={classes(
                "transition-transform",
                open ? "translate-y-1" : "translate-y-0.5",
              )}
            />
          </Menu.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items
              as="ul"
              className="group absolute left-0 top-full z-30 -ml-4 mt-1 flex flex-col rounded  bg-alveus-tan text-alveus-green shadow-lg outline outline-1 outline-black/20"
            >
              {dropdownLinks.map((link) => (
                <Menu.Item key={link.href} as="li">
                  {({ active }) => (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className={classes(
                        "block rounded px-4 py-1 transition-colors hover:bg-alveus-green  hover:text-alveus-tan",
                        active &&
                          "outline-blue-500 group-focus-visible:outline",
                      )}
                    >
                      {link.platform}
                    </a>
                  )}
                </Menu.Item>
              ))}
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  </Link>
);

export default WatchLive;
