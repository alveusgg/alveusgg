import React from "react";
import Link from "next/link";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 px-4 py-6 text-gray-200">
      <ul className="flex items-center justify-center gap-10">
        <li>
          <Link href="/privacy-policy">Contact and Privacy Policy</Link>
        </li>
        <li className="text-gray-500">
          Made by pjeweb, not affiliated with Alveus Sanctuary Inc.
        </li>
      </ul>
    </footer>
  );
};
