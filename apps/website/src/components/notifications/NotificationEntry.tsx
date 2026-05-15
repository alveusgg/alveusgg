import { DateTime } from "luxon";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";

import type { Notification } from "@alveusgg/database";

import { classes } from "@/utils/classes";
import { formatDateTime } from "@/utils/datetime";
import {
  checkUserAgentIsInstalledAsPWA,
  getNotificationVod,
} from "@/utils/notifications";

import { NotificationIcon } from "@/components/notifications/NotificationIcon";

export function NotificationEntry({
  notification,
  inline = false,
}: {
  notification: Notification;
  inline?: boolean;
}) {
  const [showImage, setShowImage] = useState(!!notification.imageUrl);
  useEffect(() => {
    setShowImage(!!notification.imageUrl);
  }, [notification.imageUrl]);

  const showVod = !!getNotificationVod(notification);

  const content = (
    <div className={classes("flex", inline ? "gap-2" : "h-full flex-col")}>
      <div
        className={classes(
          `
            flex aspect-video shrink-0 items-center justify-center
            overflow-hidden rounded-lg bg-alveus-green/30
          `,
          inline ? "my-auto w-32" : "mb-2 w-full",
        )}
      >
        {showImage && notification.imageUrl ? (
          // Use an error boundary to catch errors from non-permitted remote image patterns
          <ErrorBoundary onError={() => setShowImage(false)} fallback={null}>
            <Image
              src={notification.imageUrl}
              alt=""
              width={512}
              height={288}
              className="aspect-video w-full object-cover"
              onError={() => setShowImage(false)}
            />
          </ErrorBoundary>
        ) : (
          <NotificationIcon notification={notification} />
        )}
      </div>

      <div className="flex grow flex-col">
        <p className="font-bold">{notification.title}</p>
        {notification.message && <p>{notification.message}</p>}

        <div className="mt-auto flex items-center gap-2 text-sm opacity-70">
          <time
            dateTime={notification.createdAt.toISOString()}
            title={formatDateTime(notification.createdAt)}
          >
            {DateTime.fromJSDate(notification.createdAt).toRelative({
              locale: "en-US",
            })}
          </time>

          {showVod && (
            <>
              <div className="mt-0.5 size-1.5 rounded-full bg-alveus-green-800" />
              <p>VoD available</p>
            </>
          )}
        </div>
      </div>
    </div>
  );

  if (notification.linkUrl || showVod) {
    return (
      <Link
        href={`/notifications/${notification.id}`}
        target={checkUserAgentIsInstalledAsPWA() ? undefined : "_blank"}
        className="contents"
      >
        {content}
      </Link>
    );
  }

  return content;
}
