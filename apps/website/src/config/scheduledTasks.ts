import { z } from "zod";

import { updateSubscriptions } from "../server/tasks/twitch/manage-event-subscriptions";
import { checkLiveStatus } from "../server/tasks/twitch/check-live-status";

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
    })
  ),
});

const config: ScheduledTasksConfig = {
  tasks: [
    {
      id: "twitch.updateEventSubscriptions",
      task: updateSubscriptions,
      label: "Twitch: Update Event Subscriptions",
      startDateTime: new Date(2022, 11, 18, 0, 6, 0),
      interval: { hours: 1 },
    },
    {
      id: "twitch.checkLiveStatus",
      task: checkLiveStatus,
      label: "Twitch: Check Live Status",
      startDateTime: new Date(2022, 11, 18, 0, 0, 0),
      interval: { minutes: 1 },
    },
  ],
};

export async function getScheduledTasksConfig() {
  return config;
}
