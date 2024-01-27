import type { LinkProps } from "next/link";
import Link from "next/link";
import {
  type AnchorHTMLAttributes,
  type RefAttributes,
  type ReactNode,
} from "react";

import { classes } from "@/utils/classes";

import useIsActivePath from "@/hooks/active";

type NavLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  keyof LinkProps
> &
  LinkProps & {
    children?: ReactNode;
    exact?: boolean;
  } & RefAttributes<HTMLAnchorElement>;

const navLinkClassesActive = "bg-alveus-tan text-alveus-green";
const navLinkClassesHover = "hover:bg-alveus-tan hover:text-alveus-green";
const navLinkClasses =
  "rounded-full text-center border-2 border-alveus-tan text-base px-2 py-1 md:px-4 md:py-2 md:text-lg transition-colors transition-colors";

const NavLink = ({
  href,
  exact = false,
  className,
  ...props
}: NavLinkProps) => {
  const isActive = useIsActivePath(href, exact);

  return (
    <Link
      href={href}
      className={classes(
        navLinkClasses,
        isActive ? navLinkClassesActive : navLinkClassesHover,
        className,
      )}
      {...props}
    />
  );
};

type NavItem = {
  href: string;
  label: string;
  exact?: boolean;
};

type NavigationProps = {
  navItems: NavItem[];
};

export function PageNavigation({ navItems }: NavigationProps) {
  return (
    <div className="flex flex-wrap gap-2 whitespace-nowrap lg:flex-col">
      {navItems.map((item) => (
        <NavLink key={item.href} href={item.href} exact={item.exact}>
          {item.label}
        </NavLink>
      ))}
    </div>
  );
}
