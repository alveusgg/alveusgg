import { Disclosure, DisclosureButton } from "@headlessui/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { classes } from "@/utils/classes";

import { DesktopMenu } from "@/components/layout/navbar/DesktopMenu";
import { MobileMenu } from "@/components/layout/navbar/MobileMenu";
import { NotificationsButton } from "@/components/notifications/NotificationsButton";

import IconMenu from "@/icons/IconMenu";
import IconX from "@/icons/IconX";

import logoImage from "@/assets/logo.png";

const useAutoHideOnScroll = (disabled: boolean) => {
  const [state, setState] = useState({ hidden: false, scrolled: false });
  const lastY = useRef(0);

  useEffect(() => {
    if (disabled) {
      setState((s) => ({ ...s, hidden: false }));
      return;
    }

    lastY.current = window.scrollY;
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const delta = y - lastY.current;
      if (Math.abs(delta) < 8) return;

      setState({ hidden: y >= 80 && delta > 0, scrolled: y > 0 });
      lastY.current = y;
    };

    const onScroll = () => {
      frame ||= window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [disabled]);

  return state;
};

const MobileMenuToggle = ({ open }: { open: boolean }) => (
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
);

const Logo = () => (
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
);

export const Navbar = () => {
  return (
    <Disclosure as="header" className="sticky top-0 z-50">
      {({ open }) => <NavbarInner open={open} />}
    </Disclosure>
  );
};

const NavbarInner = ({ open }: { open: boolean }) => {
  const { hidden, scrolled } = useAutoHideOnScroll(open);

  return (
    <div
      className={classes(
        "bg-alveus-green-900 text-white transition-transform duration-200 ease-out motion-reduce:transition-none",
        // Desktop pages (e.g. homepage) bleed hero content under the navbar at
        // the top, so the background only kicks in once we're scrolled.
        scrolled || open ? "lg:bg-alveus-green-900" : "lg:bg-transparent",
        hidden ? "-translate-y-full" : "translate-y-0",
      )}
    >
      <h2 className="sr-only">Page header</h2>

      <div className="container mx-auto flex gap-4 p-2">
        <Logo />
        <DesktopMenu />

        <div className="flex grow items-center justify-center text-center lg:hidden">
          <Link href="/" className="font-serif text-3xl font-bold">
            Alveus Sanctuary
          </Link>
        </div>
        <MobileMenuToggle open={open} />
      </div>

      <MobileMenu />
    </div>
  );
};
