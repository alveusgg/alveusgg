import { getSession } from "next-auth/react";
import type { GetSessionParams } from "next-auth/react";

import { env } from "@/env";

import { checkIsSuperUserSession, checkPermissions } from "@/server/utils/auth";

import type { PermissionConfig } from "@/data/permissions";
import { checkRolesGivePermission, permissions } from "@/data/permissions";

import { DEV_ADMIN_SESSION } from "@/utils/dev-admin-session";
import { notEmpty } from "@/utils/helpers";

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
    label: "Calendar Events",
    href: "/admin/calendar-events",
    permission: permissions.manageCalendarEvents,
  },
  {
    label: "Short Links",
    href: "/admin/short-links",
    permission: permissions.manageShortLinks,
  },
  {
    label: "Forms",
    href: "/admin/forms",
    permission: permissions.manageForms,
  },
  {
    label: "Bingo",
    href: "/admin/bingo",
    permission: permissions.manageBingos,
  },
  {
    label: "Show & Tell",
    href: "/admin/show-and-tell",
    permission: permissions.manageShowAndTell,
  },
  {
    label: "Rounds Checks",
    href: "/admin/rounds-checks",
    permission: permissions.manageRoundsChecks,
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
  permission: PermissionConfig,
) {
  const session =
    env.NODE_ENV === "development" && env.DISABLE_ADMIN_AUTH
      ? DEV_ADMIN_SESSION
      : await getSession(context);

  const user = session?.user;
  if (!user) {
    return false;
  }

  const hasPermissions = checkPermissions(permission, user);
  if (!hasPermissions) {
    return false;
  }

  const isSuperUser = checkIsSuperUserSession(session);

  const filteredMenuItems = menuItems
    .map((item) =>
      isSuperUser || checkRolesGivePermission(user.roles, item.permission)
        ? { label: item.label, href: item.href }
        : undefined,
    )
    .filter(notEmpty);

  return {
    isSuperUser,
    menuItems: filteredMenuItems,
  };
}
