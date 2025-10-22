import { type CalendarEvent } from "@alveusgg/database";

export const scopeLabels = {
  // User
  openid: "OpenID",
  "user:read:email": "User Email (Read)",
  "user:read:follows": "User Follows (Read)",
  "user:read:subscriptions": "User Subscriptions (Read)",
  "user:write:chat": "User Chat (Write)",
  // Chat
  "chat:edit": "Chat (Edit)",
  "chat:read": "Chat (Read)",
  // Moderator
  "moderator:read:followers": "Moderator Followers (Read)",
  // Channel
  "channel:read:charity": "Channel Charity (Read)",
  "channel:read:subscriptions": "Channel Subscriptions (Read)",
  "channel:read:vips": "Channel VIPs (Read)",
  "channel:manage:schedule": "Channel Schedule (Manage)",
} as const satisfies Record<string, string>;

export type Scope = keyof typeof scopeLabels;

export const isScope = (scope: string): scope is Scope => scope in scopeLabels;

export const scopeGroups = {
  default: [
    "openid",
    "user:read:email",
    "user:read:follows",
    "user:read:subscriptions",
  ],
  api: [
    "chat:edit",
    "chat:read",
    "user:write:chat",
    "moderator:read:followers",
    "channel:read:charity",
    "channel:read:subscriptions",
    "channel:read:vips",
    "channel:manage:schedule",
  ],
  chat: ["user:write:chat"],
} as const satisfies Record<string, Scope[]>;

export type ScopeGroup = keyof typeof scopeGroups;

export const isScopeGroup = (group: string): group is ScopeGroup =>
  group in scopeGroups;

interface ChannelData {
  username: string;
  id: string;
  calendarEventFilter?: (event: CalendarEvent) => boolean;
}

export const channels = {
  alveus: {
    username: "AlveusSanctuary",
    id: "636587384",
    calendarEventFilter: (event: CalendarEvent) =>
      /^alveus\b/i.test(event.category) &&
      !/\b(yt|youtube)\b/i.test(event.category),
  },
  maya: {
    username: "Maya",
    id: "235835559",
    calendarEventFilter: (event: CalendarEvent) =>
      /^maya\b/i.test(event.category) &&
      !/\b(yt|youtube)\b/i.test(event.category),
  },
  alveusgg: {
    username: "AlveusGG",
    id: "858050963",
  },
} as const satisfies Record<string, ChannelData>;

export type Channel = keyof typeof channels;

export type ChannelWithCalendarEvents = {
  [K in keyof typeof channels]: (typeof channels)[K] extends {
    calendarEventFilter: Exclude<ChannelData["calendarEventFilter"], undefined>;
  }
    ? K
    : never;
}[keyof typeof channels];

export const isChannelWithCalendarEvents = (
  channel: Channel,
): channel is ChannelWithCalendarEvents => {
  const channelData = channels[channel];
  return "calendarEventFilter" in channelData;
};
