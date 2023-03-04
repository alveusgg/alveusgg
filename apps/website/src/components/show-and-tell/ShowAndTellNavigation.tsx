import type { LinkProps } from "next/link";
import Link from "next/link";
import React, { useMemo } from "react";
import { useIsActivePath } from "../shared/hooks/useIsActivePath";

type NavLinkProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  keyof LinkProps
> &
  LinkProps & {
    children?: React.ReactNode;
    exact?: boolean;
  } & React.RefAttributes<HTMLAnchorElement>;

const navLinkClassesActive = "bg-alveus-tan text-alveus-green";
const navLinkClassesHover = "hover:bg-alveus-tan hover:text-alveus-green";
const navLinkClasses =
  "rounded-full text-center border-2 border-alveus-tan text-base px-2 py-1 md:px-4 md:py-2 md:text-lg transition-colors transition-colors";

const NavLink: React.FC<NavLinkProps> = ({
  href,
  exact = false,
  className,
  ...props
}) => {
  const isActive = useIsActivePath(href, exact);
  const classes = useMemo(
    () =>
      [
        navLinkClasses,
        isActive ? navLinkClassesActive : navLinkClassesHover,
        className,
      ]
        .filter(Boolean)
        .join(" "),
    [isActive, className]
  );

  return <Link href={href} className={classes} {...props} />;
};

export function ShowAndTellNavigation() {
  return (
    <div className="mt-5 -ml-2 flex flex-wrap gap-2 md:mt-0 lg:flex-col">
      <NavLink href="/show-and-tell/" exact>
        Submissions
      </NavLink>
      <NavLink href="/show-and-tell/submit-post">Submit Post</NavLink>
      <NavLink href="/show-and-tell/my-posts">My Posts</NavLink>
    </div>
  );
}
