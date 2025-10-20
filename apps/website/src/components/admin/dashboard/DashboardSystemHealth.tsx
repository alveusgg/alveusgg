import { trpc } from "@/utils/trpc";

export function DashboardSystemHealth() {
  const health = trpc.adminDashboard.getSystemHealth.useQuery(undefined, {
    refetchInterval: 60_000, // Refresh every minute
    staleTime: 30_000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: false, // Don't refetch when tab becomes active
  });

  if (!health.data) {
    return (
      <div className="animate-pulse rounded-xl border border-gray-700 bg-gray-800 p-4">
        <div className="h-6 w-32 rounded bg-gray-700"></div>
      </div>
    );
  }

  const issues = [];
  if (health.data.failedWebhooks > 0) {
    issues.push({
      level: "warning",
      message: `${health.data.failedWebhooks} failed webhook(s)`,
    });
  }
  if (health.data.expiredFileObjects > 0) {
    issues.push({
      level: "info",
      message: `${health.data.expiredFileObjects} expired file(s) to clean up`,
    });
  }
  if (health.data.pendingNotificationPushes > 10) {
    issues.push({
      level: "warning",
      message: `${health.data.pendingNotificationPushes} pending notification pushes`,
    });
  }
  if (
    health.data.oldestPendingPushAge &&
    health.data.oldestPendingPushAge > 10
  ) {
    issues.push({
      level: "error",
      message: `Oldest pending push is ${health.data.oldestPendingPushAge} minutes old`,
    });
  }

  if (issues.length === 0) {
    return (
      <div className="rounded-xl border border-green-700 bg-green-900/30 p-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✅</span>
          <div>
            <h3 className="font-semibold text-green-300">System Health</h3>
            <p className="text-sm text-green-200">All systems operational</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-yellow-700 bg-yellow-900/30 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-2xl">⚠️</span>
        <h3 className="font-semibold text-yellow-300">System Health</h3>
      </div>
      <ul className="space-y-2">
        {issues.map((issue, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm">
            <span>
              {issue.level === "error"
                ? "🔴"
                : issue.level === "warning"
                  ? "🟡"
                  : "🔵"}
            </span>
            <span className="text-yellow-100">{issue.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
