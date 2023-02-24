export type UserRole = keyof typeof userRoles;
export type UserRoleConfig = { label: string; description: string };

export const userRoles = {
  dashboard: {
    label: "Dashboard",
    description: "Has access to the admin dashboard",
  },
  notifications: {
    label: "Notifications",
    description: "Can send notifications to users",
  },
  giveaways: {
    label: "Giveaways",
    description: "Can manage giveaways",
  },
} as const satisfies Record<string, UserRoleConfig>;

export function isValidUserRole(role: string) {
  return Object.keys(userRoles).includes(role);
}
