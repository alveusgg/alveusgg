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
          <li
            key={notification.id}
            className="border-t border-t-white/20 px-4 py-1 first:border-t-0 hover:bg-black/20"
          >
            <NotificationEntry notification={notification} />
          </li>
        ))}
      </ul>
    </div>
  );
}
