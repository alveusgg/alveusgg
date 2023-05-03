import React, { useEffect, useState } from "react";
import Image from "next/image";

import { ArrowUpTrayIcon, PlusIcon } from "@heroicons/react/20/solid";

import {
  isNotificationsSupported,
  isWebPushSupported,
} from "@/utils/push-subscription";

import {
  ErrorMessage,
  NotificationPermission,
} from "@/components/notifications/NotificationPermission";
import { NotificationSettingsForm } from "@/components/notifications/NotificationSettingsForm";
import { checkUserAgentRequiresToBeInstalledAsPWA } from "@/utils/notifications";

import imageIOSShareDialog from "@/assets/notifications-help/ios-share-dialog.png";
import imageIOSAddIcon from "@/assets/notifications-help/ios-add-icon.png";

import Link from "@/components/content/Link";

export const NotificationSettings: React.FC = () => {
  const [isClientSupported, setIsClientSupported] = useState(false);
  const [isInstallAsPWARequired, setIsInstallAsPWARequired] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<
    false | NotificationPermission
  >(false);
  useEffect(() => {
    const isSupported = isNotificationsSupported && isWebPushSupported;
    setIsClientSupported(isSupported);
    setIsInstallAsPWARequired(
      !isSupported && checkUserAgentRequiresToBeInstalledAsPWA()
    );
    setNotificationPermission(
      isNotificationsSupported && Notification.permission
    );
  }, []);

  return (
    <div className="flex flex-col">
      <p className="p-4 leading-tight">
        Get notified for streams and announcements!
      </p>

      {isInstallAsPWARequired && (
        <div className="px-4 pb-4">
          <p>
            You can receive notifications if you add this site to your Home
            Screen.
          </p>

          <ol className="list-decimal pl-5">
            <li className="my-3">
              Tap the <ArrowUpTrayIcon className="inline-block h-6 w-6" /> Share
              button in the menu bar.
            </li>
            <li className="my-3">
              Scroll down the list of options, then tap{" "}
              <em>Add to Home Screen</em>{" "}
              <PlusIcon className="inline-block h-6 w-6" />.
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
        <ErrorMessage>
          <Link href="/updates">
            Your browser sadly does not support notifications! Click here for
            more options.
          </Link>
        </ErrorMessage>
      )}

      {isClientSupported && !isInstallAsPWARequired && (
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
