import { Menu, Transition } from "@headlessui/react";
import Link from "next/link";
import { Fragment } from "react";

import IconChevronDown from "@/icons/IconChevronDown";
import { classes } from "@/utils/classes";

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
      {({ open }) => (
        <>
          <Menu.Button className="group/button inline-flex items-center gap-0.5 py-2 pr-4">
            <span className="relative">
              {defaultLink.platform}

              <span
                className={classes(
                  "absolute inset-x-0 bottom-0 block h-0.5 transition-all",
                  open
                    ? "max-w-full bg-alveus-tan group-hover/link:bg-alveus-green"
                    : "max-w-0 bg-alveus-green group-hover/button:max-w-full",
                )}
              />
            </span>

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
              className="group/items absolute left-0 top-full z-30 -ml-4 mt-1.5 flex flex-col rounded  bg-alveus-tan text-alveus-green shadow-lg outline outline-1 outline-black/20"
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
                          "outline-blue-500 group-focus-visible/items:outline",
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
  </Button>
);

export default WatchLive;
