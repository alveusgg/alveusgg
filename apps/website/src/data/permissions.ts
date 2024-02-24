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
  manageShowAndTell: {
    requiredRole: "showAndTell",
  },
  manageForms: {
    requiredRole: "forms",
  },
  manageBingos: {
    requiredRole: "bingos",
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
  manageShortLinks: {
    requiredRole: "shortLinks",
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
