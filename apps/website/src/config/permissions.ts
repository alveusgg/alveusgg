import type { UserRole } from "./user-roles";

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
  viewStats: {
    requiredRole: "stats",
  },
  manageShowAndTell: {
    requiredRole: "showAndTell",
  },
  manageForms: {
    requiredRole: "forms",
  },
  manageTwitchApi: {
    requiredRole: "twitchApi",
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
  permissionConfig: PermissionConfig,
) {
  return permissionConfig.requiredRole
    ? roles.includes(permissionConfig.requiredRole)
    : false;
}
