import { getSession } from "next-auth/react";
import type { GetSessionParams } from "next-auth/react";
import type { PermissionConfig } from "@/config/permissions";
import { checkRolesGivePermission, permissions } from "@/config/permissions";
import { notEmpty } from "@/utils/helpers";
import { checkIsSuperUserSession, checkPermissions } from "@/server/utils/auth";
import { getRolesForUser } from "@/server/db/users";

const menuItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    permission: permissions.viewDashboard,
  },
  {
    label: "Notifications",
    href: "/admin/notifications",
    permission: permissions.manageNotifications,
  },
  {
    label: "Forms",
    href: "/admin/forms",
    permission: permissions.manageForms,
  },
  {
    label: "Show & Tell",
    href: "/admin/show-and-tell",
    permission: permissions.manageShowAndTell,
  },
  {
    label: "Activity Feed",
    href: "/admin/activity-feed",
    permission: permissions.viewActivityFeed,
  },
  {
    label: "Users & Roles",
    href: "/admin/users",
    permission: permissions.manageUsersAndRoles,
  },
  {
    label: "Twitch API",
    href: "/admin/twitch",
    permission: permissions.manageTwitchApi,
  },
];

export async function getAdminSSP(
  context: GetSessionParams,
  permission: PermissionConfig
) {
  const session = await getSession(context);

  if (session?.user) {
    const hasPermissions = await checkPermissions(permission, session.user.id);
    if (hasPermissions) {
      const roles = await getRolesForUser(session.user.id);
      const isSuperUser = checkIsSuperUserSession(session);

      const filteredMenuItems = menuItems
        .map((item) =>
          isSuperUser || checkRolesGivePermission(roles, item.permission)
            ? { label: item.label, href: item.href }
            : undefined
        )
        .filter(notEmpty);

      return {
        isSuperUser,
        menuItems: filteredMenuItems,
      };
    }
  }
  return false;
}
