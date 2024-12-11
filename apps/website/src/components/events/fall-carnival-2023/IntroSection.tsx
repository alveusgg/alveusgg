import NextLink from "next/link";
import Image from "next/image";

import teaserImage from "@/assets/events/fall-carnival-2023/teaser2.png";
import IconArrowRight from "@/icons/IconArrowRight";

import { classes } from "@/utils/classes";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";

type IntroSectionProps = {
  showTicket?: boolean;
  showLinkToClaimTicket?: boolean;
};

export function IntroSection({
  showTicket = false,
  showLinkToClaimTicket = false,
}: IntroSectionProps) {
  return (
    <Section
      dark
      className="bg-carnival"
      containerClassName={classes(
        "flex flex-col md:flex-row-reverse gap-12 lg:gap-24 items-center justify-center",
        !showTicket && "text-center",
      )}
    >
      {showTicket && (
        <div>
          <NextLink
            className="hover:scale-102"
            href="/events/fall-carnival-2023"
          >
            <Image
              src={teaserImage}
              alt=""
              width={400}
              className="max-w-[400px]"
            />
          </NextLink>
        </div>
      )}

      <div>
        <Heading>Alveus Fall Carnival 2023</Heading>
        <p className="text-lg">November 4th 2023 at 11am CT</p>

        {showLinkToClaimTicket && (
          <div className="mt-6 md:mt-8 lg:mt-14">
            <NextLink
              className="rounded-full border-2 border-white px-4 py-2 text-lg text-white transition-colors hover:bg-white hover:text-carnival md:px-4 md:py-2 md:text-xl lg:text-2xl"
              href="/events/fall-carnival-2023"
            >
              Customize your ticket
              <IconArrowRight className="ml-3 inline-block size-6" />
            </NextLink>
          </div>
        )}
      </div>
    </Section>
  );
}
