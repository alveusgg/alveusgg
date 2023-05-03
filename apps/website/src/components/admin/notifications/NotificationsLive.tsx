import { trpc } from "@/utils/trpc";
import { NotificationEntry } from "@/components/notifications/NotificationEntry";
import DateTime from "@/components/content/DateTime";

export function NotificationsLive() {
  const recentNotifications =
    trpc.adminNotifications.getRecentNotifications.useQuery(undefined, {
      refetchInterval: 2_000,
    });

  if (!recentNotifications.data) {
    return <p>Loading …</p>;
  }

  return (
    <div>
      <small className="mb-4 block text-base text-gray-400">
        Last updated{" "}
        {recentNotifications.dataUpdatedAt ? (
          <DateTime
            format={{ style: "short", time: "seconds" }}
            date={new Date(recentNotifications.dataUpdatedAt)}
          />
        ) : (
          "-/-"
        )}
        {":"}
      </small>

      <ul>
        {recentNotifications.data?.map((notification) => (
          <NotificationEntry
            key={notification.id}
            notification={notification}
          />
        ))}
      </ul>
    </div>
  );
}
