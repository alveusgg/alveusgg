import type { FormEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { trpc } from "../../utils/trpc";
import { typeSafeObjectKeys } from "../../utils/helpers";

const SW_PATH = "/push/alveus/AlveusPushWorker.js";

type UidOption = boolean | { value: string; signature?: string };
type TagsOption = { tags?: Array<string>; replaceTags?: Array<string> };

type Options = TagsOption & {
  uid?: UidOption;
};

const notificationHelp = {
  "Chrome/Android": {
    label: "Google Chrome on Android",
    tests: [/Android/i, /Chrome/i],
    link: "https://support.google.com/chrome/answer/3220216?co=GENIE.Platform%3DAndroid",
  },
  Chrome: {
    label: "Google Chrome on Desktop",
    tests: [/Chrome/i],
    link: "https://support.google.com/chrome/answer/3220216?co=GENIE.Platform%3DDesktop",
  },
  Edge: {
    label: "Microsoft Edge Browser",
    tests: [/Edge/i],
    link: "https://support.microsoft.com/en-us/microsoft-edge/manage-website-notifications-in-microsoft-edge-0c555609-5bf2-479d-a59d-fb30a0b80b2b",
  },
  "Firefox/Android": {
    label: "Mozilla Firefox on Android",
    tests: [/Android/i, /Firefox/i],
    link: "https://support.mozilla.org/en-US/kb/manage-notifications-firefox-android",
  },
  Firefox: {
    label: "Mozilla Firefox on Desktop",
    tests: [/Firefox/i],
    link: "https://support.mozilla.org/en-US/kb/push-notifications-firefox",
  },
};

/*
 * TODO: Check if applicationServerKey changed?
 * TODO: Check expirationTime?
 */

const isNotificationsSupported =
  typeof window !== "undefined" && "Notification" in window;

const getNotificationsPermission = () =>
  isNotificationsSupported && Notification.permission;

const sWR: Promise<ServiceWorkerRegistration> = new Promise(
  (resolve, reject) => {
    navigator.serviceWorker
      .register(SW_PATH, {
        type: "module",
        updateViaCache: "none",
      })
      .then((registration) => {
        console.info("push service worker registered", registration);
        resolve(registration);
      })
      .catch(() => {
        console.error("error registering push service worker");
        reject();
      });
  }
);

async function getSubscription() {
  const registration = await sWR;
  if (!("pushManager" in registration)) {
    console.log("Push not supported!");
    return null;
  }

  const pushManager = registration.pushManager;

  const subscription = await pushManager.getSubscription();
  if (subscription) {
    return subscription;
  }

  try {
    console.log("trying to subscribe");
    const subscription = await pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY,
    });

    if (subscription) {
      return subscription;
    }
  } catch (error) {
    console.error(error);
  }
  return null;
}

//async function setSubscriptionUid(options: UidOption) {
//  const subscription = await getSubscription();
//  if (subscription === null) return;
//
//  await sendSubscriptionToServer(subscription, options, undefined, true);
//}
//
//async function setSubscriptionTags(replaceTags: TagsOption["replaceTags"]) {
//  const subscription = await getSubscription();
//  if (subscription === null) return;
//
//  await sendSubscriptionToServer(
//    subscription,
//    undefined,
//    { replaceTags },
//    true
//  );
//}
//
//async function getSubscriptionStatus(options: Options = {}) {
//  if (Notification.permission === "denied") {
//    return false;
//  }
//
//  const subscription = await getSubscription();
//  if (subscription) {
//    const status = await getSubscriptionFromServer(subscription);
//    if (status) {
//      return {
//        tags: status.tags,
//        uid: status.uid,
//      };
//    }
//  }
//
//  return false;
//}
//
//async function subscribe(options: Options = {}) {
//  if (Notification.permission === "denied") {
//    return false;
//  }
//
//  try {
//    const subscription = await (
//      await sWR
//    ).pushManager.subscribe({
//      userVisibleOnly: true,
//      applicationServerKey: applicationServerKey,
//    });
//
//    if (subscription === null) {
//      return false;
//    }
//
//    await sendSubscriptionToServer(subscription, options.uid, {
//      tags: options.tags,
//    });
//    return true;
//  } catch (error) {
//    console.log(error);
//    return false;
//  }
//}
//
//async function unsubscribe(options: Options = {}) {
//  const subscription = await getSubscription();
//  if (subscription === null) {
//    return;
//  }
//
//  await removeSubscriptionFromServer(subscription, options.uid, {
//    tags: options.tags,
//  });
//}

export const NotificationSettings: React.FC = () => {
  const notificationsPermission = getNotificationsPermission();
  const tags = null;

  const swrQuery = useQuery({
    queryKey: ["alveus-push-swr"],
    queryFn: async () => {
      return await sWR;
    },
    enabled: typeof window !== "undefined",
  });

  const subscriptionQuery = useQuery({
    queryKey: ["alveus-push-subscription", notificationsPermission],
    queryFn: async () => {
      if (notificationsPermission === "granted") {
        return await getSubscription();
      }
    },
    enabled: typeof window !== "undefined",
  });

  const config = trpc.notificationsConfig.getConfiguration.useQuery();
  const register = trpc.pushSubscription.register.useMutation();
  const subscriptionStatus = trpc.pushSubscription.getStatus.useQuery(
    {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      endpoint: subscriptionQuery.data?.endpoint,
    },
    {
      enabled:
        typeof window !== "undefined" &&
        subscriptionQuery.status === "success" &&
        subscriptionQuery.data?.endpoint !== undefined,
    }
  );

  useEffect(() => {
    const isClientSubscribed =
      subscriptionQuery.status === "success" &&
      subscriptionQuery.data?.endpoint;
    const isServerRegistered =
      subscriptionStatus.status === "success" &&
      subscriptionStatus.data !== null;

    if (
      isClientSubscribed &&
      !isServerRegistered &&
      register.isIdle &&
      subscriptionQuery.data
    ) {
      register.mutate({
        endpoint: subscriptionQuery.data.endpoint,
        p256dh: subscriptionQuery.data.toJSON().keys?.auth,
        auth: subscriptionQuery.data.toJSON().keys?.p256dh,
      });
    }
  }, [
    register,
    subscriptionQuery.data,
    subscriptionQuery.status,
    subscriptionStatus.data,
    subscriptionStatus.status,
  ]);

  console.log(
    "AlveusNotifications",
    subscriptionQuery.status,
    subscriptionQuery.data,
    subscriptionStatus.status
  );

  const [error, setError] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const setTagsMutation = trpc.pushSubscription.setTags.useMutation({});

  const handleSubscribeClick = useCallback(() => {
    // TODO Subscribe
    Notification.requestPermission().then((permission) => {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
        const swr = swrQuery.data;
        if (swr) {
          swr.showNotification("Welcome!", {
            body: "Push notifications are set up.",
          });
        } else {
          new Notification("Welcome!", {
            body: "Push notifications are set up.",
          });
        }
      } else {
        setError(
          "Notification permission was denied. You will have to enable notifications for this website in your browser settings to receive push notifications."
        );
      }
    });
  }, [swrQuery.data]);

  const showSettings =
    isNotificationsSupported && config.data?.categories.length;
  const enableSettings =
    showSettings &&
    notificationsPermission === "granted" &&
    subscriptionStatus.status === "success";

  const handlePreferencesChange = async (event: Event | FormEvent) => {
    const formEl = formRef.current;

    event.preventDefault();

    if (!enableSettings || !formEl) {
      return;
    }

    const data = new FormData(formEl);
    const tags: Record<string, string> = {};
    config.data?.categories.forEach(({ tag }) => {
      tags[tag] = String(data.has(`tag-${tag}`) ? data.get(`tag-${tag}`) : "0");
    });

    if (subscriptionQuery.data?.endpoint) {
      setTagsMutation.mutate({
        endpoint: subscriptionQuery.data?.endpoint,
        tags: tags,
      });
    }

    return;
  };

  useEffect(() => {
    if (formRef.current) {
      const formEl = formRef.current;

      formEl.addEventListener("change", (e) => handlePreferencesChange(e));

      return () => {
        formEl.removeEventListener("change", (e) => handlePreferencesChange(e));
      };
    }
  });

  return (
    <>
      <h2 className="text-lg font-bold">Notification settings</h2>
      <p className="leading-tight">
        Get notified when exciting Alveus stream content takes place, new videos
        are uploaded or the Alveus team has any other announcements to make!
      </p>

      {!isNotificationsSupported && (
        <p className="rounded-lg bg-red-100 p-4 leading-tight text-red-800">
          Your browser does not support notifications! You can join Discord or
          Follow Twitter instead!
        </p>
      )}

      {error && (
        <p className="rounded-lg bg-red-100 p-4 leading-tight text-red-800">
          Error: {error}
        </p>
      )}

      {isNotificationsSupported && notificationsPermission === "denied" && (
        <div className="rounded-lg bg-red-100 p-4 leading-tight text-red-800">
          <p>
            Notification permission was denied. You will have to enable
            notifications for this website in your browser settings to receive
            push notifications.
          </p>

          <p>Find help for your browser:</p>
          <ul className="py-2">
            {typeSafeObjectKeys(notificationHelp).map((key) => (
              <li
                key={key}
                className="border-t border-red-600 py-2 first:border-t-0"
              >
                <a
                  href={notificationHelp[key].link}
                  rel="noreferrer help external"
                  target="_blank"
                  className="underline"
                >
                  {notificationHelp[key].label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isNotificationsSupported && notificationsPermission !== "granted" && (
        <button
          type="button"
          onClick={handleSubscribeClick}
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 font-medium text-gray-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:text-sm"
        >
          Enable push notifications
        </button>
      )}

      {showSettings && (
        <form
          ref={formRef}
          onSubmit={handlePreferencesChange}
          className={
            enableSettings
              ? ""
              : "pointer-none cursor-default select-none opacity-50"
          }
        >
          <fieldset className="space-y-5">
            <legend className="sr-only">Notifications</legend>

            {config.data?.categories.map((category) => (
              <div className="relative flex items-start" key={category.tag}>
                <div className="flex h-5 items-center">
                  <input
                    id={`tag-${category.tag}`}
                    name={`tag-${category.tag}`}
                    value="1"
                    defaultChecked={tags?.[category.tag] === "1"}
                    type="checkbox"
                    disabled={!enableSettings}
                    className="text-indigo-600 focus:ring-indigo-500 h-4 w-4 rounded border-gray-300"
                  />
                </div>
                <div className="ml-2 text-sm">
                  <label
                    htmlFor={`tag-${category.tag}`}
                    className="font-medium text-gray-200"
                  >
                    {category.label}
                  </label>
                </div>
              </div>
            ))}
          </fieldset>
        </form>
      )}
    </>
  );
};
