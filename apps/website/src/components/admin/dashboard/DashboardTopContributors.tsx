import Image from "next/image";

import { checkRolesGivePermission, permissions } from "@/data/permissions";

import { trpc } from "@/utils/trpc";

export function DashboardTopContributors() {
  const contributors = trpc.adminDashboard.getTopContributors.useQuery();
  const { data: session } = trpc.auth.getSession.useQuery();
  const userRoles = session?.user?.roles || [];
  const isSuperUser = session?.user?.isSuperUser || false;

  const canViewShowAndTell =
    isSuperUser ||
    checkRolesGivePermission(userRoles, permissions.manageShowAndTell);

  // Don't show if user doesn't have Show & Tell permissions
  if (!canViewShowAndTell) {
    return null;
  }

  if (!contributors.data) {
    return <p className="text-gray-400">Loading top contributors...</p>;
  }

  if (contributors.data.length === 0) {
    return <p className="text-gray-400">No contributors yet</p>;
  }

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
      <h3 className="mb-4 flex items-center gap-2 font-semibold">
        <span>🏆</span> Top Show & Tell Contributors
      </h3>
      <div className="space-y-3">
        {contributors.data.slice(0, 5).map((contributor, idx) => (
          <div
            key={contributor.userId}
            className="flex items-center gap-3 rounded-lg bg-gray-900/50 p-2"
          >
            <div className="to-orange-500 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 text-sm font-bold text-white">
              {idx + 1}
            </div>
            {contributor.userImage ? (
              <Image
                src={contributor.userImage}
                alt={contributor.userName || "User"}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gray-700"></div>
            )}
            <div className="flex-1">
              <p className="font-medium">{contributor.userName}</p>
              <p className="text-xs text-gray-400">
                {contributor.postCount} post
                {contributor.postCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
