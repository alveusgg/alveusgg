import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";

import {
  isNotificationsSupported,
  isWebPushSupported,
} from "@/utils/push-subscription";
import { checkUserAgentRequiresToBeInstalledAsPWA } from "@/utils/notifications";
import { getIsIos, getIsSafari } from "@/utils/browser-detection";

import { NotificationErrorMessage } from "@/components/notifications/NotificationErrorMessage";
import { NotificationPermission } from "@/components/notifications/NotificationPermission";
import { NotificationSettingsForm } from "@/components/notifications/NotificationSettingsForm";
import Link from "@/components/content/Link";

import imageIOSShareDialog from "@/assets/notifications-help/ios-share-dialog.png";
import imageIOSAddIcon from "@/assets/notifications-help/ios-add-icon.png";
import IconPlus from "@/icons/IconPlus";
import IconUpload from "@/icons/IconUpload";

export function useNotificationStatus() {
  const [isClientSupported, setIsClientSupported] = useState(false);
  const [isInstallAsPWARequired, setIsInstallAsPWARequired] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<
    false | NotificationPermission
  >(false);
  useEffect(() => {
    const isSupported = isNotificationsSupported && isWebPushSupported;
    setIsClientSupported(isSupported);
    setIsInstallAsPWARequired(
      !isSupported && checkUserAgentRequiresToBeInstalledAsPWA(),
    );
    setNotificationPermission(
      isNotificationsSupported && Notification.permission,
    );
  }, []);

  return useMemo(
    () => ({
      isClientSupported,
      isInstallAsPWARequired,
      notificationPermission,
      updateNotificationPermission: setNotificationPermission,
    }),
    [
      isClientSupported,
      isInstallAsPWARequired,
      notificationPermission,
      setNotificationPermission,
    ],
  );
}

export function NotificationSettings() {
  const {
    notificationPermission,
    isClientSupported,
    isInstallAsPWARequired,
    updateNotificationPermission,
  } = useNotificationStatus();

  return (
    <div className="flex flex-col">
      <p className="px-7 pb-2 pt-4 leading-tight">Notification settings</p>

      {isInstallAsPWARequired && (
        <div className="min-w-[300px] px-7 pb-4">
          <p>
            You can receive notifications if you add this site to your Home
            Screen.
          </p>

          <ol className="list-decimal pl-5">
            <li className="my-3">
              Tap the <IconUpload className="inline-block h-6 w-6" /> Share
              button in the menu bar.
            </li>
            <li className="my-3">
              Scroll down the list of options, then tap{" "}
              <em>Add to Home Screen</em>{" "}
              <IconPlus className="inline-block h-6 w-6" />.
            </li>
          </ol>

          <div className="rounded-xl border-t bg-white p-4">
            <Image src={imageIOSShareDialog} alt="" />
          </div>

          <p className="mt-4 text-sm">
            If you don’t see Add to Home Screen, you can add it. Scroll down to
            the bottom of the list, tap <em>Edit Actions …</em>, then tap{" "}
            <Image
              alt=""
              src={imageIOSAddIcon}
              className="inline-block h-6 w-6"
            />{" "}
            <em>Add to Home Screen</em>. The icon appears only on the device
            where you add it.
          </p>
        </div>
      )}

      {!isClientSupported && !isInstallAsPWARequired && (
        <NotificationErrorMessage className="m-3 flex flex-col gap-2">
          <p>Your browser does not support push notifications!</p>

          {getIsIos() && !getIsSafari() && (
            <p>
              Try opening this site in Safari and adding it to your Home Screen.
            </p>
          )}

          <p>
            <Link href="/updates">Click here for more options.</Link>
          </p>
        </NotificationErrorMessage>
      )}

      {isClientSupported && !isInstallAsPWARequired && (
        <>
          <NotificationPermission
            notificationPermission={notificationPermission}
            updateNotificationPermission={updateNotificationPermission}
          />
          <NotificationSettingsForm
            notificationPermission={notificationPermission}
          />
        </>
      )}
    </div>
  );
}
