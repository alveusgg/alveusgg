import Link from "next/link";
import { type Notification } from "@prisma/client";

import { DateTime } from "luxon";
import { BellAlertIcon } from "@heroicons/react/20/solid";
import { usePushSubscription } from "@/utils/push-subscription";
import { trpc } from "@/utils/trpc";

import { getNotificationCategory } from "@/config/notifications";
import IconTwitch from "@/icons/IconTwitch";
import { formatDateTime } from "@/utils/datetime";
import type { NotificationPermission } from "./NotificationPermission";

function NotificationEntry({ notification }: { notification: Notification }) {
  const categoryLabel =
    notification.tag && getNotificationCategory(notification.tag)?.label;

  let icon = <BellAlertIcon className="h-4 w-4 opacity-50" />;
  const link = notification.linkUrl;
  if (link) {
    if (link.match(/https:\/\/(www\.)?twitch\.tv\//)) {
      icon = <IconTwitch className="h-4 w-4 opacity-50" />;
    }
  }

  const content = (
    <>
      <div className="flex items-center gap-3">
        <div title={categoryLabel || undefined}>{icon}</div>
        <div className="flex flex-col">
          <span>{notification.title}</span>
          <time
            className="text-sm text-white/50"
            dateTime={notification.createdAt.toISOString()}
            title={formatDateTime(notification.createdAt)}
          >
            {DateTime.fromJSDate(notification.createdAt).toRelativeCalendar()}
          </time>
        </div>
      </div>
    </>
  );

  return (
    <li className="border-t border-t-white/20 px-4 py-1 first:border-t-0 hover:bg-black/20">
      {link ? (
        <Link className="contents" rel="noreferrer" target="_blank" href={link}>
          {content}
        </Link>
      ) : (
        content
      )}
    </li>
  );
}

export function RecentNotifications({
  notificationPermission,
}: {
  notificationPermission: NotificationPermission | false;
}) {
  const { tags } = usePushSubscription(notificationPermission);
  const activeTags = Object.entries(tags)
    .filter(([_, value]) => value === "1")
    .map(([key, _]) => key);

  const recentNotifications =
    trpc.notifications.getRecentNotificationsForTags.useQuery({
      tags: activeTags,
    });

  return (
    <ul>
      {recentNotifications.data?.map((notification) => (
        <NotificationEntry key={notification.id} notification={notification} />
      ))}
    </ul>
  );
}
