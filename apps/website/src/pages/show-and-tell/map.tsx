import type { InferGetStaticPropsType, NextPage } from "next";
import NextLink from "next/link";
import Image from "next/image";

import {
  getMapFeatures,
  getPostsCount,
  getUsersCount,
} from "@/server/db/show-and-tell";

import { classes } from "@/utils/classes";
import { extractInfoFromMapFeatures } from "@/utils/locations";
import useLocaleString from "@/hooks/locale";

import showAndTellPeepo from "@/assets/show-and-tell/peepo.png";
import showAndTellHeader from "@/assets/show-and-tell/header.png";

import IconArrowRight from "@/icons/IconArrowRight";
import IconMapPin from "@/icons/IconMapPin";
import IconGlobe from "@/icons/IconGlobe";

import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";
import Box from "@/components/content/Box";

import { CommunityMap } from "@/components/show-and-tell/CommunityMap";

import { bentoBoxClasses } from ".";

export type ShowAndTellPageProps = InferGetStaticPropsType<
  typeof getStaticProps
>;

export const getStaticProps = async () => {
  const features = await getMapFeatures();
  const { locations, countries, postsFromANewLocation } =
    extractInfoFromMapFeatures(features);

  const totalPostsCount = await getPostsCount();
  const usersCount = await getUsersCount();

  return {
    props: {
      features,
      uniqueLocationsCount: locations.size,
      uniqueCountriesCount: countries.size,
      totalPostsCount,
      usersCount,
      postsFromANewLocation,
    },
  };
};

const ShowAndTellMapPage: NextPage<ShowAndTellPageProps> = ({
  features,
  uniqueLocationsCount,
  uniqueCountriesCount,
  postsFromANewLocation,
}) => {
  // Format the stats
  const uniqueLocationsCountFmt = useLocaleString(uniqueLocationsCount);
  const uniqueCountriesCountFmt = useLocaleString(uniqueCountriesCount);

  return (
    <>
      <Meta
        title="Show and Tell"
        description="See what the Alveus community has been up to as they share their conservation and wildlife-related activities, or share your own activities."
        image={showAndTellHeader.src}
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section
        dark
        className="py-0"
        containerClassName="flex flex-wrap items-center justify-between"
      >
        <div className="w-full pb-4 pt-8 md:w-3/5 md:py-20">
          <Heading>Show and Tell: Community Map</Heading>
          <p className="text-lg">
            The community shares conservation and wildlife-related activities.
            <br />
            Share your own via the{" "}
            <Link href="/show-and-tell/submit-post" dark>
              submission page
            </Link>
            .
          </p>
        </div>

        <Image
          src={showAndTellPeepo}
          width={448}
          alt=""
          className="mx-auto w-1/2 max-w-md p-4 pb-16 md:mx-0 md:w-1/4 md:pb-4"
        />
      </Section>

      <Section className="py-6 md:py-12">
        <div className="mb-6 grid w-full grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          <Box
            dark
            className={classes(
              bentoBoxClasses,
              "col-span-2 p-0 text-lg transition-transform duration-200 hover:scale-102 xl:col-span-1",
            )}
          >
            <NextLink
              href="/show-and-tell"
              className="flex h-full items-center justify-center gap-2 p-8"
            >
              <IconArrowRight className="h-8 w-8 rotate-180" />
              All posts
            </NextLink>
          </Box>
          <Box
            dark
            className={classes(
              bentoBoxClasses,
              "items-center p-2 md:text-lg lg:col-start-5",
            )}
          >
            <IconMapPin className="h-10 w-10" />
            {uniqueLocationsCountFmt} locations
          </Box>
          <Box
            dark
            className={classes(bentoBoxClasses, "items-center p-2 md:text-lg")}
          >
            <IconGlobe className="h-10 w-10" />
            {uniqueCountriesCountFmt} countries
          </Box>
        </div>

        <CommunityMap
          features={features}
          postsFromANewLocation={postsFromANewLocation}
        />
      </Section>
    </>
  );
};

export default ShowAndTellMapPage;
