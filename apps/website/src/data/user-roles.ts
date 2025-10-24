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
  bingos: {
    label: "Bingos",
    description: "Can manage bingos",
  },
  twitchApi: {
    label: "Manage Twitch",
    description: "Can manage twitch configuration and credentials",
  },
  shortLinks: {
    label: "Short links",
    description: "Can manage short links",
  },
  calendarEvents: {
    label: "Calendar Events",
    description: "Can manage calendar events",
  },
  ptzControl: {
    label: "PTZ Control",
    description: "Can manage live cam controls",
  },
  roundsChecks: {
    label: "Rounds Checks",
    description: "Can manage rounds checks",
  },
  donations: {
    label: "Donations",
    description: "Can view and manage donation statistics",
  },
} as const satisfies Record<string, UserRoleConfig>;

export function isValidUserRole(role: string) {
  return Object.keys(userRoles).includes(role);
}
