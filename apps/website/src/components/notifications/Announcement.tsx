import { DateTime } from "luxon";
import Link from "next/link";
import type { Notification } from "@prisma/client";

import { formatDateTime } from "@/utils/datetime";
import { NotificationIcon } from "@/components/notifications/NotificationIcon";

export function Announcement({ notification }: { notification: Notification }) {
  return (
    <li>
      <Link
        href={`/notifications/${notification.id}`}
        target="_blank"
        className="flex items-center gap-3 rounded-xl bg-alveus-green/30 px-4 py-2 transition-transform hover:scale-102 hover:bg-alveus-green/40"
      >
        <div className="flex flex-1 flex-col">
          <strong className="text-2xl">{notification.title}</strong>
          <time
            className="text-sm opacity-70"
            dateTime={notification.createdAt.toISOString()}
            title={formatDateTime(notification.createdAt)}
          >
            {DateTime.fromJSDate(notification.createdAt).toRelativeCalendar()}
          </time>
        </div>
        <div>
          <NotificationIcon notification={notification} />
        </div>
      </Link>
    </li>
  );
}
