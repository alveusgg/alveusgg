import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Disclosure } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

import logoImage from "@/assets/logo.png";
import { MobileMenu } from "@/components/layout/navbar/MobileMenu";
import { DesktopMenu } from "@/components/layout/navbar/DesktopMenu";
import { NotificationsButton } from "@/components/layout/navbar/NotificationsButton";

export const Navbar: React.FC = () => {
  return (
    <Disclosure
      as="header"
      className="relative z-20 bg-alveus-green-900 text-white lg:bg-transparent"
    >
      {({ open }) => (
        <>
          <h2 className="sr-only">Page header</h2>

          <div className="container mx-auto flex gap-4 p-2">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center px-1 md:px-2"
              aria-label="Alveus Sanctuary Inc."
            >
              <Image
                src={logoImage}
                alt=""
                height={120}
                className="h-10 w-auto lg:mt-6 lg:h-28"
              />
            </Link>

            {/* Desktop menu */}
            <DesktopMenu />

            {/* Mobile menu toggle */}
            <div className="flex flex-grow items-center justify-center lg:hidden">
              <Link href="/" className="font-serif text-3xl font-bold">
                Alveus
              </Link>
            </div>
            <div className="flex items-center lg:hidden">
              <NotificationsButton />

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
                <span className="sr-only">
                  {open ? "Close main menu" : "Open main menu"}
                </span>
                {open ? (
                  <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                )}
              </Disclosure.Button>
            </div>
          </div>

          {/* Mobile menu */}
          <MobileMenu />
        </>
      )}
    </Disclosure>
  );
};
