import type { Notification } from "@/server/db/client";

import IconNotificationAlert from "@/icons/IconNotificationAlert";
import IconTwitch from "@/icons/IconTwitch";
import IconYouTube from "@/icons/IconYouTube";

const iconProps = { className: "h-6 w-6" };

export function NotificationIcon({
  notification,
}: {
  notification: Notification;
}) {
  let icon = <IconNotificationAlert {...iconProps} />;
  const link = notification.linkUrl;
  if (link) {
    if (link.match(/https:\/\/(www\.)?twitch\.tv\//)) {
      icon = <IconTwitch {...iconProps} />;
    } else if (link.match(/https:\/\/(www\.)?(youtube\.com|youtu\.be)\//)) {
      icon = <IconYouTube {...iconProps} />;
    }
  }
  return icon;
}
