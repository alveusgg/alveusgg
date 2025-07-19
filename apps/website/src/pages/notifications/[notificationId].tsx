import type {
  GetStaticPropsContext,
  InferGetStaticPropsType,
  NextPage,
} from "next";
import Image from "next/image";
import type { ReactNode } from "react";

import { getNotificationById } from "@/server/db/notifications";

import { formatDateTime, hasTimePassed } from "@/utils/datetime";

import Button from "@/components/content/Button";
import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";

import IconCalendar from "@/icons/IconCalendar";
import IconTwitch from "@/icons/IconTwitch";

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

const Divider = ({ children }: { children: ReactNode }) => {
  return (
    <div className="my-4 flex w-full items-center gap-4">
      <hr className="flex-grow border-t border-black/20" />
      <span className="text-sm whitespace-nowrap text-gray-500">
        {children}
      </span>
      <hr className="flex-grow border-t border-black/20" />
    </div>
  );
};

const otherLinks: { title: string; href: string; description: string }[] = [
  {
    title: "Other Update 1",
    href: "https://youtube.com",
    description: "Livestream 1 by Knyrps",
  },
  {
    title: "Other Update 2",
    href: "https://youtube.com",
    description: "Livestream 2 by Knyrps",
  },
  {
    title: "Other Update 3",
    href: "https://youtube.com",
    description: "Livestream 3 by Knyrps",
  },
  {
    title: "Other Update 4",
    href: "https://youtube.com",
    description: "Livestream 4 by Knyrps",
  },
];

export async function getStaticPaths() {
  return {
    paths: [], // Do we want to prerender some posts?
    fallback: "blocking",
  };
}

const NotificationPage: NextPage<
  InferGetStaticPropsType<typeof getStaticProps>
> = ({ notification }) => {
  // const router = useRouter();
  // useEffect(() => {
  //   if (notification.linkUrl) {
  //     window.location.href = notification.linkUrl;
  //   } else {
  //     router
  //       .replace(
  //         `/updates?${new URLSearchParams({
  //           notificationId: notification.id,
  //         })}`,
  //       )
  //       .then(() => {
  //         // ignore
  //       });
  //   }
  // });

  const title = notification.title || "Update";

  return (
    <>
      <Meta title={title} description={notification.message} />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section dark className="py-8">
        <Heading className="text-center">Alveus notification</Heading>
      </Section>

      {/* Grow the last section to cover the page */}
      <Section className="grow" containerClassName="flex flex-wrap gap-x-10">
        <div className="mx-auto mb-10 flex h-fit basis-full flex-col items-center justify-start rounded-xl py-8 text-center shadow-xl md:px-8 lg:w-[calc(50%-var(--spacing)*10)] lg:w-full lg:basis-1/2">
          {/* <Heading>{title}</Heading> */}
          <Heading
            level={2}
            className="flex flex-wrap items-end justify-center gap-x-8 gap-y-2 px-6 text-center"
            id={notification.id}
          >
            {notification.linkUrl !== null ? (
              <Link
                href={notification.linkUrl}
                className="hover:text-alveus-green-600 hover:underline"
                external
                custom
              >
                {title}
              </Link>
            ) : (
              title
            )}
            <small className="text-xl text-alveus-green-600">
              <Link href={`#${notification.id}`} custom>
                {formatDateTime(
                  notification.scheduledStartAt || notification.createdAt,
                  { style: "long", time: "minutes" },
                )}
              </Link>
            </small>
          </Heading>

          {notification.linkUrl ? (
            <figure className="mt-2 w-full">
              <Link
                custom
                external
                href={notification.linkUrl}
                className="w-full"
              >
                <Image
                  src={notification.imageUrl || ""}
                  alt={`Image for Notification: "${notification.title}"`}
                  width={800}
                  height={800}
                  className="pointer-events-none aspect-video w-full bg-alveus-green-800 object-cover transition group-hover/trigger:scale-102 group-hover/trigger:shadow-2xl md:rounded-2xl"
                />
              </Link>
              <figcaption className="mt-4 w-full px-4 text-xl text-balance">
                <Link external href={notification.linkUrl} className="w-full">
                  {notification.message}
                </Link>
              </figcaption>
            </figure>
          ) : (
            <>
              <Link
                href={`/updates?${new URLSearchParams({
                  notificationId: notification.id,
                })}`}
              >
                Show updates!
              </Link>
              <p>{notification.message}</p>
            </>
          )}
          {!!notification.scheduledStartAt && !!notification.scheduledEndAt && (
            <div className="w-full px-4">
              <Divider>Schedule</Divider>
              <div className="flex w-full flex-row justify-evenly gap-x-3">
                <div>
                  <p>
                    {`${hasTimePassed(notification.scheduledStartAt) ? "Started" : "Starts"}: `}
                    <b>{`${formatDateTime(notification.scheduledStartAt, { style: "long", time: "minutes" })}`}</b>
                  </p>
                  <p>
                    {`${hasTimePassed(notification.scheduledEndAt) ? "Ended" : "Ends"}: `}
                    <b>{`${formatDateTime(notification.scheduledEndAt, { style: "long", time: "minutes" })}`}</b>
                  </p>
                </div>

                <Button
                  as="a"
                  width="auto"
                  size="small"
                  title="add to calendar"
                  filled
                  href={notification.linkUrl}
                  className="h-fit"
                >
                  <IconCalendar className="size-6" />
                </Button>
              </div>
            </div>
          )}
        </div>
        <div className="flex w-full flex-col gap-4 lg:w-[calc(50%-var(--spacing)*10)] lg:px-4">
          <Divider>Other Updates</Divider>
          {otherLinks.map((link, i) => (
            <Link
              key={`${link.title}:${i}`}
              href={link.href}
              external={true}
              custom
              className="group w-full rounded-lg bg-alveus-green px-4 py-2 text-alveus-tan shadow-xl transition hover:scale-102 hover:shadow-2xl"
            >
              <div className="flex items-center gap-4">
                <div className="block rounded-lg border-2 border-alveus-tan bg-alveus-tan p-2 text-alveus-green transition-colors group-hover:bg-alveus-green group-hover:text-alveus-tan">
                  <IconTwitch size={18} />
                </div>
                <div className="flex w-full flex-row justify-between">
                  <Heading level={3} className="text-xl">
                    {link.title}
                  </Heading>
                  <Heading level={3} className="text-xl">
                    <small className="text-xl text-alveus-green-500">-</small>
                  </Heading>
                  <Heading level={3} className="text-xl">
                    <small className="text-xl text-alveus-green-500">
                      {formatDateTime(
                        notification.scheduledStartAt || notification.createdAt,
                        { style: "short" },
                      )}
                    </small>
                  </Heading>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
};

export default NotificationPage;
