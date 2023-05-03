import { trpc } from "@/utils/trpc";

const nf = new Intl.NumberFormat();

export function NotificationStats() {
  const stats = trpc.adminNotifications.getStats.useQuery(undefined, {
    refetchInterval: 20_000,
  });

  if (!stats.data) {
    return <p>Loading …</p>;
  }

  return (
    <div className="flex flex-wrap gap-4">
      <p className="rounded-xl border border-black/80 bg-gray-900 p-4 pb-2">
        <strong className="block text-center text-3xl">
          {nf.format(stats.data.totalNotifications)}
        </strong>
        notifications
      </p>
      <p className="rounded-xl border border-black/80 bg-gray-900 p-3 pb-2">
        <strong className="block text-center text-3xl">
          {nf.format(stats.data.totalSubscriptions)}
        </strong>
        subscriptions
      </p>
      <p className="rounded-xl border border-black/80 bg-green-900 p-3 pb-2">
        <strong className="block text-center text-3xl">
          {nf.format(stats.data.totalPushes)}
        </strong>
        pushes sent
      </p>
      <p className="rounded-xl border border-black/80 bg-yellow-900 p-3 pb-2">
        <strong className="block text-center text-3xl">
          {nf.format(stats.data.pendingPushes)}
        </strong>
        pending
      </p>
    </div>
  );
}
