import React from "react";
import { type InferGetStaticPropsType, type NextPage } from "next";
import Head from "next/head";

import DefaultPageLayout from "../components/DefaultPageLayout";
import { Headline } from "../components/shared/Headline";
import { ShowCard } from "../components/schedule/ShowCard";

export type SchedulePageProps = InferGetStaticPropsType<typeof getStaticProps>;

export async function getStaticProps() {
  return {
    props: {},
  };
}

const SchedulePage: NextPage<SchedulePageProps> = ({}) => {
  return (
    <>
      <Head>
        <title>Stream Schedule | Alveus.gg</title>
      </Head>

      <DefaultPageLayout title="Stream Schedule">
        <div className="-mx-4 grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 bg-black/50 p-4">
          <ShowCard
            {...{
              name: "Mondays with Ella",
              imageUrl: "/assets/shows/mondays-with-ella.png",
              timeSlotCT: "3 PM",
              weekday: "Monday",
            }}
          />
          <ShowCard
            {...{
              name: "Keeper Talk with Kayla",
              imageUrl: "/assets/shows/keeper-talk.png",
              timeSlotCT: "2 PM",
              weekday: "Wednesday",
            }}
          />
          <ShowCard
            {...{
              name: "Fridays with Connor",
              imageUrl: "/assets/shows/fridays-with-connor.png",
              timeSlotCT: "4 PM",
              weekday: "Friday",
            }}
          />
          <ShowCard
            {...{
              name: "Behind the scenes with Maya",
              imageUrl: "/assets/shows/bts.png",
              timeSlotCT: "12 PM",
              weekday: "Saturday",
            }}
          />
        </div>
      </DefaultPageLayout>
    </>
  );
};

export default SchedulePage;
