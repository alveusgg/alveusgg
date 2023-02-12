import Image from "next/image";
import React, { Fragment, useMemo } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link, { type LinkProps } from "next/link";
import { Disclosure, Popover, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

import { ProfileInfo } from "./ProfileInfo";
import { useIsActivePath } from "../../shared/hooks/useIsActivePath";
import logoImage from "../../../assets/logo.png";
import socials from "../../shared/data/socials"
//import { NotificationsButton } from "./NotificationsButton";

type NavLinkProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  keyof LinkProps
> &
  LinkProps & {
    children?: React.ReactNode;
  } & React.RefAttributes<HTMLAnchorElement>;

const NavLinkClasses = "block px-5 py-3 border-b-2 border-transparent hover:border-white transition-colors";

const NavLink: React.FC<NavLinkProps> = ({ href, className, ...props }) => {
  const isActive = useIsActivePath(href);
  const classes = useMemo(
    () =>
      [NavLinkClasses, isActive && "border-white", className]
        .filter(Boolean)
        .join(" "),
    [isActive, className]
  );

  return <Link href={href} className={classes} {...props} />;
};

export const Navbar: React.FC = () => {
  const { data: sessionData } = useSession();

  return (
    <Disclosure
      as="header"
      className="relative z-10 bg-alveus-green-900 lg:bg-transparent text-white"
    >
      {({ open }) => (
        <>
          <div className="container mx-auto flex gap-4 p-2">
            {/* Logo */}
            <Link href="/" className="flex items-center px-1 md:px-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoImage.src}
                alt=""
                className="h-10 lg:h-28 lg:mt-6"
              />
            </Link>

            {/* Desktop menu */}
            <div className="hidden lg:flex flex-col flex-grow gap-2">
              <div className="flex items-center gap-4">
                <ul className="flex flex-grow items-center justify-end gap-4">
                  {Object.entries(socials).map(([ key, social ]) => (
                    <li key={key}>
                      <a
                        className="block text-white hover:text-alveus-green bg-transparent hover:bg-white transition-colors p-2 rounded-xl"
                        href={social.link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <social.icon size={24} />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center gap-4 pt-2 border-t border-white">
                <Link href="/" className="text-3xl font-serif font-bold">
                  Alveus
                </Link>
                <ul className="flex flex-grow items-center justify-end">
                  <li>
                    <NavLink href="/live">Live</NavLink>
                  </li>
                  <li>
                    <NavLink href="/giveaways">Giveaways</NavLink>
                  </li>
                  {/*
                  <li>
                    <NavLink href="/updates">Updates</NavLink>
                  </li>
                  <li>
                    <NavLink href="/explore">Explore</NavLink>
                  </li>
                  <li>
                    <NavLink href="/schedule">Schedule</NavLink>
                  </li>
                  */}
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
                  {/*<li>*/}
                  {/*  <NotificationsButton />*/}
                  {/*</li>*/}
                  <li>
                    {sessionData ? (
                      <Popover
                        as="div"
                        className="relative"
                      >
                        <Popover.Button
                          as="div"
                          className="mx-5 rounded-full border-2 border-transparent hover:border-white aria-expanded:border-white transition-colors cursor-pointer select-none appearance-none"
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
                          <Popover.Panel className="absolute top-full right-0 z-30 mt-2 flex w-48 flex-col gap-4 rounded bg-gray-700 p-4 shadow-lg">
                            <ProfileInfo full />

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
                        Sign In
                      </button>
                    )}
                  </li>
                </ul>
              </div>
            </div>

            {/* Mobile menu */}
            <div className="flex lg:hidden items-center justify-center flex-grow">
              <Link href="/" className="text-3xl font-serif font-bold">
                Alveus
              </Link>
            </div>
            <div className="flex lg:hidden items-center">
              <Disclosure.Button
                className="
                  inline-flex
                  items-center justify-center rounded-md
                  p-2 text-gray-200
                  hover:bg-gray-900
                  hover:text-white focus:outline-none
                  focus:ring-2 focus:ring-inset focus:ring-blue-500
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
          </div>

          {/* Mobile menu */}
          <Disclosure.Panel>
            <div className="space-y-1 p-2 pb-4">
              <ul className="flex flex-col gap-4">
                <li>
                  <Disclosure.Button
                    as={NavLink}
                    href="/live"
                    className="w-full"
                  >
                    Live
                  </Disclosure.Button>
                </li>
                <li>
                  <Disclosure.Button
                    as={NavLink}
                    href="/giveaways"
                    className="w-full"
                  >
                    Giveaways
                  </Disclosure.Button>
                </li>
                {/*
                <li>
                  <Disclosure.Button as={NavLink} href="/schedule" className"w-full>
                    Schedule
                  </Disclosure.Button>
                </li>
                <li>
                  <Disclosure.Button as={NavLink} href="/explore" className"w-full>
                    Explore
                  </Disclosure.Button>
                </li>
                */}
                <li>
                  <Disclosure.Button
                    as={NavLink}
                    rel="noopener noreferrer"
                    target="_blank"
                    href="https://www.alveussanctuary.org/donate/"
                    className="w-full"
                  >
                    Donate
                  </Disclosure.Button>
                </li>
                <li>
                  <Disclosure.Button
                    as={NavLink}
                    rel="noopener noreferrer"
                    target="_blank"
                    href="https://www.alveussanctuary.org/merch-store/"
                    className="w-full"
                  >
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
