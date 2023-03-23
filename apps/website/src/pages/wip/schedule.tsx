import React from "react";
import { type InferGetStaticPropsType, type NextPage } from "next";

import DefaultPageLayout from "@/components/DefaultPageLayout";
import { Headline } from "@/components/shared/Headline";
import { ShowCard } from "@/components/schedule/ShowCard";
import Meta from "@/components/content/Meta";

export type SchedulePageProps = InferGetStaticPropsType<typeof getStaticProps>;

export async function getStaticProps() {
  return {
    props: {},
  };
}

const SchedulePage: NextPage<SchedulePageProps> = ({}) => {
  return (
    <>
      <Meta title="Schedule" />

      <DefaultPageLayout title="Schedule">
        <Headline>Weekly stream schedule</Headline>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
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

        <Headline>Stay Updated!</Headline>

        <p className="mb-4">
          You can use the new notification service (see top right) to get
          updates and follow @alveussanctuary on all social platforms to keep up
          to date!
        </p>
      </DefaultPageLayout>
    </>
  );
};

export default SchedulePage;
