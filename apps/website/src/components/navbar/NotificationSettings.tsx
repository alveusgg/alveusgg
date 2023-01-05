import { useState } from "react";
import {
  isNotificationsSupported,
  isWebPushSupported,
} from "../../utils/push-subscription";
import { ErrorMessage, NotificationPermission } from "./NotificationPermission";
import { NotificationSettingsForm } from "./NotificationSettingsForm";

export const NotificationSettings: React.FC = () => {
  const [notificationPermission, setNotificationPermission] = useState(
    () => isNotificationsSupported && Notification.permission
  );

  return (
    <>
      <h2 className="text-lg font-bold">Notification settings</h2>
      <p className="leading-tight">
        Get notified when exciting Alveus stream content takes place, new videos
        are uploaded or the Alveus team has any other announcements to make!
      </p>

      {!isNotificationsSupported || !isWebPushSupported ? (
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
    </>
  );
};
