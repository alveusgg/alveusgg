import React from "react";
import Link from "next/link";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-alveus-gray p-4 text-white">
      <ul className="flex items-center justify-center gap-10">
        <li>
          <Link href="/privacy-policy">Privacy Policy</Link>
        </li>
        <li className="text-gray-400">Made by pjeweb</li>
      </ul>
    </footer>
  );
};
