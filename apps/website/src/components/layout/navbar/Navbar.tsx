import Image from "next/image";
import React, { Fragment, useMemo } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link, { type LinkProps } from "next/link";
import { Disclosure, Popover, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

import { ProfileInfo } from "./ProfileInfo";
import { useIsActivePath } from "../../shared/hooks/useIsActivePath";
//import { NotificationsButton } from "./NotificationsButton";

type NavLinkProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  keyof LinkProps
> &
  LinkProps & {
    children?: React.ReactNode;
  } & React.RefAttributes<HTMLAnchorElement>;
const NavLinkClasses = "rounded-2xl px-4 py-2 hover:bg-black/30 focus:bg-black/30";
const NavLink: React.FC<NavLinkProps> = ({ href, className, ...props}) => {
  const isActive = useIsActivePath(href);
  const classes = useMemo(() => [NavLinkClasses, isActive && "bg-black/20", className].filter(Boolean).join(" "),
    [ isActive, className ]);

  return (
    <Link
      href={href}
      className={classes}
      {...props}
    />
  );
};

export const Navbar: React.FC = () => {
  const { data: sessionData } = useSession();

  return (
    <Disclosure
      as="header"
      className="relative bg-gray-800 text-white shadow-md z-10"
    >
      {({ open }) => (
        <>
          <div className="flex min-h-[50px] w-full items-center gap-4 px-2">
            <div className="left-0 flex items-center">
              {/* Mobile menu button */}
              <Disclosure.Button
                className="
                  inline-flex
                  items-center justify-center rounded-md
                  p-2 text-gray-200
                  hover:bg-gray-900
                  hover:text-white focus:outline-none
                  focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden
                  "
              >
                <span className="sr-only">Open main menu</span>
                {open ? (
                  <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                )}
              </Disclosure.Button>
            </div>

            <Link href="/" className="flex items-center px-1 md:px-2">
              <Image
                src="/icon.png"
                width="40"
                height="40"
                className="overflow-hidden rounded"
                alt="Alveus.gg"
              />
            </Link>

            <div className="hidden flex-grow md:flex">
              <ul className="flex gap-1 lg:gap-4">
                <li>
                  <NavLink href="/giveaways">Giveaways</NavLink>
                </li>
                {/*
                <li>
                  <NavLink href="/updates">Updates</NavLink>
                </li>
                <li>
                  <NavLink href="/live">Live</NavLink>
                </li>
                <li>
                  <NavLink href="/explore">Explore</NavLink>
                </li>
                <li>
                  <NavLink href="/schedule">Schedule</NavLink>
                </li>
                */}
              </ul>
              <div className="flex-grow" />
              <ul className="flex gap-1 lg:gap-4">
                <li>
                  <NavLink
                    rel="noopener noreferrer"
                    target="_blank"
                    href="https://www.alveussanctuary.org/donate/"
                  >
                    Donate
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    rel="noopener noreferrer"
                    target="_blank"
                    href="https://www.alveussanctuary.org/merch-store/"
                  >
                    Merch
                  </NavLink>
                </li>
              </ul>
            </div>

            <div className="flex-grow md:hidden" />

            {/*  <NotificationsButton /> */}

            {sessionData ? (
              <Popover
                as="div"
                className="relative self-stretch open:bg-black/10 hover:bg-black/20"
              >
                <Popover.Button
                  as="div"
                  className="flex h-full cursor-pointer select-none appearance-none items-center self-stretch px-2 before:hidden"
                >
                  <span className="sr-only">Open user menu</span>
                  <ProfileInfo />
                </Popover.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Popover.Panel className="absolute top-full right-0 z-30 -mt-0.5 flex w-[200px] flex-col gap-4 rounded bg-gray-700 p-4 shadow-lg">
                    <ProfileInfo full={true} />

                    <div className="border-t"></div>

                    <button
                      className="w-full text-left"
                      onClick={() => signOut()}
                    >
                      Log out
                    </button>
                  </Popover.Panel>
                </Transition>
              </Popover>
            ) : (
              <button
                className={`${NavLinkClasses} font-semibold`}
                type="button"
                onClick={() => signIn("twitch")}
              >
                Log in
              </button>
            )}
          </div>

          <Disclosure.Panel>
            <div className="space-y-1 pt-2 pb-4">
              <ul className="flex flex-col gap-4">
                <li>
                  <Disclosure.Button as={NavLink} href="/giveaways">
                    Giveaways
                  </Disclosure.Button>
                </li>
                {/*
                <li>
                  <Disclosure.Button as={NavLink} href="/live">
                    Live
                  </Disclosure.Button>
                </li>
                <li>
                  <Disclosure.Button as={NavLink} href="/schedule">
                    Schedule
                  </Disclosure.Button>
                </li>
                <li>
                  <Disclosure.Button as={NavLink} href="/explore">
                    Explore
                  </Disclosure.Button>
                </li>
                */}
                <li>
                  <Disclosure.Button as={NavLink} href="/explore">
                    Donate
                  </Disclosure.Button>
                </li>
                <li>
                  <Disclosure.Button as={NavLink} href="/explore">
                    Merch
                  </Disclosure.Button>
                </li>
              </ul>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};
