import { trpc } from "@/utils/trpc";
import { NotificationEntry } from "@/components/notifications/NotificationEntry";

export function RecentNotifications({ tags }: { tags: Array<string> }) {
  const recentNotifications =
    trpc.notifications.getRecentNotificationsForTags.useQuery({ tags });

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
