import React, { useEffect, useState } from "react";

import {
  isNotificationsSupported,
  isWebPushSupported,
} from "@/utils/push-subscription";

import {
  ErrorMessage,
  NotificationPermission,
} from "@/components/notifications/NotificationPermission";
import { NotificationSettingsForm } from "@/components/notifications/NotificationSettingsForm";

export const NotificationSettings: React.FC = () => {
  const [isClientSupported, setIsClientSupported] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<
    false | NotificationPermission
  >(false);
  useEffect(() => {
    setIsClientSupported(isNotificationsSupported && isWebPushSupported);
    setNotificationPermission(
      isNotificationsSupported && Notification.permission
    );
  }, []);

  return (
    <div className="flex flex-col">
      <p className="p-4 leading-tight">
        Get notified for streams, videos and other announcements!
      </p>

      {!isClientSupported ? (
        <ErrorMessage>
          Your browser does not support notifications! You can join Discord or
          Follow Twitter instead!
        </ErrorMessage>
      ) : (
        <>
          <NotificationPermission
            notificationPermission={notificationPermission}
            setNotificationPermission={setNotificationPermission}
          />
          <NotificationSettingsForm
            notificationPermission={notificationPermission}
          />
        </>
      )}
    </div>
  );
};
