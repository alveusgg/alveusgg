import type {
  GetStaticPropsContext,
  InferGetStaticPropsType,
  NextPage,
} from "next";

import React, { useEffect } from "react";

import { useRouter } from "next/router";
import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";

import { getNotificationById } from "@/server/db/notifications";
import Link from "@/components/content/Link";

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
  const router = useRouter();
  useEffect(() => {
    if (notification.linkUrl) {
      window.location.href = notification.linkUrl;
    } else {
      router
        .replace(
          `/updates?${new URLSearchParams({ notificationId: notification.id })}`
        )
        .then(() => {
          // ignore
        });
    }
  });

  const content = (
    <>
      <div className="text-center">
        <Heading>{notification.title || "Update"}</Heading>
        <p>{notification.message}</p>

        {notification.linkUrl ? (
          <Link external href={notification.linkUrl}>
            {notification.linkUrl}
          </Link>
        ) : (
          <Link
            href={`/updates?${new URLSearchParams({
              notificationId: notification.id,
            })}`}
          >
            Show updates!
          </Link>
        )}
      </div>
    </>
  );

  return (
    <>
      <Meta
        title={notification.title || "Update"}
        description={notification.message}
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section dark>
        <Heading>Alveus notification</Heading>
      </Section>

      {/* Grow the last section to cover the page */}
      <Section className="flex-grow">{content}</Section>

      <div
        className="fixed inset-0 z-20 flex items-center justify-center bg-alveus-tan"
        id="notification-redirect-overlay"
      >
        <div className="text-center">{content}</div>
      </div>
    </>
  );
};

export default NotificationPage;
