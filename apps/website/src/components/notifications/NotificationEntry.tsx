import { DateTime } from "luxon";
import Link from "next/link";
import type { Notification } from "@prisma/client";

import { getNotificationCategory } from "@/config/notifications";
import { formatDateTime } from "@/utils/datetime";
import { NotificationIcon } from "@/components/notifications/NotificationIcon";

export function NotificationEntry({
  notification,
}: {
  notification: Notification;
}) {
  const categoryLabel =
    notification.tag && getNotificationCategory(notification.tag)?.label;

  return (
    <Link
      href={`/notifications/${notification.id}`}
      target="_blank"
      className="contents"
    >
      <div className="flex w-full items-center gap-3">
        <div className="flex flex-1 flex-col">
          <strong>{notification.title}</strong>
          <time
            className="text-sm opacity-70"
            dateTime={notification.createdAt.toISOString()}
            title={formatDateTime(notification.createdAt)}
          >
            {DateTime.fromJSDate(notification.createdAt).toRelativeCalendar()}
          </time>
        </div>
        <div title={categoryLabel || undefined}>
          <NotificationIcon notification={notification} />
        </div>
      </div>
    </Link>
  );
}
