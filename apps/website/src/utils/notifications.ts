import { z } from "zod";

export type NotificationPayload = z.infer<typeof notificationPayloadSchema>;
export type NotificationOptionsData = z.infer<typeof notificationOptionsSchema>;

if ({} as NotificationOptionsData satisfies NotificationOptions) {
  // Weird test to make sure that the types are compatible
}

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

export function checkUserAgentRequiresToBeInstalledAsPWA(): boolean {
  const userAgent: string = window.navigator.userAgent;
  const isSafari: boolean =
    /Safari/.test(userAgent) && !/Chrome|Chromium|CriOS/.test(userAgent);
  const isIOS: boolean = /iPhone|iPad|iPod/.test(userAgent);

  if (!isSafari || !isIOS) {
    return false;
  }
  const match = userAgent.match(/Version\/(\d+)(?:\.(\d+))?/);
  if (!match || !match[1] || !match[2]) {
    return false;
  }

  const majorVersion: number = parseInt(match[1], 10);
  const minorVersion: number = match[2] ? parseInt(match[2], 10) : 0;
  if (majorVersion <= 16 && !(majorVersion === 16 && minorVersion >= 4)) {
    return false;
  }

  return (
    !("standalone" in window.navigator) || window.navigator.standalone !== true
  );
}

export const notificationHelpEntries = {
  "Safari/iOS": {
    label: "Safari 16.4 on iOS (or newer)",
    includes: [/Safari/, /iPhone OS/],
    excludes: [/Chrome|Edge|Firefox|Chromium|CriOS/],
    link: "https://support.apple.com/guide/iphone/change-notification-settings-iph7c3d96bab/ios",
  },
  "Chrome/Android": {
    label: "Google Chrome on Android",
    includes: [/Android/, /Chrome/],
    excludes: [],
    link: "https://support.google.com/chrome/answer/3220216?co=GENIE.Platform%3DAndroid",
  },
  Chrome: {
    label: "Google Chrome on Desktop",
    includes: [/Chrome/],
    excludes: [/Edge/],
    link: "https://support.google.com/chrome/answer/3220216?co=GENIE.Platform%3DDesktop",
  },
  Edge: {
    label: "Microsoft Edge Browser",
    includes: [/Edge/],
    excludes: [],
    link: "https://support.microsoft.com/microsoft-edge/manage-website-notifications-in-microsoft-edge-0c555609-5bf2-479d-a59d-fb30a0b80b2b",
  },
  "Firefox/Android": {
    label: "Mozilla Firefox on Android",
    includes: [/Android/, /Firefox/],
    excludes: [],
    link: "https://support.mozilla.org/kb/manage-notifications-firefox-android",
  },
  Firefox: {
    label: "Mozilla Firefox on Desktop",
    includes: [/Firefox/],
    excludes: [],
    link: "https://support.mozilla.org/kb/push-notifications-firefox",
  },
  Safari: {
    label: "Apple Safari on Mac OS",
    includes: [/Safari/],
    excludes: [/Chrome|Edge|Firefox|Chromium|CriOS/],
    link: "https://support.apple.com/guide/safari/sfri40734/",
  },
  MacOS: {
    label: "MacOS",
    includes: [/Macintosh/i],
    excludes: [],
    link: "https://support.apple.com/guide/mac-help/change-notifications-settings-mh40583/mac",
  },
} as const;

export function sendWelcomeNotification(
  permission: "default" | "denied" | "granted",
  swr?: ServiceWorkerRegistration | null
) {
  // If the user accepts, let's create a notification
  if (permission === "granted") {
    if (swr) {
      swr
        .showNotification("Welcome!", {
          body: "Push notifications are set up.",
        })
        .then(() => {
          // ignore
        });
    } else {
      new Notification("Welcome!", {
        body: "Notifications are set up.",
      });
    }
  }
}
