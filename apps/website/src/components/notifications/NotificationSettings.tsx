import { useEffect, useState } from "react";
import {
  isNotificationsSupported,
  isWebPushSupported,
} from "../../utils/push-subscription";
import { ErrorMessage, NotificationPermission } from "./NotificationPermission";
import { NotificationSettingsForm } from "./NotificationSettingsForm";

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
    <>
      <p className="leading-tight">
        Get notified when stream content takes place, new videos are released or
        the Alveus team has any other announcements to make!
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
    </>
  );
};
