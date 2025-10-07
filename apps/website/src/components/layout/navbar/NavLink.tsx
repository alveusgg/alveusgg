import type { LinkProps } from "next/link";
import Link from "next/link";
import { type AnchorHTMLAttributes, type ReactNode, type Ref } from "react";

import { classes } from "@/utils/classes";

type NavLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  keyof LinkProps
> &
  LinkProps & {
    children?: ReactNode;
    variant?: "main" | "sub";
    active?: boolean;
    external?: boolean;
    ref?: Ref<HTMLAnchorElement>;
  };

export const navLinkClasses = `block px-5 h-full transition-colors`;
export const navLinkClassesMain = `${navLinkClasses} py-3 border-b-2 border-transparent hover:lg:border-white `;
export const navLinkClassesMainActive = "lg:border-white";
export const navLinkClassesSub = `${navLinkClasses} py-2 hover:bg-alveus-tan/20 rounded-sm`;
export const navLinkClassesSubActive = "bg-alveus-tan/10";

export const NavLink = ({
  href,
  variant = "main",
  active = false,
  external = false,
  className,
  ref,
  ...props
}: NavLinkProps) => (
  <Link
    href={href}
    className={classes(
      // base classes
      variant === "main" ? navLinkClassesMain : navLinkClassesSub,
      // active classes
      active &&
        (variant === "main"
          ? navLinkClassesMainActive
          : navLinkClassesSubActive),
      // custom classes
      className,
    )}
    {...(external
      ? {
          target: "_blank",
          rel: "noreferrer",
        }
      : {})}
    {...props}
    ref={ref}
  />
);

export const NavLinkSub = (props: NavLinkProps) => (
  <NavLink variant="sub" {...props} />
);
