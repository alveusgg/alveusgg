import { type NextPage } from "next";
import Image from "next/image";
import Link from "next/link";

import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";

import { Announcements } from "@/components/notifications/Announcements";
import { NotificationsButton } from "@/components/notifications/NotificationsButton";
import { RecentNotifications } from "@/components/notifications/RecentNotifications";
import { Schedule } from "@/components/notifications/Schedule";
import updateChannels from "@/components/shared/data/updateChannels";

import bellPeepoStatic from "@/assets/bell-peepo-static.webp";

const notificationTags = ["stream"];

const UpdatesPage: NextPage = () => {
  return (
    <>
      <Meta title="Updates" description="Announcements and Updates" />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section
        dark
        className="z-10 py-0"
        containerClassName="flex flex-wrap items-center justify-between lg:flex-nowrap gap-x-16"
      >
        <div className="w-full flex-grow py-8 lg:max-w-2/3">
          <Heading>Announcements and Updates</Heading>

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
                <updateChannel.icon size={24} className="mr-2 h-6 w-6" />
                {updateChannel.title}
              </Link>
            ))}
          </div>
        </div>

        <div className="w-full max-w-lg">
          {/* Video player shown if no reduced-motion or reduced-data preference */}
          <video
            className="video-reduced reduced-motion:hidden reduced-data:hidden"
            width="100%"
            height="100%"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="/assets/bell-peepo.webm" type="video/webm" />
            <Image
              src={bellPeepoStatic}
              alt="Peepo ringing bell"
              className="w-full"
            />
          </video>
          {/* Static image shown if reduced-motion or reduced-data preference is detected */}
          <div className="static-image hidden reduced-motion:block reduced-data:block">
            <Image
              src={bellPeepoStatic}
              alt="Peepo ringing bell"
              className="w-full"
            />
          </div>
        </div>
      </Section>

      {/* Grow the last section to cover the page */}
      <Section className="flex-grow">
        <div className="flex flex-col gap-10 xl:flex-row">
          <div className="flex flex-1 grow-[2] flex-col gap-8">
            <section>
              <Heading level={3} id="schedule" link>
                Schedule
              </Heading>
              <Schedule />
            </section>

            <section>
              <Heading level={3} id="announcements" link>
                Announcements
              </Heading>
              <Announcements />
            </section>
          </div>

          <section className="flex-1">
            <Heading level={3} id="recent" link>
              Recent Notifications
            </Heading>
            <RecentNotifications tags={notificationTags} />
          </section>
        </div>
      </Section>
    </>
  );
};

export default UpdatesPage;
