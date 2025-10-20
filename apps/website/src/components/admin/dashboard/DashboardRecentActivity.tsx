import Link from "next/link";

import { trpc } from "@/utils/trpc";

const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 1000 / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
};

export function DashboardRecentActivity() {
  const activity = trpc.adminDashboard.getRecentActivity.useQuery(undefined, {
    refetchInterval: 45_000, // Refresh every 45 seconds (reduced frequency)
    staleTime: 30_000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: false, // Don't refetch when tab becomes active
  });

  if (!activity.data) {
    return <p className="text-gray-400">Loading recent activity...</p>;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Recent Show & Tell */}
      <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
        <h3 className="mb-3 flex items-center gap-2 font-semibold">
          <span>📸</span> Recent Show & Tell
        </h3>
        {activity.data.recentShowAndTell.length === 0 ? (
          <p className="text-sm text-gray-400">No recent posts</p>
        ) : (
          <ul className="space-y-2">
            {activity.data.recentShowAndTell.map((post) => (
              <li
                key={post.id}
                className="flex items-start justify-between gap-2 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/show-and-tell`}
                    className="truncate font-medium text-blue-300 hover:text-blue-200"
                  >
                    {post.title}
                  </Link>
                  <p className="text-xs text-gray-400">
                    by {post.user?.name || "Anonymous"}
                    {post.approvedAt && (
                      <span className="ml-1 text-green-400">✓</span>
                    )}
                  </p>
                </div>
                <span className="text-xs whitespace-nowrap text-gray-500">
                  {formatRelativeTime(post.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Recent Notifications */}
      <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
        <h3 className="mb-3 flex items-center gap-2 font-semibold">
          <span>🔔</span> Recent Notifications
        </h3>
        {activity.data.recentNotifications.length === 0 ? (
          <p className="text-sm text-gray-400">No recent notifications</p>
        ) : (
          <ul className="space-y-2">
            {activity.data.recentNotifications.map((notification) => (
              <li
                key={notification.id}
                className="flex items-start justify-between gap-2 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/notifications`}
                    className="truncate font-medium text-blue-300 hover:text-blue-200"
                  >
                    {notification.title || notification.message}
                  </Link>
                  <p className="text-xs text-gray-400">
                    {notification.isPush && "📱"}
                    {notification.isDiscord && "💬"}
                  </p>
                </div>
                <span className="text-xs whitespace-nowrap text-gray-500">
                  {formatRelativeTime(notification.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
