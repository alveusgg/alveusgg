import { NotificationEntry } from "@/components/notifications/NotificationEntry";
import { trpc } from "@/utils/trpc";

export function RecentNotifications({ tags }: { tags: Array<string> }) {
  const recentNotifications =
    trpc.notifications.getRecentNotificationsForTags.useQuery({ tags });

  if (recentNotifications.isLoading) {
    return <p className="">Loading recent notifications...</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
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
