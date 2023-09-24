import { type NextPage } from "next";
import Link from "next/link";
import Image from "next/image";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";

import { NotificationsButton } from "@/components/notifications/NotificationsButton";
import { Announcements } from "@/components/notifications/Announcements";
import { RecentNotifications } from "@/components/notifications/RecentNotifications";
import updateChannels from "@/components/shared/data/updateChannels";

import bellPeepo from "@/assets/bell-peepo.webp";
import { IntroSection } from "@/components/events/fall-carnival-2023/IntroSection";

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
        containerClassName="flex flex-wrap items-center justify-between"
      >
        <div className="w-full py-8 md:w-2/5">
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

        <div className="w-full max-w-2xl md:w-3/5">
          <Image
            src={bellPeepo}
            alt=""
            className="w-full"
            unoptimized // Next.js optimization makes this larger than source
          />
        </div>
      </Section>

      <IntroSection showTicket={true} showLinkToClaimTicket={true} />

      {/* Grow the last section to cover the page */}
      <Section className="flex-grow">
        <div className="flex flex-col gap-10 lg:flex-row">
          <section className="flex-1">
            <Heading level={3}>Announcements</Heading>
            <Announcements />
          </section>

          {/*
          <div className="flex flex-1 flex-col gap-10">
            <section>
              <Heading level={3}>Upcoming events</Heading>

              <div>
                <div>Static content event teasers?</div>
              </div>

              <Heading level={3}>Stream schedule</Heading>

              <div>
                <div>Ella</div>
                <div>Connor</div>
                <div>Kayla</div>
                <div>24/7</div>
              </div>
            </section>
          </div>
          */}

          <section className="flex-1">
            <Heading level={3}>Recent notifications</Heading>
            <RecentNotifications tags={notificationTags} />
          </section>
        </div>
      </Section>
    </>
  );
};

export default UpdatesPage;
