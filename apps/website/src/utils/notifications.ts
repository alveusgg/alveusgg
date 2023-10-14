import type { NotificationOptionsData } from "@/utils/notification-payload";
import { getIsIos, getIsSafari } from "@/utils/browser-detection";
import { welcomeMessage, welcomeTitle } from "@/config/notifications";

if ({} as NotificationOptionsData satisfies NotificationOptions) {
  // Weird test to make sure that the types are compatible
}

export function checkUserAgentRequiresToBeInstalledAsPWA(): boolean {
  if (!getIsSafari() || !getIsIos()) {
    return false;
  }

  const match = window.navigator.userAgent.match(/Version\/(\d+)(?:\.(\d+))?/);
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
  swr?: ServiceWorkerRegistration | null,
) {
  // If the user accepts, let's create a notification
  if (permission === "granted") {
    // If the service worker is registered, and it's ready use that to show the notification
    if (swr) {
      swr
        .showNotification(welcomeTitle, {
          body: welcomeMessage,
        })
        .then(() => {
          // ignore
        });
    } else {
      // Otherwise use the "normal" Notification API
      new Notification(welcomeTitle, {
        body: welcomeMessage,
      });
    }
  }
}
