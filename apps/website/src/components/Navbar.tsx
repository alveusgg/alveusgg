import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { Fragment } from "react";
import type { LinkProps } from "next/dist/client/link";
import type { UrlObject } from "url";
import { Disclosure, Popover, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

import IconNotificationOn from "../icons/IconNotificationOn";
import IconNotificationOff from "../icons/IconNotificationOff";
import IconTwitch from "../icons/IconTwitch";

import { ProfileInfo } from "./ProfileInfo";
import { NotificationSettings } from "./navbar/NotificationSettings";

function useIsActivePath(href: UrlObject | string) {
  const router = useRouter();
  const currentRoute = router.pathname;
  const url = typeof href === "string" ? href : href.href;
  return (
    url &&
    (url.startsWith("#") ||
      (url.startsWith("/") &&
        currentRoute.replace(/\/?$/, "/").startsWith(url.replace(/\/?$/, "/"))))
  );
}

type NavLinkProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  keyof LinkProps
> &
  LinkProps & {
    children?: React.ReactNode;
  } & React.RefAttributes<HTMLAnchorElement>;
const NavLink: React.FC<NavLinkProps> = (props) => {
  const isActive = useIsActivePath(props.href);

  return (
    <Link
      {...props}
      className={`rounded-2xl px-4 py-2 hover:bg-black/30 focus:bg-black/30 ${
        props.className || ""
      } ${isActive ? "bg-black/20" : ""}`}
    />
  );
};

export const Navbar: React.FC = () => {
  const { data: sessionData } = useSession();

  return (
    <Disclosure
      as="header"
      className="relative bg-gray-800 text-white shadow-md"
    >
      {({ open }) => (
        <>
          <div className="flex min-h-[50px] w-full items-center gap-4 px-2">
            <div className="left-0 flex items-center">
              {/* Mobile menu button */}
              <Disclosure.Button
                className="
                  inline-flex items-center justify-center
                  rounded-md p-2
                  text-gray-200
                  hover:bg-gray-900 hover:text-white
                  focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500
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
              <span>ALVEUS.gg</span>
            </Link>

            <div className="flex-grow" />

            <Popover
              as="div"
              className="relative flex items-center self-stretch"
            >
              <Popover.Button className="flex gap-2 rounded-lg bg-alveus-green/50 p-2">
                <IconNotificationOn />
                <span className="hidden md:block">Notifications</span>
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
                <Popover.Panel className="absolute top-full right-0 z-30 -mt-0.5 flex w-[320px] max-w-[calc(80vw-50px)] flex-col gap-4 rounded bg-gray-700 p-4 shadow-lg">
                  <NotificationSettings />
                </Popover.Panel>
              </Transition>
            </Popover>

            {sessionData ? (
              <Popover
                as="div"
                className="relative self-stretch open:bg-black/10 hover:bg-black/20"
              >
                <Popover.Button
                  as="div"
                  className="flex h-full cursor-pointer select-none appearance-none items-center self-stretch px-4 before:hidden"
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
                className="px-5 font-semibold text-white no-underline transition hover:bg-black/20"
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
                  <Disclosure.Button as={NavLink} href="/live">
                    Live
                  </Disclosure.Button>
                </li>
                <li>
                  <Disclosure.Button as={NavLink} href="/about">
                    About Alveus
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
