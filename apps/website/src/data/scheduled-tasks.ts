import { z } from "zod";

import { cleanupFileStorage } from "@/server/file-storage/cleanup";
import { retryPendingNotificationPushes } from "@/server/notifications";
import { cleanupExpiredNotificationPushes } from "@/server/db/notifications";
import { retryOutgoingWebhooks } from "@/server/outgoing-webhooks";
import { OUTGOING_WEBHOOK_TYPE_DISCORD_CHANNEL } from "@/server/discord";
import { createRegularCalendarEvents } from "@/server/db/calendar-events";
import { removeInvalidClips, populateClips } from "@/server/clips";

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
      task: z.function().args(z.date()).returns(z.promise(z.void())),
      label: z.string(),
      interval: durationSchema,
      startDateTime: z.date(),
    }),
  ),
});

const config: ScheduledTasksConfig = {
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
    {
      id: "clips.removeInvalid",
      task: () => removeInvalidClips(),
      label: "Clips: Remove invalid clips",
      startDateTime: new Date(2023, 2, 3, 0, 8, 0),
      interval: { days: 1 },
    },
    {
      id: "clips.populate",
      task: () => populateClips(),
      label:
        "Clips: Retrieves all new clips and inserts them into the database",
      startDateTime: new Date(2023, 2, 3, 0, 8, 0),
      interval: { minutes: 30 },
    },
  ],
};

export async function getScheduledTasksConfig() {
  return config;
}
