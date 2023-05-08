import Link from "next/link";
import Image from "next/image";
import React from "react";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import ContentLink from "@/components/content/Link";
import imageGuidestarSeal from "@/assets/guidestar-candid-gold-seal.svg";

export function TransparencySealSection() {
  return (
    <Section
      dark
      className="bg-alveus-green-900"
      containerClassName="flex flex-col-reverse md:flex-row-reverse gap-4 md:gap-10"
    >
      <div>
        <Heading id="seal">Gold rated transparency</Heading>

        <p>
          Alveus&apos; transparency has been rated gold on Candid (GuideStar).
          Candid is a leading source of information on non-profit organizations,
          helping donors and funders make informed decisions about their
          support. Check out our updated{" "}
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
          className="h-40 w-40"
          src={imageGuidestarSeal}
          width={200}
          height={200}
          alt="Gold Transparency Seal 2023 by Candid"
        />
      </Link>
    </Section>
  );
}
