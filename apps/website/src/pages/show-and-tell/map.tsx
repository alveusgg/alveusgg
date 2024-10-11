import type { InferGetStaticPropsType, NextPage } from "next";
import NextLink from "next/link";
import Image from "next/image";

import {
  getMapFeatures,
  getPostsCount,
  getUsersCount,
} from "@/server/db/show-and-tell";

import { countUnique } from "@/utils/array";
import { classes } from "@/utils/classes";
import { extractCountriesFromLocations } from "@/utils/locations";
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

import { CommunityMap } from "@/components/show-and-tell/CommunityMap";

export type ShowAndTellPageProps = InferGetStaticPropsType<
  typeof getStaticProps
>;

const bentoBoxClasses =
  "rounded-xl bg-alveus-green-600 text-center text-white shadow-lg shadow-black/30 flex flex-col justify-center gap-2 overflow-hidden";

export const getStaticProps = async () => {
  const features = await getMapFeatures();
  const locations = features.map(({ location }) => location);
  const countries = extractCountriesFromLocations(locations);
  const totalPostsCount = await getPostsCount();
  const usersCount = await getUsersCount();

  return {
    props: {
      features,
      uniqueLocationsCount: countUnique(locations),
      uniqueCountriesCount: countUnique(countries),
      totalPostsCount,
      usersCount,
    },
  };
};

const ShowAndTellMapPage: NextPage<ShowAndTellPageProps> = ({
  features,
  uniqueLocationsCount,
  uniqueCountriesCount,
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
        <div className="mb-6 grid w-full grid-cols-4 gap-4 md:grid-cols-6">
          <NextLink
            href="/show-and-tell"
            className={classes(
              bentoBoxClasses,
              "group col-span-2 grid grid-cols-1 text-lg transition-transform duration-200 hover:scale-102 lg:col-span-1",
            )}
          >
            <div className="relative col-start-1 row-start-1 flex items-center justify-center">
              <div className="flex items-center gap-2 rounded-tl-xl bg-alveus-green-600 p-2 px-4 text-white">
                <IconArrowRight className="h-8 w-8 rotate-180" />
                All posts
              </div>
            </div>
          </NextLink>
          <div
            className={classes(
              bentoBoxClasses,
              "items-center p-2 md:col-start-5 md:text-lg",
            )}
          >
            <IconMapPin className="h-10 w-10" />
            {uniqueLocationsCountFmt} locations
          </div>
          <div
            className={classes(bentoBoxClasses, "items-center p-2 md:text-lg")}
          >
            <IconGlobe className="h-10 w-10" />
            {uniqueCountriesCountFmt} countries
          </div>
        </div>

        <CommunityMap features={features} />
      </Section>
    </>
  );
};

export default ShowAndTellMapPage;
