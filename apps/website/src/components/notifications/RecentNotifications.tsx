import { classes } from "@/utils/classes";
import { trpc } from "@/utils/trpc";

import { NotificationEntry } from "@/components/notifications/NotificationEntry";

const styles = [
  "opacity-100",
  "opacity-95",
  "opacity-90",
  "opacity-85",
  "opacity-80",
  "opacity-75",
  "opacity-70",
  "opacity-65",
  "opacity-60",
  "opacity-55",
  "opacity-50",
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
            styles[idx] ?? "opacity-50",
            "flex items-center gap-3 rounded-xl bg-alveus-green/30 px-4 py-2 transition-transform hover:scale-102 hover:bg-alveus-green/40",
          )}
        >
          <NotificationEntry notification={notification} />
        </li>
      ))}
    </ul>
  );
}
