import React, { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

import Image from "next/image";
import IconGitHub from "@/icons/IconGitHub";
import ContentLink from "@/components/content/Link";
import imageGuidestarSeal from "@/assets/guidestar-candid-gold-seal.svg";
import Socials from "./Socials";

const footerLinkClasses =
  "underline decoration-gray-600 underline-offset-2 transition-colors hover:text-gray-300";

export const Footer: React.FC = () => {
  const router = useRouter();
  const isAdmin = useMemo(
    () => router.pathname === "/admin" || router.pathname.startsWith("/admin/"),
    [router.pathname]
  );

  return (
    <>
      {!isAdmin && <Socials />}

      <footer className="bg-gray-800 px-2 py-4 text-gray-400 md:px-0 md:py-2">
        <h3 className="sr-only">Page footer</h3>

        <div className="container mx-auto mb-4 flex flex-row-reverse gap-4 border-b border-gray-700 px-2 py-4 text-xs md:gap-10 md:text-sm lg:text-base">
          <div>
            <h4 className="sr-only" id="seal">
              Gold rated transparency
            </h4>

            <p>
              Alveus&apos; transparency has been rated gold on Candid
              (GuideStar). Candid is a leading source of information on
              non-profit organizations, helping donors and funders make informed
              decisions about their support. Check out our updated{" "}
              <ContentLink
                external
                href="https://www.guidestar.org/profile/86-1772907"
              >
                non-profit profile on Candid
              </ContentLink>
              .
            </p>
          </div>

          <Link
            className="flex-shrink-0"
            rel="noreferrer"
            target="_blank"
            href="https://www.guidestar.org/profile/86-1772907"
          >
            <Image
              className="h-20 w-20"
              src={imageGuidestarSeal}
              width={100}
              height={100}
              alt="Gold Transparency Seal 2023 by Candid"
            />
          </Link>
        </div>

        <div className="container mx-auto">
          <ul className="flex flex-wrap items-center justify-between">
            <li className="basis-full p-2 md:basis-1/3">
              <p>
                Original design by{" "}
                <Link
                  className={footerLinkClasses}
                  href="https://chanelrooh.com"
                  target="_blank"
                >
                  Chanelrooh
                </Link>
                {", "}
                <br />
                built by the{" "}
                <Link
                  className={footerLinkClasses}
                  href="https://github.com/alveusgg"
                  rel="noreferrer"
                  target="_blank"
                >
                  <IconGitHub size={16} className="mr-1 inline-block" />
                  Alveus.gg team
                </Link>{" "}
                and community
                {", "}
                <br />
                supported by the Alveus team.
              </p>
            </li>
            <li className="basis-full p-2 md:basis-1/3 md:text-center">
              <ul className="flex flex-col gap-1 md:items-center">
                <li>
                  <Link className={footerLinkClasses} href="/contact-us">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link className={footerLinkClasses} href="/privacy-policy">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </li>
            <li className="basis-full p-2 md:basis-1/3 md:text-right">
              <p>
                Copyright &copy; {new Date().getFullYear()} Alveus Sanctuary.
                <br /> All rights reserved.
                <br /> EIN: 86-1772907.
              </p>
            </li>
          </ul>
        </div>
      </footer>
    </>
  );
};
