import React, { forwardRef } from "react";
import type { LinkProps } from "next/link";
import Link from "next/link";

import { classes } from "@/utils/classes";

import { useIsActivePath } from "@/components/shared/hooks/useIsActivePath";

type NavLinkProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  keyof LinkProps
> &
  LinkProps & {
    children?: React.ReactNode;
    variant?: "main" | "sub";
    isExternal?: boolean;
  } & React.RefAttributes<HTMLAnchorElement>;

export const navLinkClasses = `block px-5 h-full transition-colors`;
export const navLinkClassesMain = `${navLinkClasses} py-3 border-b-2 border-transparent hover:lg:border-white `;
export const navLinkClassesMainActive = "lg:border-white";
export const navLinkClassesSub = `${navLinkClasses} py-2 hover:bg-alveus-tan/20 rounded`;
export const navLinkClassesSubActive = "bg-alveus-tan/10";

export const NavLink: React.FC<NavLinkProps> = forwardRef(
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

export const NavLinkSub: React.FC<NavLinkProps> = forwardRef((props, ref) => (
  <NavLink variant="sub" {...props} ref={ref} />
));
NavLinkSub.displayName = "NavLinkSub";
