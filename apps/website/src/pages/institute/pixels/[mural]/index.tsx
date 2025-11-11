import { type GetStaticPaths, type GetStaticProps, type NextPage } from "next";
import Image from "next/image";
import { type ReactNode, useState } from "react";

import murals, { type MuralId, isMuralId } from "@/data/murals";

import { classes } from "@/utils/classes";
import { typeSafeObjectKeys } from "@/utils/helpers";
import { camelToKebab, kebabToCamel } from "@/utils/string-case";

import { PixelProvider } from "@/hooks/pixels";

import Box from "@/components/content/Box";
import Button from "@/components/content/Button";
import Donate from "@/components/content/Donate";
import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import PixelLeaderboard from "@/components/institute/PixelLeaderboard";
import PixelsDescription from "@/components/institute/PixelsDescription";
import PixelsDownload from "@/components/institute/PixelsDownload";
import PixelsSearch from "@/components/institute/PixelsSearch";
import Wolves from "@/components/institute/Wolves";

import IconArrowRight from "@/icons/IconArrowRight";
import IconPencil from "@/icons/IconPencil";

import leafLeftImage2 from "@/assets/floral/leaf-left-2.png";
import leafLeftImage3 from "@/assets/floral/leaf-left-3.png";
import leafRightImage2 from "@/assets/floral/leaf-right-2.png";
import buildingHeroImage from "@/assets/institute/hero/building.png";
import usfwsRedWolfWalkingImage from "@/assets/institute/usfws-red-wolf-walking.jpg";

const content: Record<MuralId, ReactNode> = {
  one: (
    <>
      <p className="text-lg">
        We&apos;re taking the Alveus approach to the wild. With your help, we
        successfully raised $1,000,000 to help fund the initial development of
        the Alveus Research & Recovery Institute. All 10,000 pixels on our mural
        have been unlocked by generous donors like you, each displaying the name
        of a vital original supporter of the institute.
      </p>

      <p className="text-lg">
        While all pixels have been claimed on this original mural, we still need
        your help! That&apos;s why we&apos;re excited to announce the launch of
        Pixel Project 2, a brand new mural with another 10,000 pixels waiting to
        be unlocked by your donations.
      </p>

      <Button
        href="/institute/pixels/two"
        dark
        className="flex items-center gap-2 text-balance"
      >
        Unlock Pixels on Pixel Project 2
        <IconArrowRight className="size-5" />
      </Button>
    </>
  ),
  two: (
    <>
      <p className="text-lg">
        While all pixels have been claimed on our original Pixel Project mural,
        we still need your help! That&apos;s why we&apos;re excited to announce
        the launch of Pixel Project 2 - another 10,000 pixels waiting to be
        unlocked by your donations, supporting the continued development of the
        Alveus Research & Recovery Institute and taking the Alveus approach to
        the wild.
      </p>

      <p className="text-lg">
        Each donation of $100 or more unlocks a pixel on our mural, displaying
        your name and denoting you as one of the 10,000 vital supporters of the
        institute as part of this mural. More pixels can be unlocked for each
        additional $100 included in your donation.
      </p>

      <Link
        href="/institute/pixels/one"
        dark
        className="flex items-center gap-2 text-balance"
      >
        <IconArrowRight className="mt-0.5 size-4 -scale-x-100" />
        Explore the Original Pixel Project Mural
      </Link>
    </>
  ),
};

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: typeSafeObjectKeys(murals).map((key) => ({
      params: { mural: camelToKebab(key) },
    })),
    fallback: false,
  };
};

export type InstitutePixelsPageProps = {
  muralId: MuralId;
};

export const getStaticProps: GetStaticProps<InstitutePixelsPageProps> = async (
  context,
) => {
  const mural = context.params?.mural;
  if (typeof mural !== "string") return { notFound: true };

  const muralId = kebabToCamel(mural);
  if (!isMuralId(muralId)) return { notFound: true };

  return {
    props: {
      muralId,
    },
  };
};

const InstitutePixelsPage: NextPage<InstitutePixelsPageProps> = ({
  muralId,
}) => {
  const mural = murals[muralId];
  const idx = typeSafeObjectKeys(murals).indexOf(muralId);
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <PixelProvider muralId={muralId}>
      <Meta
        title={`${mural.name} | Alveus Research & Recovery Institute`}
        description={mural.description}
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
        containerClassName="flex flex-col gap-4 lg:flex-row lg:gap-8 items-start lg:items-center"
      >
        <div className="shrink grow text-balance">
          <Heading>Alveus Research & Recovery Institute {mural.name}</Heading>
          <p>{mural.description}</p>
        </div>
        <Button
          href="/institute"
          dark
          className="flex items-center gap-2 text-nowrap"
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
        <PixelsSearch className="col-span-full" onFullscreen={setFullscreen}>
          <Image
            src={leafRightImage2}
            alt=""
            className={classes(
              "pointer-events-none absolute bottom-0 -z-10 h-3/4 max-h-64 w-auto drop-shadow-md select-none",
              idx % 2 === 0
                ? "left-full -translate-x-2 -scale-x-100"
                : "right-full translate-x-2",
            )}
          />
          <Image
            src={leafLeftImage3}
            alt=""
            className={classes(
              "pointer-events-none absolute top-full -z-10 h-2/5 max-h-48 w-auto -translate-y-1/3 drop-shadow-md select-none",
              idx % 2 === 0
                ? "left-0 -translate-x-2/5 -scale-x-100"
                : "right-0 translate-x-2/5",
            )}
          />
        </PixelsSearch>

        <div className="relative pb-8 max-lg:order-last xl:col-span-2">
          <Image
            src={leafLeftImage2}
            alt=""
            className="pointer-events-none absolute right-0 -bottom-12 z-10 h-auto w-1/2 max-w-40 -scale-x-100 drop-shadow-md select-none"
          />

          <Box dark className="flex flex-col items-start gap-4">
            <Heading level={2} className="my-0">
              Saving Animals From Extinction
            </Heading>

            {content[muralId]}

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

              <Link href="/institute" dark className="flex items-center gap-2">
                <IconArrowRight className="mt-0.5 size-4 -scale-x-100" />
                Learn More About the Institute
              </Link>
            </Wolves>

            <p className="text-xs text-balance opacity-75">
              Alveus Sanctuary will use all donations as part of the{" "}
              {mural.name} to fund the initial development of the institute.
              <br />
              In the event that more funds are raised than are needed for the
              project, additional funds will be allocated to the operations of
              the institute.
            </p>
          </Box>
        </div>

        <div className="flex flex-col gap-8">
          <Donate type="twitch" highlight />
          <Donate type="paypal" link="/paypal/pixels" />

          <Box
            dark
            className={classes(mural.type === "static" && "order-first")}
          >
            <PixelsDescription className="text-center text-2xl" />

            <Heading level={2} className="mt-8 text-xl">
              Leaderboard
            </Heading>
            <PixelLeaderboard showLinks muralId={muralId} />

            <Heading level={2} className="mt-8 text-xl">
              Can&apos;t find your pixel?
            </Heading>
            <p>
              If you donated via Twitch Charity, your pixel will show your
              Twitch username and you can search using that. If you donated via
              PayPal directly, your pixel will show your first name but you can
              also search using your PayPal email address.
            </p>

            <Heading level={2} className="mt-8 text-xl">
              Want a different name on the mural?
            </Heading>
            <p>
              You can log in with Twitch or submit your PayPal donation details
              to change your name on any of the pixels you have unlocked on the
              mural.
            </p>

            <div className="flex">
              <Link
                href={`/institute/pixels/${muralId}/rename`}
                dark
                className="mt-4 inline-flex items-center gap-2"
              >
                <IconPencil className="size-4" />
                Rename your pixels
              </Link>
            </div>

            <PixelsDownload />
          </Box>
        </div>
      </Section>
    </PixelProvider>
  );
};

export default InstitutePixelsPage;
