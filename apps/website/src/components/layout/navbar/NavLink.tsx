import React, { useMemo } from "react";
import type { LinkProps } from "next/link";
import Link from "next/link";
import { useIsActivePath } from "@/components/shared/hooks/useIsActivePath";

type NavLinkProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  keyof LinkProps
> &
  LinkProps & {
    children?: React.ReactNode;
    variant?: "main" | "sub";
  } & React.RefAttributes<HTMLAnchorElement>;

export const navLinkClasses = `block px-5 h-full transition-colors`;
export const navLinkClassesMain = `${navLinkClasses} py-3 border-b-2 border-transparent hover:lg:border-white `;
export const navLinkClassesMainActive = "lg:border-white";
export const navLinkClassesSub = `${navLinkClasses} py-2 hover:bg-alveus-tan/20 rounded`;
export const navLinkClassesSubActive = "bg-alveus-tan/10";

export const NavLink: React.FC<NavLinkProps> = ({
  href,
  variant = "main",
  className,
  ...props
}) => {
  const isActive = useIsActivePath(href);
  const classes = useMemo(
    () =>
      [
        // base classes
        variant === "main" ? navLinkClassesMain : navLinkClassesSub,
        // active classes
        isActive &&
          (variant === "main"
            ? navLinkClassesMainActive
            : navLinkClassesSubActive),
        // custom classes
        className,
      ]
        .filter(Boolean)
        .join(" "),
    [variant, isActive, className]
  );

  return <Link href={href} className={classes} {...props} />;
};

export const NavLinkSub: React.FC<NavLinkProps> = (props) => (
  <NavLink variant="sub" {...props} />
);
