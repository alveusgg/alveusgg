import { trpc } from "@/utils/trpc";

export function NotificationStats() {
  const stats = trpc.adminNotifications.getStats.useQuery();

  if (!stats.data) {
    return <p>Loading …</p>;
  }

  return (
    <div>
      <p>Number of notifications sent: {stats.data.totalNotifications}</p>
      <p>
        Number of notification pushes: {stats.data.totalPushes} (
        {stats.data.pendingPushes} pending)
      </p>
    </div>
  );
}
