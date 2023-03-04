import type { UserRole } from "./user-roles";
import { checkIsSuperUserId } from "@/server/utils/auth";
import { getRolesForUser } from "@/server/db/users";

export type PermissionConfig = {
  requiredRole?: UserRole;
  requiresSuperUser?: boolean;
};

export const permissions = {
  viewDashboard: {
    requiredRole: "dashboard",
  },
  viewActivityFeed: {
    requiresSuperUser: true,
  },
  manageShowAndTell: {
    requiredRole: "showAndTell",
  },
  manageGiveaways: {
    requiredRole: "giveaways",
  },
  manageTwitchApi: {
    requiresSuperUser: true,
  },
  manageUsersAndRoles: {
    requiresSuperUser: true,
  },
  manageNotifications: {
    requiredRole: "notifications",
  },
} as const satisfies Record<string, PermissionConfig>;

export function checkRolesGivePermission(
  roles: string[],
  permissionConfig: PermissionConfig
) {
  return permissionConfig.requiredRole
    ? roles.includes(permissionConfig.requiredRole)
    : false;
}

export async function checkPermissions(
  permissionConfig: PermissionConfig,
  userId?: string
) {
  if (!userId) {
    return false;
  }

  const isSuperUser = checkIsSuperUserId(userId);
  if (isSuperUser) {
    return true;
  }

  if (!permissionConfig.requiresSuperUser && permissionConfig.requiredRole) {
    return (await getRolesForUser(userId)).includes(
      permissionConfig.requiredRole
    );
  }

  return false;
}
