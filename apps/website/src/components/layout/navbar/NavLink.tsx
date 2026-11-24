import type { LinkProps } from "next/link";
import Link from "next/link";
import { type AnchorHTMLAttributes, type ReactNode, type Ref } from "react";

import { classes } from "@/utils/classes";

import IconExternal from "@/icons/IconExternal";

import { type NavColor, navColors } from "./colors";

type NavLinkStyle = {
  variant?: "main" | "sub";
  color?: NavColor;
  active?: boolean;
};

type NavLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  keyof LinkProps
> &
  LinkProps &
  NavLinkStyle & {
    children?: ReactNode;
    external?: boolean;
    ref?: Ref<HTMLAnchorElement>;
  };

const variantClasses = {
  main: "flex h-10 items-center rounded-full px-4",
  sub: "block rounded-lg px-3 py-2 -outline-offset-2 data-focus:not-hover:outline-2",
};

export const navLinkClasses = ({
  variant = "main",
  color = "green",
  active = false,
}: NavLinkStyle = {}) =>
  classes(
    "transition-colors",
    variantClasses[variant],
    navColors[color][variant],
    active && navColors[color].active[variant],
  );

export const navLinkClassesSub = navLinkClasses({ variant: "sub" });

export const NavLink = ({
  href,
  variant,
  color,
  active = false,
  external = false,
  children,
  className,
  ref,
  ...props
}: NavLinkProps) => (
  <Link
    href={href}
    className={classes(
      navLinkClasses({ variant, color, active }),
      // Push the external icon to the right edge
      variant === "sub" && external && "flex items-center gap-2",
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
  >
    {children}
    {variant === "sub" && external && (
      <IconExternal
        size="0.75em"
        aria-hidden="true"
        className="ml-auto shrink-0"
      />
    )}
  </Link>
);

export const NavLinkSub = (props: NavLinkProps) => (
  <NavLink variant="sub" {...props} />
);
