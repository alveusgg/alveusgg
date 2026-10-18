import Link from "next/link";

import { checkRolesGivePermission, permissions } from "@/data/permissions";

import { getEntityStatus } from "@/utils/entity-helpers";
import { trpc } from "@/utils/trpc";

import { DashboardQueryError } from "@/components/admin/dashboard/DashboardQueryError";

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
    refetchInterval: 5 * 60_000, // Refresh every 5 minutes
    staleTime: 30_000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: false, // Don't refetch when tab becomes active
  });

  const { data: session } = trpc.auth.getSession.useQuery();
  const userRoles = session?.user?.roles || [];
  const isSuperUser = session?.user?.isSuperUser || false;

  const canViewShowAndTell =
    isSuperUser ||
    checkRolesGivePermission(userRoles, permissions.manageShowAndTell);
  const canViewNotifications =
    isSuperUser ||
    checkRolesGivePermission(userRoles, permissions.manageNotifications);

  // Don't show anything if user can't view either section
  if (!canViewShowAndTell && !canViewNotifications) {
    return null;
  }

  if (!activity.data) {
    if (activity.isError) {
      return (
        <DashboardQueryError
          section="recent activity"
          retry={() => void activity.refetch()}
        />
      );
    }

    return <p className="text-gray-400">Loading recent activity...</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Recent Show & Tell */}
      {canViewShowAndTell && (
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
          <h3 className="mb-3 flex items-center gap-2 font-semibold">
            <span aria-hidden="true">📸</span> Recent Show & Tell
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
                      href={`/admin/show-and-tell/review/${post.id}`}
                      className="block truncate font-medium text-blue-300 hover:text-blue-200"
                    >
                      {post.title}
                    </Link>
                    <p className="text-xs text-gray-400">
                      by {post.user?.name || "Anonymous"}
                      {getEntityStatus(post) === "approved" && (
                        <span className="ml-1 text-green-400">
                          <span aria-hidden="true">✓</span>
                          <span className="sr-only">approved</span>
                        </span>
                      )}
                    </p>
                  </div>
                  <span className="text-xs whitespace-nowrap text-gray-400">
                    {formatRelativeTime(post.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Recent Notifications */}
      {canViewNotifications && (
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
          <h3 className="mb-3 flex items-center gap-2 font-semibold">
            <span aria-hidden="true">🔔</span> Recent Notifications
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
                      className="block truncate font-medium text-blue-300 hover:text-blue-200"
                    >
                      {notification.title || notification.message}
                    </Link>
                    <p className="text-xs text-gray-400">
                      {notification.isPush && (
                        <span role="img" aria-label="Push">
                          📱
                        </span>
                      )}
                      {notification.isDiscord && (
                        <span role="img" aria-label="Discord">
                          💬
                        </span>
                      )}
                    </p>
                  </div>
                  <span className="text-xs whitespace-nowrap text-gray-400">
                    {formatRelativeTime(notification.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
