import type { Notification } from "@prisma/client";
import { DateTime } from "luxon";
import Link from "next/link";

import { NotificationIcon } from "@/components/notifications/NotificationIcon";
import { getNotificationCategory } from "@/data/notifications";
import { formatDateTime } from "@/utils/datetime";

export function NotificationEntry({
  notification,
}: {
  notification: Notification;
}) {
  const categoryLabel =
    notification.tag && getNotificationCategory(notification.tag)?.label;

  const content = (
    <div className="flex w-full items-center gap-3">
      <div className="flex flex-1 flex-col">
        <strong>{notification.title}</strong>
        {notification.message && <span>{notification.message}</span>}
        <time
          className="text-sm opacity-70"
          dateTime={notification.createdAt.toISOString()}
          title={formatDateTime(notification.createdAt)}
        >
          {DateTime.fromJSDate(notification.createdAt).toRelative({
            locale: "en-US",
          })}
        </time>
      </div>
      <div title={categoryLabel || undefined}>
        <NotificationIcon notification={notification} />
      </div>
    </div>
  );

  if (notification.linkUrl) {
    return (
      <Link
        href={`/notifications/${notification.id}`}
        target="_blank"
        className="contents"
      >
        {content}
      </Link>
    );
  }

  return content;
}
