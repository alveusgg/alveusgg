import type { InferGetStaticPropsType, NextPage } from "next";

import {
  getMapFeatures,
  getPostsCount,
  getUsersCount,
} from "@/server/db/show-and-tell";

import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";

import showAndTellHeader from "@/assets/show-and-tell/header.png";
import { CommunityMap } from "@/components/show-and-tell/CommunityMap";
import { countUnique } from "@/utils/array";
import useLocaleString from "@/hooks/locale";

export type ShowAndTellPageProps = InferGetStaticPropsType<
  typeof getStaticProps
>;

export const getStaticProps = async () => {
  const features = await getMapFeatures();
  const locations = features.map(({ location }) => location);
  const countries = locations.map((location) =>
    location
      ?.substring(location.lastIndexOf(",") + 1)
      .trim()
      .toUpperCase(),
  );
  const totalPostsCount = await getPostsCount();
  const usersCount = await getUsersCount();

  return {
    props: {
      features,
      totalLocationsCount: locations.length,
      uniqueLocationsCount: countUnique(locations),
      uniqueCountriesCount: countUnique(countries),
      totalPostsCount,
      usersCount,
    },
  };
};

const ShowAndTellMapPage: NextPage<ShowAndTellPageProps> = ({
  features,
  totalLocationsCount,
  uniqueLocationsCount,
  uniqueCountriesCount,
}) => {
  // Format the stats
  const totalFeaturesCountFmt = useLocaleString(totalLocationsCount);
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

      <Section dark>
        <Heading>Show and Tell: Community Map</Heading>
        <p className="text-lg">
          See what the Alveus community has been up to as they share their
          conservation and wildlife-related activities.
        </p>

        <p className="mt-8">
          A total of {totalFeaturesCountFmt} locations have been shared,
          including {uniqueLocationsCountFmt} unique locations across{" "}
          {uniqueCountriesCountFmt} countries.
        </p>
      </Section>

      <Section>
        <div className="h-[800px] max-h-[80vh] w-full overflow-hidden rounded-lg">
          <CommunityMap features={features} />
        </div>
      </Section>
    </>
  );
};

export default ShowAndTellMapPage;
