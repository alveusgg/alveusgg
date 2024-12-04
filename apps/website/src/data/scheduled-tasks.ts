import { cleanupFileStorage } from "@/server/file-storage/cleanup";
import { retryPendingNotificationPushes } from "@/server/notifications";
import { retryOutgoingWebhooks } from "@/server/outgoing-webhooks";
import { OUTGOING_WEBHOOK_TYPE_DISCORD_CHANNEL } from "@/server/discord";

import {
  createRegularCalendarEvents,
  syncDiscordEvents,
  syncTwitchSchedule,
} from "@/server/db/calendar-events";
import { refreshTwitchChannels } from "@/server/db/twitch-channels";
import { cleanupExpiredNotificationPushes } from "@/server/db/notifications";

import { env } from "@/env";

import { typeSafeObjectKeys } from "@/utils/helpers";

import { twitchChannels } from "@/data/calendar-events";

export type ScheduledTasksConfig = {
  tasks: {
    id: string;
    task: (date: Date) => Promise<void>;
    label: string;
    interval: {
      years?: number;
      months?: number;
      weeks?: number;
      days?: number;
      hours?: number;
      minutes?: number;
      seconds?: number;
    };
    startDateTime: Date;
  }[];
};

export const scheduledTasks: ScheduledTasksConfig = {
  tasks: [
    {
      id: "fileStorage.cleanup",
      task: () => cleanupFileStorage({ maxItems: 100 }),
      label: "File storage: Cleanup expired objects",
      startDateTime: new Date(2023, 2, 3, 0, 8, 0),
      interval: { minutes: 10 },
    },
    {
      id: "notificationPushes.retry",
      task: () => retryPendingNotificationPushes(),
      label: "Notifications: Retry pending pushes",
      startDateTime: new Date(2023, 2, 3, 0, 8, 0),
      interval: { seconds: 30 },
    },
    {
      id: "notificationPushes.cleanup",
      task: () => cleanupExpiredNotificationPushes(),
      label: "Notifications: Cleanup expired pushes",
      startDateTime: new Date(2023, 2, 3, 0, 14, 0),
      interval: { minutes: 10 },
    },
    {
      id: "outgoingWebhooks.retry.discordChannel",
      task: () =>
        retryOutgoingWebhooks({ type: OUTGOING_WEBHOOK_TYPE_DISCORD_CHANNEL }),
      label: "Outgoing webhooks: Retry Discord Channel Webhooks",
      startDateTime: new Date(2023, 2, 3, 0, 8, 0),
      interval: { seconds: 30 },
    },
    {
      id: "calendarEvents.regular",
      task: (date) => createRegularCalendarEvents(date),
      label: "Calendar events: Create Regular Events",
      startDateTime: new Date(2024, 7, 21, 0, 8, 0),
      interval: { months: 1 },
    },
    ...typeSafeObjectKeys(twitchChannels).map((channel) => ({
      id: `calendarEvents.twitch.${channel}`,
      task: () => syncTwitchSchedule(channel),
      label: `Calendar events: Sync Twitch Schedule (${channel})`,
      startDateTime: new Date(2024, 9, 30, 0, 0, 0),
      interval: { minutes: 10 },
    })),
    ...(env.DISCORD_CALENDAR_EVENT_GUILD_IDS || []).map((guildId) => ({
      id: `calendarEvents.discord.${guildId}`,
      task: () => syncDiscordEvents(guildId),
      label: `Calendar events: Sync Discord Events (${guildId})`,
      startDateTime: new Date(2024, 11, 4, 0, 0, 0),
      interval: { minutes: 10 },
    })),
    {
      id: "auth.refreshTwitchChannels",
      task: () => refreshTwitchChannels(),
      label: "Auth: Refresh Twitch channels access",
      startDateTime: new Date(2024, 9, 30, 0, 0, 0),
      interval: { minutes: 30 },
    },
  ],
};
