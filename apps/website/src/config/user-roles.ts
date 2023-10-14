export type UserRole = keyof typeof userRoles;
export type UserRoleConfig = { label: string; description: string };

export const userRoles = {
  dashboard: {
    label: "Dashboard",
    description: "Has access to the admin dashboard",
  },
  showAndTell: {
    label: "Show and Tell",
    description: "Can review, approve and delete Show and Tell submissions",
  },
  notifications: {
    label: "Notifications",
    description: "Can send notifications to users",
  },
  forms: {
    label: "Forms",
    description: "Can manage forms",
  },
  twitchApi: {
    label: "Manage Twitch",
    description: "Can manage twitch configuration and credentials",
  },
} as const satisfies Record<string, UserRoleConfig>;

export function isValidUserRole(role: string) {
  return Object.keys(userRoles).includes(role);
}
