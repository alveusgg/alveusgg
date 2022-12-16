import { useSession } from "next-auth/react";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import OneSignal from "react-onesignal";

import type { NotificationConfig } from "../pages/updates";
import { useRouter } from "next/router";

const categorySlidedownTextOptions = {
  actionMessage:
    "We'd like to show you notifications for the latest news and updates.",
  acceptButton: "Allow",
  cancelButton: "Cancel",

  /* For category slidedown */
  negativeUpdateButton: "Cancel",
  positiveUpdateButton: "Save Preferences",
  updateMessage: "Update your push notification subscription preferences.",
};

async function initializeNotifications(
  userId: string,
  config: NotificationConfig
) {
  if (!process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID) {
    console.error(
      "Cannot show notifications prompt. NEXT_PUBLIC_ONESIGNAL_APP_ID is not set!"
    );
    return;
  }

  await OneSignal.init({
    allowLocalhostAsSecureOrigin: process.env.NODE_ENV === "development",
    subdomain: process.env.NEXT_PUBLIC_ONESIGNAL_SUBDOMAIN || undefined,
    appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
    safari_web_id: process.env.NEXT_PUBLIC_ONESIGNAL_SAFARI_WEB_ID,
    notifyButton: {
      enable: false,
    },
    serviceWorkerPath: "push/onesignal/OneSignalSDKWorker.js",
    serviceWorkerParam: {
      scope: "/push/onesignal/",
    },
    autoResubscribe: true,
    // Your other init options here
    promptOptions: {
      customlink: {
        enabled: true /* Required to use the Custom Link */,
        style: "button" /* Has value of 'button' or 'link' */,
        size: "large" /* One of 'small', 'medium', or 'large' */,
        color: {
          button: "#000000",
          text: "#FFFFFF",
        },
        text: {
          subscribe: "Subscribe now",
          unsubscribe: "Unsubscribe",
        },
        unsubscribeEnabled: true,
      },
      slidedown: {
        prompts: [
          {
            type: "category",
            autoPrompt: false,
            force: true,
            text: categorySlidedownTextOptions,
            categories: [...(config.categories || [])],
          },
        ],
      },
    },
  });
  await OneSignal.setExternalUserId(userId);

  await OneSignal.getNotificationPermission((notificationPermission) => {
    console.log({ notificationPermission });
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //OneSignal.sendTag("foo", "bar").then((_tagsSent) => {
  //  //
  //});
}

async function showPrompt(slidedownPromptOptions: any) {
  await OneSignal.showCategorySlidedown({
    force: true,
    forceSlidedownOverNative: true,
    slidedownPromptOptions: slidedownPromptOptions,
  });
}

export const Notifications: React.FC<{ config: NotificationConfig }> = ({
  config,
}) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [tags, setTags] = useState<Record<string, "1" | "0" | string> | null>(
    null
  );

  const buttonContainerRef = useRef<HTMLDivElement>(null);

  // Ugly workaround to update the tags after pref change
  // We watch for the click event on the allow button in the prompt
  // and then try a few times to get the new tags from the server.
  const updateTags = async () => {
    await OneSignal.getTags((tags) => {
      setTags(tags);
    });
  };

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        event.target instanceof Element &&
        event.target.id === "onesignal-slidedown-allow-button"
      ) {
        setTimeout(updateTags, 100);
        setTimeout(updateTags, 1000);
      }
      // refreshData
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  });

  //const router = useRouter();
  //const refreshData = async () => {
  //  await router.replace(router.asPath);
  //};

  const { data: sessionData } = useSession();
  const handleClick = useCallback(async () => {
    await showPrompt({
      type: "category",
      force: true,
      text: categorySlidedownTextOptions,
      categories: [...(config.categories || [])],
    });
  }, [config]);

  useEffect(() => {
    if (sessionData?.user?.id && !initialized) {
      OneSignal.on("subscriptionChange", function (isSubscribed) {
        console.log("subscriptionChange");
        setIsSubscribed(isSubscribed);
      });
      OneSignal.on("notificationPermissionChange", function (permissionChange) {
        console.log("New permission state:", { permissionChange });
      });

      initializeNotifications(sessionData.user.id, config).then(() => {
        setInitialized(true);
      });
    }
  }, [config, initialized, sessionData]);

  useEffect(() => {
    if (initialized) {
      OneSignal.getTags((tags) => {
        setTags(tags);
      }).then(() => undefined);
      OneSignal.getSubscription().then((isSubscribed) => {
        setIsSubscribed(isSubscribed);
      });
    }
  }, [initialized]);

  return (
    <>
      <h2 className="my-4 text-lg">Your subscription status</h2>
      {isSubscribed && tags && config.categories ? (
        <div className="max-w-[400px] overflow-hidden  rounded-lg border border-alveus-gray">
          <table className="w-full">
            {config.categories?.map((category) => (
              <tr
                className="border-t border-alveus-gray first:border-t-0"
                key={category.tag}
              >
                <th className="p-2 text-left">{category.label}</th>
                <td className="p-2">
                  {tags[category.tag] === "1"
                    ? "✅ Subscribed"
                    : "❌ Not subscribed"}
                </td>
              </tr>
            ))}
          </table>
        </div>
      ) : (
        <p>Not subscribed!</p>
      )}

      <div className="my-8 flex gap-4">
        {isSubscribed && (
          <button
            className="rounded bg-alveus-green py-2 px-4 text-white"
            type="button"
            onClick={handleClick}
          >
            Change preferences
          </button>
        )}

        <div
          className="onesignal-customlink-container"
          ref={buttonContainerRef}
        ></div>
      </div>
    </>
  );
};
