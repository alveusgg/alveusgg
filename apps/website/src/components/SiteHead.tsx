import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

export const SiteHead: React.FC = () => {
  const { data: sessionData } = useSession();

  return (
    <header className="min-h-10 flex w-full items-center gap-4 bg-gray-800 p-1 text-white">
      <h1 className="text-bold">ALVEUS.gg</h1>
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
      <button
        className="rounded-full bg-white/10 px-5 py-2 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => signOut() : () => signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </header>
  );
};
