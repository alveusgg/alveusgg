import { z } from "zod";

//import { updateSubscriptions } from "@/server/actions/twitch/manage-event-subscriptions";
//import { checkLiveStatus } from "@/server/actions/twitch/check-live-status";
//import { syncRoles } from "@/server/actions/twitch/sync-roles";
import { cleanupFileStorage } from "@/server/file-storage/cleanup";
import { retryPendingNotificationPushes } from "@/server/notifications";
import { cleanupExpiredNotificationPushes } from "@/server/db/notifications";
import { retryOutgoingWebhooks } from "@/server/outgoing-webhooks";
import { OUTGOING_WEBHOOK_TYPE_DISCORD_CHANNEL } from "@/server/discord";

export type ScheduledTasksConfig = z.infer<typeof scheduledTasksConfigSchema>;

const durationSchema = z.object({
  years: z.number().optional(),
  months: z.number().optional(),
  weeks: z.number().optional(),
  days: z.number().optional(),
  hours: z.number().optional(),
  minutes: z.number().optional(),
  seconds: z.number().optional(),
});

const scheduledTasksConfigSchema = z.object({
  tasks: z.array(
    z.object({
      id: z.string(),
      task: z.function().returns(z.promise(z.void())),
      label: z.string(),
      interval: durationSchema,
      startDateTime: z.date(),
    }),
  ),
});

const config: ScheduledTasksConfig = {
  tasks: [
    //{
    //  id: "twitch.syncRoles",
    //  task: syncRoles,
    //  label: "Twitch: Synchronize User Roles",
    //  startDateTime: new Date(2022, 11, 18, 0, 6, 0),
    //  interval: { hours: 1 },
    //},
    //{
    //  id: "twitch.updateEventSubscriptions",
    //  task: updateSubscriptions,
    //  label: "Twitch: Update Event Subscriptions",
    //  startDateTime: new Date(2022, 11, 18, 0, 6, 0),
    //  interval: { hours: 1 },
    //},
    //{
    //  id: "twitch.checkLiveStatus",
    //  task: checkLiveStatus,
    //  label: "Twitch: Check Live Status",
    //  startDateTime: new Date(2022, 11, 18, 0, 0, 0),
    //  interval: { minutes: 1 },
    //},
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
  ],
};

export async function getScheduledTasksConfig() {
  return config;
}
