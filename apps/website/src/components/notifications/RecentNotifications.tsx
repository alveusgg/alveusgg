import { classes } from "@/utils/classes";
import { trpc } from "@/utils/trpc";

import { NotificationEntry } from "@/components/notifications/NotificationEntry";

const backgrounds = [
  "bg-alveus-green/40 hover:bg-alveus-green/50",
  "bg-alveus-green/36 hover:bg-alveus-green/46",
  "bg-alveus-green/32 hover:bg-alveus-green/42",
  "bg-alveus-green/28 hover:bg-alveus-green/38",
  "bg-alveus-green/24 hover:bg-alveus-green/34",
  "bg-alveus-green/20 hover:bg-alveus-green/30",
  "bg-alveus-green/16 hover:bg-alveus-green/26",
  "bg-alveus-green/12 hover:bg-alveus-green/22",
  "bg-alveus-green/10 hover:bg-alveus-green/20",
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
            backgrounds[idx] ?? "bg-alveus-green/10 hover:bg-alveus-green/20",
            "flex items-center gap-3 rounded-xl px-4 py-2 transition-transform hover:scale-102",
          )}
        >
          <NotificationEntry notification={notification} />
        </li>
      ))}
    </ul>
  );
}
