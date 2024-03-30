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

export function ShowAndTellNavigation() {
  return (
    <div className="flex flex-wrap gap-2 whitespace-nowrap lg:flex-col">
      <NavLink href="/show-and-tell/" exact>
        All Posts
      </NavLink>
      <NavLink href="/show-and-tell/my-posts">My Posts</NavLink>
      <NavLink href="/show-and-tell/submit-post">Submit Post</NavLink>
    </div>
  );
}
