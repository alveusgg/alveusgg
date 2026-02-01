import { DateTime } from "luxon";
import Link from "next/link";

import type { Notification } from "@alveusgg/database";

import { getNotificationCategory } from "@/data/notifications";

import { formatDateTime } from "@/utils/datetime";
import {
  checkUserAgentIsInstalledAsPWA,
  getNotificationVod,
} from "@/utils/notifications";

import { NotificationIcon } from "@/components/notifications/NotificationIcon";

export function NotificationEntry({
  notification,
}: {
  notification: Notification;
}) {
  const showVod = !!getNotificationVod(notification);

  const categoryLabel =
    notification.tag && getNotificationCategory(notification.tag)?.label;

  const content = (
    <div className="flex w-full items-center gap-3">
      <div className="flex flex-1 flex-col">
        <p className="font-bold">{notification.title}</p>
        {notification.message && <p>{notification.message}</p>}

        <div className="flex items-center gap-2 text-sm opacity-70">
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
      <div title={categoryLabel || undefined}>
        <NotificationIcon notification={notification} />
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
