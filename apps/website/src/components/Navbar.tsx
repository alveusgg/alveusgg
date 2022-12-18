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
      <Link href="/" className="flex items-center px-2 md:px-4">
        <span>ALVEUS.gg</span>
      </Link>

      <nav className="flex flex-grow px-1 py-2 md:px-2">
        <ul className="flex flex-grow items-center gap-4">
          <li>
            <NavLink href="/live" className="flex">
              Live
            </NavLink>
          </li>
          <li className="hidden md:block">
            <NavLink href="/about">About Alveus</NavLink>
          </li>
        </ul>

        <NavLink className="flex gap-2 bg-alveus-green" href="/updates">
          <IconNotificationOn />
          <span className="hidden md:block">Updates</span>
        </NavLink>
      </nav>

      {sessionData ? (
        <details className="relative open:bg-black/10 hover:bg-black/20">
          <summary className="marker-none flex h-full cursor-pointer select-none appearance-none items-center px-4 before:hidden">
            <ProfileInfo />
          </summary>
          <div className="absolute top-full right-0 z-20 -mt-0.5 flex w-[200px] flex-col gap-4 rounded bg-alveus-gray p-4 shadow-lg">
            <ProfileInfo full={true} />

            <button className="w-full text-left" onClick={() => signOut()}>
              Log out
            </button>
          </div>
        </details>
      ) : (
        <button
          className="px-5 font-semibold text-white no-underline transition hover:bg-black/20"
          onClick={() => signIn()}
        >
          Sign in
        </button>
      )}
    </header>
  );
};
