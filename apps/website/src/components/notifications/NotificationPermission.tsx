import { useCallback } from "react";

import {
  isNotificationsSupported,
  usePushServiceWorker,
} from "@/utils/push-subscription";
import {
  notificationHelpEntries,
  sendWelcomeNotification,
} from "@/utils/notifications";
import { typeSafeObjectKeys } from "@/utils/helpers";

import { NotificationErrorMessage } from "@/components/notifications/NotificationErrorMessage";

export const NotificationPermission: React.FC<{
  notificationPermission: NotificationPermission | false;
  updateNotificationPermission: (perm: NotificationPermission) => void;
}> = ({ notificationPermission, updateNotificationPermission }) => {
  const swr = usePushServiceWorker();
  const handleSubscribeClick = useCallback(() => {
    if (isNotificationsSupported && Notification.permission === "denied") {
      alert("Notification permission was denied!");
    }

    Notification.requestPermission().then((permission) => {
      updateNotificationPermission(permission);
      sendWelcomeNotification(permission, swr);
    });
  }, [updateNotificationPermission, swr]);

  if (notificationPermission === "granted") {
    return null;
  }

  if (notificationPermission === "denied") {
    return (
      <div className="mx-4 mb-4">
        <NotificationErrorMessage>
          <p>
            Notification permissions were denied. You need to enable
            notifications for this site in your browser settings.
          </p>

          <p className="mt-2">How to enable notifications in your browser:</p>
          <ul className="py-2">
            {typeSafeObjectKeys(notificationHelpEntries).map((key) => {
              const entry = notificationHelpEntries[key];
              const matches = entry.includes.every((regex) =>
                regex.test(navigator.userAgent),
              );
              if (!matches) {
                return null;
              }

              const excluded =
                entry.excludes.length &&
                entry.excludes.some((regex) => regex.test(navigator.userAgent));
              if (excluded) {
                return null;
              }

              return (
                <li
                  key={key}
                  className="border-t border-red-600 py-2 first:border-t-0"
                >
                  <a
                    href={notificationHelpEntries[key].link}
                    rel="noreferrer help external"
                    target="_blank"
                    className="underline"
                  >
                    {notificationHelpEntries[key].label}
                  </a>
                </li>
              );
            })}
          </ul>
        </NotificationErrorMessage>
      </div>
    );
  }
  return (
    <div className="m-4">
      <button
        type="button"
        onClick={handleSubscribeClick}
        className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 font-medium text-gray-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:text-sm"
      >
        Enable push notifications
      </button>
    </div>
  );
};
