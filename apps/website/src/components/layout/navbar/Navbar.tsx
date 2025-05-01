import { Disclosure, DisclosureButton } from "@headlessui/react";
import Image from "next/image";
import Link from "next/link";

import { DesktopMenu } from "@/components/layout/navbar/DesktopMenu";
import { MobileMenu } from "@/components/layout/navbar/MobileMenu";
import { NotificationsButton } from "@/components/notifications/NotificationsButton";

import IconMenu from "@/icons/IconMenu";
import IconX from "@/icons/IconX";

import logoImage from "@/assets/logo.png";

export const Navbar = () => {
  return (
    <Disclosure
      as="header"
      className="relative z-50 bg-alveus-green-900 text-white lg:bg-transparent"
    >
      {({ open }) => (
        <>
          <h2 className="sr-only">Page header</h2>

          <div className="container mx-auto flex gap-4 p-2">
            {/* Logo */}
            <Link
              href="/"
              className="flex shrink-0 items-center px-1 lg:-ml-4 lg:px-0"
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
            <div className="flex grow items-center justify-center text-center lg:hidden">
              <Link href="/" className="font-serif text-3xl font-bold">
                Alveus Sanctuary
              </Link>
            </div>
            <div className="flex items-center lg:hidden">
              <NotificationsButton className="rounded-lg p-4" />

              <DisclosureButton className="inline-flex items-center justify-center rounded-md p-2 text-gray-200 hover:bg-gray-900 hover:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden focus:ring-inset">
                <span className="sr-only">
                  {open ? "Close main menu" : "Open main menu"}
                </span>
                {open ? (
                  <IconX className="block size-6" aria-hidden="true" />
                ) : (
                  <IconMenu className="block size-6" aria-hidden="true" />
                )}
              </DisclosureButton>
            </div>
          </div>

          {/* Mobile menu */}
          <MobileMenu />
        </>
      )}
    </Disclosure>
  );
};
