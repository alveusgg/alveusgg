import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { ProfileInfo } from "./ProfileInfo";
import { useRouter } from "next/router";
import React from "react";
import type { LinkProps } from "next/dist/client/link";
import type { UrlObject } from "url";

import IconNotificationOn from "../icons/IconNotificationOn";
import IconNotificationOff from "../icons/IconNotificationOff";
import IconTwitch from "../icons/IconTwitch";

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
      className={`rounded-2xl px-4 py-2 hover:bg-black/30 focus:bg-black/30 ${
        props.className || ""
      } ${isActive ? "bg-black/20" : ""}`}
    />
  );
};

export const Navbar: React.FC = () => {
  const { data: sessionData } = useSession();

  return (
    <header className="min-h-10 flex w-full items-stretch gap-4 bg-alveus-gray px-2 text-white">
      <Link href="/" className="flex items-center px-4">
        <span>ALVEUS.gg</span>
      </Link>

      <nav className="flex flex-grow p-1 px-4 py-2">
        <ul className="flex flex-grow items-center gap-4">
          <li>
            <NavLink href="/live" className="flex">
              Live
            </NavLink>
          </li>
          <li>
            <NavLink href="/about">About Alveus</NavLink>
          </li>
        </ul>

        <NavLink className="flex gap-2 bg-alveus-green" href="/updates">
          <IconNotificationOn />
          Updates
        </NavLink>
      </nav>

      {sessionData ? (
        <details className="relative open:bg-black/10">
          <summary className="marker-none flex h-full cursor-pointer select-none appearance-none items-center px-4 before:hidden">
            <ProfileInfo />
          </summary>
          <div className="absolute top-full right-0 z-20 -mt-0.5 w-[200px] rounded bg-alveus-gray p-4 shadow-lg">
            <button className="w-full text-left" onClick={() => signOut()}>
              Log out
            </button>
          </div>
        </details>
      ) : (
        <button
          className="rounded-full bg-white/10 px-5 py-2 font-semibold text-white no-underline transition hover:bg-white/20"
          onClick={() => signIn()}
        >
          Sign in
        </button>
      )}
    </header>
  );
};
