import React from "react";
import Link from "next/link";
import Socials from "./Socials";
import IconGitHub from "../../../icons/IconGitHub";

const footerLinkClasses =
  "underline decoration-gray-600 underline-offset-2 transition-colors hover:text-gray-300";

const credits =
  /* prettier-ignore */ <>
  Original design by
  {" "}
  <Link
    className={footerLinkClasses}
    href="https://chanelrooh.com"
    target="_blank"
  >
    Chanelrooh
  </Link>
  {", "}
  <br/>
  built by the
  {" "}
  <Link
    className={footerLinkClasses}
    href="https://github.com/alveusgg"
    rel="noreferrer"
    target="_blank"
  >
    <IconGitHub
      size={16}
      className="mr-1 inline-block"
    />
    Alveus.gg team
  </Link>
  {" "}
  and community
  {", "}
  <br/>
  supported by the Alveus team.
</>;

export const Footer: React.FC = () => {
  return (
    <>
      <Socials />

      <footer className="bg-gray-800 py-4 px-2 text-gray-500 md:py-2 md:px-0">
        <div className="container mx-auto">
          <ul className="flex flex-wrap items-center justify-between">
            <li className="basis-full p-2 md:basis-1/3">
              <p>{credits}</p>
            </li>
            <li className="basis-full p-2 md:basis-1/3 md:text-center">
              <Link className={footerLinkClasses} href="/privacy-policy">
                Privacy Policy
              </Link>
            </li>
            <li className="basis-full p-2 md:basis-1/3 md:text-right">
              <Link
                className={footerLinkClasses}
                href="https://www.alveussanctuary.org"
                target="_blank"
                rel="noreferrer"
              >
                alveussanctuary.org
              </Link>
            </li>
          </ul>
        </div>
      </footer>
    </>
  );
};
