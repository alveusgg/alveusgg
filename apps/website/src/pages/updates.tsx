import { type NextPage } from "next";
import Image from "next/image";
import Link from "next/link";

import useCrawler from "@/hooks/crawler";
import usePrefersReducedMotion from "@/hooks/motion";
import useIsWebKit from "@/hooks/webkit";

import { Schedule } from "@/components/calendar/Schedule";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import Video from "@/components/content/Video";
import { Announcements } from "@/components/notifications/Announcements";
import { NotificationsButton } from "@/components/notifications/NotificationsButton";
import { RecentNotifications } from "@/components/notifications/RecentNotifications";
import updateChannels from "@/components/shared/data/updateChannels";

import bellPeepo from "@/assets/bell-peepo.webm";

const notificationTags = ["stream"];

const UpdatesPage: NextPage = () => {
  const reducedMotion = usePrefersReducedMotion();

  // If this is a known crawler, we'll not load the video
  // This is an attempt to stop Google reporting unindexable video pages
  const crawler = useCrawler();

  // If the user is using WebKit (Safari on Mac and any browser on iOS), we'll not load the video as WebKit does
  // not support WebM well (bad frame rate and no transparency) as of 2024-11-09
  const mightBeWebkit = useIsWebKit() !== false; // assume it's WebKit until we know

  const showVideo = !crawler && !reducedMotion && !mightBeWebkit;

  return (
    <>
      <Meta
        title="Schedule & Updates"
        description="See upcoming streams in the schedule and stay updated with push notifications"
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section
        dark
        className="z-10 py-0"
        containerClassName="flex flex-wrap items-center justify-between lg:flex-nowrap gap-x-16"
      >
        <div className="w-full grow py-8 lg:max-w-2/3">
          <Heading>Schedule and Updates</Heading>

          <p className="mt-6">
            Stay updated using one of our announcement channels:
          </p>

          <div className="mt-4 flex flex-col items-center gap-1 md:items-start">
            <NotificationsButton
              className="rounded-lg bg-alveus-green-900/80 px-4 py-2 hover:bg-alveus-green-900"
              showLabel={true}
              openDirectionX="right"
            />

            {Object.entries(updateChannels).map(([key, updateChannel]) => (
              <Link
                key={key}
                rel="noreferer"
                target="_blank"
                className="flex rounded-lg bg-alveus-green-800 px-4 py-2 hover:bg-alveus-green-900"
                href={updateChannel.link}
              >
                <updateChannel.icon size={24} className="mr-2 size-6" />
                {updateChannel.title}
              </Link>
            ))}
          </div>
        </div>

        <div className="w-full max-w-lg">
          {showVideo ? (
            <Video
              sources={bellPeepo.sources}
              poster={bellPeepo.poster}
              className="h-auto w-full"
              width={512}
              height={432}
              autoPlay
              loop
              muted
              playsInline
              disablePictureInPicture
            />
          ) : (
            <Image
              src={bellPeepo.poster || ""}
              alt=""
              width={512}
              height={432}
              loading="lazy"
              className="w-full"
            />
          )}
        </div>
      </Section>

      {/* Grow the last section to cover the page */}
      <Section className="grow">
        <div className="flex flex-col gap-10">
          <section>
            <Heading level={3} id="schedule" link>
              Schedule
            </Heading>
            <Schedule />
          </section>

          <section>
            <Heading level={3} id="recent" link>
              Recent Notifications
            </Heading>
            <RecentNotifications tags={notificationTags} />
          </section>

          <section>
            <Heading level={3} id="announcements" link>
              Announcements
            </Heading>
            <Announcements />
          </section>
        </div>
      </Section>
    </>
  );
};

export default UpdatesPage;
