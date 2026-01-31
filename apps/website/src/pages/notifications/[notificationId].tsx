import { DateTime } from "luxon";
import type {
  GetStaticPropsContext,
  InferGetStaticPropsType,
  NextPage,
} from "next";
import { useEffect } from "react";

import { getNotificationById } from "@/server/db/notifications";

import { formatDateTime } from "@/utils/datetime";
import {
  checkUserAgentIsInstalledAsPWA,
  getNotificationVod,
} from "@/utils/notifications";

import Button from "@/components/content/Button";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import { NotificationIcon } from "@/components/notifications/NotificationIcon";

import IconArrowRight from "@/icons/IconArrowRight";

export async function getStaticProps({ params }: GetStaticPropsContext) {
  const notificationId = String(params?.notificationId || "");
  if (notificationId === "") return { notFound: true };

  const notification = await getNotificationById(notificationId);
  if (!notification) return { notFound: true };

  return {
    props: {
      notification,
    },
  };
}

export async function getStaticPaths() {
  return {
    paths: [], // Do we want to prerender some posts?
    fallback: "blocking",
  };
}

const NotificationPage: NextPage<
  InferGetStaticPropsType<typeof getStaticProps>
> = ({ notification }) => {
  const link = getNotificationVod(notification) || notification.linkUrl;

  useEffect(() => {
    if (link) {
      // Attempt to break out of the PWA view if we're in one
      window.location.href = checkUserAgentIsInstalledAsPWA()
        ? `x-safari-${link.replace(/^(?!(https?:)?\/\/)/, "//")}`
        : link;
    }
  }, [link]);

  return (
    <>
      <Meta
        title={[notification.title, "Notification"].filter(Boolean).join(" | ")}
        description={notification.message}
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section dark className="py-8">
        <Heading className="flex items-center justify-center gap-4">
          {notification.title || "Notification"}
          <NotificationIcon notification={notification} />
        </Heading>
      </Section>

      {/* Grow the last section to cover the page */}
      <Section
        className="flex grow"
        containerClassName="flex flex-col items-center my-auto gap-4"
      >
        <Button href={link || "/updates"} className="flex items-center gap-2">
          {link?.toLowerCase().replace(/^(https?:)?\/\/(www\.)?/, "") ||
            "See Updates"}
          <IconArrowRight />
        </Button>

        <div className="flex items-center gap-2 opacity-70">
          {!!notification.message && (
            <>
              <p>{notification.message}</p>
              <div className="mt-0.5 size-1.5 rounded-full bg-alveus-green-800" />
            </>
          )}

          <time
            dateTime={notification.createdAt.toISOString()}
            title={formatDateTime(notification.createdAt)}
          >
            {DateTime.fromJSDate(notification.createdAt).toRelative({
              locale: "en-US",
            })}
          </time>
        </div>
      </Section>
    </>
  );
};

export default NotificationPage;
