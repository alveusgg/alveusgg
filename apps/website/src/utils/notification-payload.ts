import { z } from "zod/v4";

export type NotificationPayload = z.infer<typeof notificationPayloadSchema>;
export type NotificationOptionsData = z.infer<typeof notificationOptionsSchema>;

export const notificationOptionsSchema = z.object({
  //actions?: NotificationAction[];
  badge: z.string().url(),
  body: z.string(),
  data: z.object({
    notificationId: z.string().cuid(),
    subscriptionId: z.string().cuid(),
  }),
  dir: z.enum(["ltr", "rtl", "auto"]),
  icon: z.string().url().optional(),
  image: z.string().url().optional(),
  lang: z.string().length(2).optional(),
  renotify: z.boolean().optional(),
  requireInteraction: z.boolean().optional(),
  silent: z.boolean().optional(),
  tag: z.string(),
  timestamp: z.number().optional(),
  vibrate: z.number().or(z.array(z.number())).optional(),
});

export const notificationPayloadSchema = z.object({
  title: z.string(),
  options: notificationOptionsSchema,
});
