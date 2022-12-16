import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { ProfileInfo } from "./ProfileInfo";
import { useRouter } from "next/router";
import React from "react";
import type { LinkProps } from "next/dist/client/link";
import type { UrlObject } from "url";

import IconNotificationOn from "../icons/IconNotificationOn";
import IconNotificationOff from "../icons/IconNotificationOff";

function useIsActivePath(href: UrlObject | string) {
  const router = useRouter();
  const currentRoute = router.pathname;
  const url = typeof href === "string" ? href : href.href;
  return (
    url &&
    (url.startsWith("#") ||
      (url.startsWith("/") &&
        currentRoute.replace(/\/?$/, "/").startsWith(url.replace(/\/?$/, "/"))))
  );
}

type NavLinkProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  keyof LinkProps
> &
  LinkProps & {
    children?: React.ReactNode;
  } & React.RefAttributes<HTMLAnchorElement>;
const NavLink: React.FC<NavLinkProps> = (props) => {
  const isActive = useIsActivePath(props.href);

  return (
    <Link
      {...props}
      className={`${isActive ? "bg-black/20" : ""} rounded-2xl px-4 py-2 ${
        props.className || ""
      }`}
    />
  );
};

export const Navbar: React.FC = () => {
  const { data: sessionData } = useSession();

  return (
    <header className="min-h-10 flex w-full items-center gap-4 bg-alveus-gray p-1 px-4 py-2 text-white">
      <Link href="/">ALVEUS.gg</Link>
      <nav className="contents">
        <ul className="flex flex-grow items-center gap-4">
          <li>
            <NavLink href="/live">Live</NavLink>
          </li>
          <li>
            <NavLink href="/about">About</NavLink>
          </li>
          <li>
            <NavLink href="/updates">Updates</NavLink>
          </li>
        </ul>
      </nav>

      <Link href="/updates">
        <IconNotificationOn />
      </Link>

      {sessionData ? (
        <ProfileInfo />
      ) : (
        <button
          className="rounded-full bg-white/10 px-5 py-2 font-semibold text-white no-underline transition hover:bg-white/20"
          onClick={sessionData ? () => signOut() : () => signIn()}
        >
          Sign in
        </button>
      )}
    </header>
  );
};
