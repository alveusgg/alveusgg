import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { useRouter } from "next/router";
import { Fragment } from "react";

import { classes } from "@/utils/classes";

import IconChevronRight from "@/icons/IconChevronRight";
import IconMenu from "@/icons/IconMenu";

import Link from "./Link";

type SubNavProps = {
  links: {
    name: string;
    href: string;
  }[];
  className?: string;
};

const SubNavInner = ({ links, className }: SubNavProps) => {
  const { asPath } = useRouter();

  return (
    <div className={classes("gap-2", className)}>
      {links.map(({ name, href }) => {
        const isActive = asPath === href;
        const isAnchorLink = href.startsWith("#");

        return (
          <Link
            key={name}
            href={href}
            custom
            className={classes(
              "flex items-center gap-1 rounded-full py-1 transition-colors",
              isActive
                ? "bg-alveus-green-800 text-white"
                : "hover:bg-alveus-green-200",
              isAnchorLink ? "px-2" : "px-4",
            )}
          >
            {isAnchorLink ? <IconChevronRight className="size-5" /> : null}
            {name}
          </Link>
        );
      })}
    </div>
  );
};

const SubNav = ({ links, className }: SubNavProps) => (
  <nav
    className={classes(
      "sticky inset-x-0 top-0 bg-alveus-green-100/50 text-xl font-bold shadow-md backdrop-blur-2xl",
      className,
    )}
  >
    <div className="container mx-auto px-2 py-1">
      <SubNavInner
        links={links}
        className="hidden flex-row flex-wrap items-center lg:flex"
      />
      <Disclosure as="div" className="flex flex-row items-start lg:hidden">
        <DisclosurePanel as={Fragment}>
          <SubNavInner links={links} className="flex flex-col" />
        </DisclosurePanel>
        <DisclosureButton className="ml-auto p-1.5">
          <IconMenu />
        </DisclosureButton>
      </Disclosure>
    </div>
  </nav>
);

export default SubNav;
