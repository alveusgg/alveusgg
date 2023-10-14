import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Notification } from "@prisma/client";
import { DateTime } from "luxon";

import { NotificationIcon } from "@/components/notifications/NotificationIcon";
import { ShareButton } from "@/components/shared/ShareButton";
import DateTimeComponent from "@/components/content/DateTime";
import { env } from "@/env/index.mjs";
import { AddEventButton } from "@/components/shared/AddEventButton";
import { formatDateTime } from "@/utils/datetime";
import IconChevronRight from "@/icons/IconChevronRight";

export function Announcement({ notification }: { notification: Notification }) {
  const relativeNotificationUrl = `/notifications/${notification.id}`;
  const fullAbsoluteNotificationUrl = new URL(
    relativeNotificationUrl,
    env.NEXT_PUBLIC_BASE_URL,
  ).toString();
  const title = notification.title || "Alveus Sanctuary Announcement";
  const event = useMemo(
    () =>
      notification.scheduledStartAt
        ? {
            id: notification.id,
            title,
            description: notification.message,
            startTime: notification.scheduledStartAt,
            endTime: notification.scheduledEndAt,
            url: fullAbsoluteNotificationUrl,
          }
        : null,
    [
      notification.id,
      title,
      notification.message,
      notification.scheduledStartAt,
      notification.scheduledEndAt,
      fullAbsoluteNotificationUrl,
    ],
  );

  let heading = (
    <>
      {notification.scheduledStartAt !== null ||
      notification.scheduledEndAt !== null ? (
        <span>
          {notification.scheduledStartAt && (
            <>
              Begins:{" "}
              <DateTimeComponent
                date={notification.scheduledStartAt}
                format={{
                  time: "minutes",
                  style: "short",
                  timezone: true,
                }}
              />
            </>
          )}
          {notification.scheduledStartAt && notification.scheduledEndAt && (
            <>{" • "}</>
          )}
          {notification.scheduledEndAt && (
            <>
              Ends:{" "}
              <DateTimeComponent
                date={notification.scheduledEndAt}
                format={{
                  time: "minutes",
                  style: "short",
                  timezone: true,
                }}
              />
            </>
          )}
        </span>
      ) : (
        <time
          dateTime={notification.createdAt.toISOString()}
          title={formatDateTime(notification.createdAt)}
        >
          Created{" "}
          {DateTime.fromJSDate(notification.createdAt).toRelative({
            locale: "en-US",
          })}
        </time>
      )}
      <h3 className="text-2xl font-bold">
        {title}
        {notification.linkUrl && (
          <IconChevronRight className="ml-0.5 inline-block h-4 w-4" />
        )}
      </h3>
    </>
  );

  if (notification.linkUrl) {
    heading = (
      <Link
        className="cursor-pointer transition-colors hover:text-blue-600 hover:underline"
        target="_blank"
        href={relativeNotificationUrl}
      >
        {heading}
      </Link>
    );
  }

  const content = (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-4">
          <header className="flex flex-1 flex-col">{heading}</header>

          <NotificationIcon notification={notification} />
        </div>

        {notification.imageUrl && (
          <div className="my-2 h-auto max-w-full self-start overflow-hidden rounded">
            <Image
              src={notification.imageUrl}
              className="w-full"
              width={800}
              height={800}
              alt=""
            />
          </div>
        )}

        {notification.message && <p className="my-2">{notification.message}</p>}
      </div>

      <div className="mt-3 flex items-center justify-end gap-1 border-t py-2 text-sm">
        {event && <AddEventButton event={event} />}
        <ShareButton
          url={fullAbsoluteNotificationUrl}
          title={title}
          text={notification.message}
        />
      </div>
    </div>
  );

  return (
    <article className="flex gap-3 rounded-xl bg-alveus-green/30 px-4 py-2">
      {content}
    </article>
  );
}
