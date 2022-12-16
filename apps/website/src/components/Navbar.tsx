import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { ProfileInfo } from "./ProfileInfo";

export const Navbar: React.FC = () => {
  const { data: sessionData } = useSession();

  return (
    <header className="min-h-10 flex w-full items-center gap-4 bg-alveus-gray p-1 px-4 py-2 text-white">
      <Link href="/">ALVEUS.gg</Link>
      <nav className="contents">
        <ul className="flex flex-grow items-center gap-4">
          <li>
            <Link href="/live">Live</Link>
          </li>
          <li>
            <Link href="/about">About</Link>
          </li>
          <li>
            <Link href="/updates">Updates</Link>
          </li>
        </ul>
      </nav>
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
