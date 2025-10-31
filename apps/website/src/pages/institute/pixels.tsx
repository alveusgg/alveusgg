import { type NextPage } from "next";
import Image from "next/image";
import { useState } from "react";

import { PixelProvider } from "@/hooks/pixels";

import Box from "@/components/content/Box";
import Button from "@/components/content/Button";
import Donate from "@/components/content/Donate";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import PixelsDescription from "@/components/institute/PixelsDescription";
import PixelsSearch from "@/components/institute/PixelsSearch";
import Wolves from "@/components/institute/Wolves";

import IconArrowRight from "@/icons/IconArrowRight";

import leafLeftImage2 from "@/assets/floral/leaf-left-2.png";
import buildingHeroImage from "@/assets/institute/hero/building.png";
import usfwsRedWolfWalkingImage from "@/assets/institute/usfws-red-wolf-walking.jpg";

const InstitutePixelsPage: NextPage = () => {
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <PixelProvider muralId="one">
      <Meta
        title="Pixel Project | Alveus Research & Recovery Institute"
        description="Explore the institute mural featuring 10,000 pixels unlocked by generous donors, raising $1,000,000 to fund the initial development of the Alveus Research & Recovery Institute."
        image={buildingHeroImage.src}
      >
        {fullscreen && (
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
          />
        )}
      </Meta>

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section
        dark
        containerClassName="flex flex-wrap gap-4 justify-between items-end"
      >
        <Heading>Alveus Research & Recovery Institute Pixel Project</Heading>
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
        offsetParent={!fullscreen}
      >
        <PixelsSearch className="col-span-full" onFullscreen={setFullscreen} />

        <div className="relative pb-8 max-lg:order-last xl:col-span-2">
          <Image
            src={leafLeftImage2}
            alt=""
            className="pointer-events-none absolute right-0 -bottom-12 z-10 h-auto w-1/2 max-w-40 -scale-x-100 drop-shadow-md select-none"
          />

          <Box dark>
            <Heading level={2}>Saving Animals From Extinction</Heading>

            <p className="text-lg">
              We&apos;re taking the Alveus approach to the wild, and with your
              help, we successfully raised $1,000,000 to fund the initial
              development of the Alveus Research & Recovery Institute. All
              10,000 pixels on our mural have been unlocked by generous donors
              like you, each displaying the name of a vital original supporter
              of the Institute. While all pixels have been claimed, donations
              are still greatly needed to support the ongoing development and
              operations of the institute.
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
              Alveus Sanctuary will use all donations as part of the Pixel
              Project to fund the initial development of the institute.
              <br />
              In the event that more funds are raised than are needed for the
              project, additional funds will be allocated to the operations of
              the institute.
            </p>
          </Box>
        </div>

        <div className="flex flex-col gap-8">
          <Box dark>
            <PixelsDescription className="text-center text-2xl" />

            <Heading level={2} className="mt-8 text-xl">
              Can&apos;t find your pixel?
            </Heading>
            <p>
              If you donated via Twitch Charity, your pixel will show your
              Twitch username and you can search using that. If you donated via
              PayPal directly, your pixel will show your first name but you can
              also search using your PayPal email address.
            </p>
          </Box>

          <Donate type="twitch" highlight />
          <Donate type="paypal" link="/paypal/pixels" />
        </div>
      </Section>
    </PixelProvider>
  );
};

export default InstitutePixelsPage;
