import React from "react";
import Link from "next/link";
import { env } from "../env/client.mjs";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 px-4 py-6 text-gray-200">
      <ul className="flex items-center justify-center gap-10">
        {/*<li>
          <Link href="/terms-of-service">Terms of Service</Link>
        </li>*/}
        <li>
          <Link href="/privacy-policy">
            Imprint, Contact and Privacy Policy
          </Link>
        </li>
        <li className="text-gray-500">
          Made by pjeweb, not affiliated with Alveus Sanctuary Inc.
        </li>

        {env.NEXT_PUBLIC_COOKIEBOT_ID && (
          <script
            id="CookieDeclaration"
            src={`https://consent.cookiebot.com/${env.NEXT_PUBLIC_COOKIEBOT_ID}/cd.js`}
            async
          />
        )}
      </ul>
    </footer>
  );
};
