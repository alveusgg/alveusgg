import { type NextPage } from "next";
import Link from "next/link";
import React from "react";

import IconDiscord from "@/icons/IconDiscord";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";

import { NotificationsButton } from "@/components/layout/navbar/NotificationsButton";
import { Announcements } from "@/components/notifications/Announcements";
import { RecentNotifications } from "@/components/notifications/RecentNotifications";

const notificationTags = ["vod", "stream"];

const UpdatesPage: NextPage = () => {
  return (
    <>
      <Meta
        title="Updates"
        description="Announcements, Updates and Stream schedule"
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section dark className="z-20">
        <Heading>Announcements, Updates and Stream schedule</Heading>

        <p className="mt-6">
          Keep up-to-date using one of our announcement channels:
        </p>
        <ul className="mt-4 flex gap-4">
          <li className="flex items-center rounded bg-alveus-green-900/80 px-2 transition-transform hover:scale-102 hover:bg-alveus-green-900">
            <NotificationsButton showLabel={true} openDirection="right" />
          </li>
          <li className="contents">
            <span className="self-center italic">or</span>
            <Link
              rel="noreferer"
              target="_blank"
              className="flex items-center rounded bg-alveus-green-900/50 px-4 transition-transform hover:scale-102 hover:bg-alveus-green-900"
              href="https://discord.com/channels/548410541991919617/1052380120981180426"
            >
              <IconDiscord className="mr-2 h-6 w-6" />
              Discord #alveus-announcements
            </Link>
          </li>
          {/* TODO: twitter, ig */}
        </ul>
      </Section>

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
