import {
  forwardRef,
  type AnchorHTMLAttributes,
  type RefAttributes,
  type ReactNode,
} from "react";
import type { LinkProps } from "next/link";
import Link from "next/link";

import { classes } from "@/utils/classes";

import useIsActivePath from "@/hooks/active";

type NavLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  keyof LinkProps
> &
  LinkProps & {
    children?: ReactNode;
    variant?: "main" | "sub";
    isExternal?: boolean;
  } & RefAttributes<HTMLAnchorElement>;

export const navLinkClasses = `block px-5 h-full transition-colors`;
export const navLinkClassesMain = `${navLinkClasses} py-3 border-b-2 border-transparent hover:lg:border-white `;
export const navLinkClassesMainActive = "lg:border-white";
export const navLinkClassesSub = `${navLinkClasses} py-2 hover:bg-alveus-tan/20 rounded`;
export const navLinkClassesSubActive = "bg-alveus-tan/10";

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  (
    { href, variant = "main", isExternal = false, className, ...props },
    ref,
  ) => {
    const isActive = useIsActivePath(href);

    return (
      <Link
        href={href}
        className={classes(
          // base classes
          variant === "main" ? navLinkClassesMain : navLinkClassesSub,
          // active classes
          isActive &&
            (variant === "main"
              ? navLinkClassesMainActive
              : navLinkClassesSubActive),
          // custom classes
          className,
        )}
        {...(isExternal
          ? {
              target: "_blank",
              rel: "noreferrer",
            }
          : {})}
        {...props}
        ref={ref}
      />
    );
  },
);
NavLink.displayName = "NavLink";

export const NavLinkSub = forwardRef<HTMLAnchorElement, NavLinkProps>(
  (props, ref) => <NavLink variant="sub" {...props} ref={ref} />,
);
NavLinkSub.displayName = "NavLinkSub";
