import { type NextPage } from "next";
import Image from "next/image";

import Consent from "@/components/Consent";
import Box from "@/components/content/Box";
import Button from "@/components/content/Button";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import TheGivingBlockEmbed from "@/components/content/TheGivingBlockEmbed";
import Pixels from "@/components/institute/Pixels";
import Wolves from "@/components/institute/Wolves";

import IconArrowRight from "@/icons/IconArrowRight";

import leafLeftImage2 from "@/assets/floral/leaf-left-2.png";
import leafLeftImage3 from "@/assets/floral/leaf-left-3.png";
import leafRightImage2 from "@/assets/floral/leaf-right-2.png";
import usfwsRedWolfWalkingImage from "@/assets/institute/usfws-red-wolf-walking.jpg";

const InstitutePixelsPage: NextPage = () => {
  return (
    <>
      <Meta
        title="Pixels Campaign | Research & Recovery Institute"
        description="Donate $100 or more to unlock a pixel on the institute mural and support the development of the Alveus Research & Recovery Institute."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section
        dark
        containerClassName="flex flex-wrap gap-4 justify-between items-end"
      >
        <Heading>Alveus Research & Recovery Institute Pixels Campaign</Heading>
        <Button
          href="/institute"
          dark
          className="inline-flex items-center gap-2"
        >
          <IconArrowRight className="size-5 -scale-x-100" />
          Learn More About the Institute
        </Button>
      </Section>

      {/* Grow the last section to cover the page */}
      <Section
        className="grow overflow-hidden py-8"
        containerClassName="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3 items-start"
      >
        <div className="relative z-10 col-span-full">
          <Image
            src={leafRightImage2}
            alt=""
            className="pointer-events-none absolute bottom-0 left-full -z-10 h-3/4 w-auto -translate-x-2 -scale-x-100 drop-shadow-md select-none"
          />
          <Image
            src={leafLeftImage3}
            alt=""
            className="pointer-events-none absolute top-full left-0 -z-10 h-1/3 w-auto -translate-x-1/3 -translate-y-1/3 -scale-x-100 drop-shadow-md select-none"
          />

          <Pixels canvasClassName="rounded-lg shadow-xl ring-4 ring-alveus-green" />
        </div>

        <div className="relative pb-8 max-lg:order-last xl:col-span-2">
          <Image
            src={leafLeftImage2}
            alt=""
            className="pointer-events-none absolute right-0 -bottom-12 z-10 h-auto w-1/2 max-w-40 -scale-x-100 drop-shadow-md select-none"
          />

          <Box dark>
            <Heading level={2}>Saving Animals From Extinction</Heading>

            <p className="text-lg">
              We&apos;re taking the Alveus approach to the wild, and need your
              help. Each donation of $100 or more unlocks a pixel on our mural,
              on our way to raising $1,000,000 to fund the initial development
              of the Alveus Research & Recovery Institute. Each pixel unlocked
              by your donation will display your name, denoting you as one of
              the 10,000 vital original supporters of the Institute. More pixels
              can be unlocked for each additional $100 included in your
              donation.
            </p>

            <Wolves
              image={{
                src: usfwsRedWolfWalkingImage,
                alt: "Red wolf, Hillebrand, Steve/USFWS, Public Domain, https://www.fws.gov/media/just-little-closer",
              }}
            >
              <p className="text-lg">
                The Alveus Research & Recovery Institute is aiming to create a
                conservation breeding program for the critically endangered
                Mexican Gray and Red wolves, helping to maintain a population
                under human care with the end goal of reintroducing these
                incredible animals back into the wild.
              </p>

              <Button
                href="/institute"
                dark
                className="mt-4 inline-flex items-center gap-2"
              >
                <IconArrowRight className="size-5 -scale-x-100" />
                Learn More About the Institute
              </Button>
            </Wolves>

            <p className="mt-4 text-xs text-balance opacity-75">
              Alveus Sanctuary will use all donations as part of the Pixels
              Campaign to fund the initial development of the institute.
              <br />
              In the event that more funds are raised than are needed for the
              project, additional funds will be allocated to the operations of
              the institute.
            </p>
          </Box>
        </div>

        <Consent item="donation widget" consent="givingBlock">
          <TheGivingBlockEmbed
            campaignId="Wolf"
            className="flex w-full justify-center"
          />
        </Consent>
      </Section>
    </>
  );
};

export default InstitutePixelsPage;
