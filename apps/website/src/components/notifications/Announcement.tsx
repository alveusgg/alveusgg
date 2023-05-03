import { DateTime } from "luxon";
import Link from "next/link";
import type { Notification } from "@prisma/client";
import { BellAlertIcon } from "@heroicons/react/20/solid";

import { formatDateTime } from "@/utils/datetime";
import IconTwitch from "@/icons/IconTwitch";
import IconYouTube from "@/icons/IconYouTube";

const iconProps = { className: "h-6 w-6" };
export function Announcement({ notification }: { notification: Notification }) {
  let icon = <BellAlertIcon {...iconProps} />;
  const link = notification.linkUrl;
  if (link) {
    if (link.match(/https:\/\/(www\.)?twitch\.tv\//)) {
      icon = <IconTwitch {...iconProps} />;
    } else if (link.match(/https:\/\/(www\.)?(youtube\.com|youtu\.be)\//)) {
      icon = <IconYouTube {...iconProps} />;
    }
  }

  return (
    <li>
      <Link
        href={`/notifications/${notification.id}`}
        target="_blank"
        className="flex items-center gap-3 rounded-xl bg-alveus-green/30 px-4 py-2 hover:bg-alveus-green/40"
      >
        <div className="flex flex-1 flex-col">
          <strong className="text-2xl">{notification.title}</strong>
          <time
            className="text-sm"
            dateTime={notification.createdAt.toISOString()}
            title={formatDateTime(notification.createdAt)}
          >
            {DateTime.fromJSDate(notification.createdAt).toRelativeCalendar()}
          </time>
        </div>
        <div>{icon}</div>
      </Link>
    </li>
  );
}
