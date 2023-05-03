import { trpc } from "@/utils/trpc";
import { NotificationEntry } from "@/components/notifications/NotificationEntry";

export function RecentNotifications({ tags }: { tags: Array<string> }) {
  const recentNotifications =
    trpc.notifications.getRecentNotificationsForTags.useQuery({ tags });

  return (
    <ul>
      {recentNotifications.data?.map((notification) => (
        <NotificationEntry key={notification.id} notification={notification} />
      ))}
    </ul>
  );
}
