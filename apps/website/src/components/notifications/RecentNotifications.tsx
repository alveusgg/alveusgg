import { trpc } from "@/utils/trpc";

import { NotificationEntry } from "@/components/notifications/NotificationEntry";

export function RecentNotifications({ tags }: { tags: Array<string> }) {
  const recentNotifications =
    trpc.notifications.getRecentNotificationsForTags.useQuery({ tags });

  if (recentNotifications.isPending) {
    return <p className="">Loading recent notifications...</p>;
  }

  return (
    <ul className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
      {recentNotifications.data?.map((notification) => (
        <li
          key={notification.id}
          className="flex items-center gap-3 rounded-xl bg-alveus-green/30 px-4 py-2 transition-transform hover:scale-102 hover:bg-alveus-green/40"
        >
          <NotificationEntry notification={notification} />
        </li>
      ))}
    </ul>
  );
}
