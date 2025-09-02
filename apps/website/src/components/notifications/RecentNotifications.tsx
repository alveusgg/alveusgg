import { classes } from "@/utils/classes";
import { trpc } from "@/utils/trpc";

import { NotificationEntry } from "@/components/notifications/NotificationEntry";

const backgrounds = [
  "bg-alveus-green/40",
  "bg-alveus-green/38",
  "bg-alveus-green/36",
  "bg-alveus-green/34",
  "bg-alveus-green/32",
  "bg-alveus-green/30",
  "bg-alveus-green/28",
  "bg-alveus-green/26",
  "bg-alveus-green/24",
  "bg-alveus-green/22",
];

export function RecentNotifications({ tags }: { tags: Array<string> }) {
  const recentNotifications =
    trpc.notifications.getRecentNotificationsForTags.useQuery({ tags });

  if (recentNotifications.isPending) {
    return <p className="">Loading recent notifications...</p>;
  }

  return (
    <ul className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
      {recentNotifications.data?.map((notification, idx) => (
        <li
          key={notification.id}
          className={classes(
            backgrounds[idx] ?? "bg-alveus-green/20",
            "flex items-center gap-3 rounded-xl px-4 py-2 transition-transform hover:scale-102 hover:bg-alveus-green/40",
          )}
        >
          <NotificationEntry notification={notification} />
        </li>
      ))}
    </ul>
  );
}
