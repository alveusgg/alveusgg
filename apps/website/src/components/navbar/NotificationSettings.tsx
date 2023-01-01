import type { ChangeEvent, FormEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import debounce from "lodash/debounce";

import { trpc } from "../../utils/trpc";
import { typeSafeObjectKeys } from "../../utils/helpers";

const SW_PATH = "/push/alveus/AlveusPushWorker.js";

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

const isServiceWorkersSupported =
  typeof navigator !== "undefined" && "serviceWorker" in navigator;

const pushServiceWorkerRegistration: Promise<ServiceWorkerRegistration | null> =
  new Promise((resolve, reject) => {
    if (isServiceWorkersSupported) {
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
          reject(null);
        });
    } else {
      console.log("service workers are not supported");
      resolve(null);
    }
  });

async function getSubscription() {
  const registration = await pushServiceWorkerRegistration;
  if (!registration || !("pushManager" in registration)) {
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

function usePushSubscription(
  notificationsPermission: NotificationPermission | false
) {
  const clientSubQuery = useQuery({
    queryKey: ["alveus-push-subscription", notificationsPermission],
    queryFn: async () => {
      if (notificationsPermission === "granted") {
        return await getSubscription();
      }
    },
    enabled: typeof window !== "undefined",
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const serverQuery = trpc.pushSubscription.getStatus.useQuery(
    {
      endpoint: clientSubQuery.data?.endpoint as string,
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      enabled:
        typeof window !== "undefined" &&
        clientSubQuery.status === "success" &&
        clientSubQuery.data?.endpoint !== undefined,
    }
  );

  const utils = trpc.useContext();
  const register = trpc.pushSubscription.register.useMutation();
  useEffect(() => {
    const isClientSubscriptionReady =
      clientSubQuery.status === "success" && clientSubQuery.data?.endpoint;
    const isNotRegistered =
      serverQuery.status === "error" ||
      (serverQuery.status === "success" && serverQuery.data === null);
    if (
      isClientSubscriptionReady &&
      isNotRegistered &&
      register.isIdle &&
      clientSubQuery.data
    ) {
      register.mutate({
        endpoint: clientSubQuery.data.endpoint,
        p256dh: clientSubQuery.data.toJSON().keys?.auth,
        auth: clientSubQuery.data.toJSON().keys?.p256dh,
      });
    }
  }, [
    register,
    clientSubQuery.data,
    clientSubQuery.status,
    serverQuery.data,
    serverQuery.status,
    utils.pushSubscription.getStatus,
  ]);

  return {
    endpoint: clientSubQuery.data?.endpoint,
    isRegistered: serverQuery.status === "success" && serverQuery.data,
    tags: useMemo(
      (): Record<string, string> =>
        Object.fromEntries(
          serverQuery.data?.tags.map(({ name, value }) => [name, value]) || []
        ),
      [serverQuery.data?.tags]
    ),
  };
}

function usePushServiceWorker() {
  return useQuery({
    queryKey: ["alveus-push-swr"],
    queryFn: async () => {
      return await pushServiceWorkerRegistration;
    },
    enabled: typeof window !== "undefined",
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  }).data;
}

export const NotificationSettings: React.FC = () => {
  const [notificationsPermission, setNotificationPermission] = useState(
    () => isNotificationsSupported && Notification.permission
  );
  const [error, setError] = useState<string | null>(null);

  const swr = usePushServiceWorker();
  const handleSubscribeClick = useCallback(() => {
    // TODO Subscribe
    Notification.requestPermission().then((permission) => {
      setNotificationPermission(permission);

      // If the user accepts, let's create a notification
      if (permission === "granted") {
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
  }, [swr]);

  const { endpoint, tags, isRegistered } = usePushSubscription(
    notificationsPermission
  );
  const config = trpc.notificationsConfig.getConfiguration.useQuery(undefined, {
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const setTagsMutation = trpc.pushSubscription.setTags.useMutation();
  const showSettings =
    isNotificationsSupported && config.data?.categories.length;
  const enableSettings =
    showSettings && notificationsPermission === "granted" && isRegistered;
  const utils = trpc.useContext();
  const handlePreferencesChange = useCallback(
    async (data: FormData) => {
      const tags: Record<string, string> = {};
      config.data?.categories.forEach(({ tag }) => {
        tags[tag] = String(
          data.has(`tag-${tag}`) ? data.get(`tag-${tag}`) : "0"
        );
      });

      if (endpoint) {
        setTagsMutation.mutate({
          endpoint: endpoint,
          tags: tags,
        });
        await utils.pushSubscription.getStatus.invalidate({ endpoint });
      }
    },
    [
      config.data?.categories,
      endpoint,
      setTagsMutation,
      utils.pushSubscription.getStatus,
    ]
  );

  const submitHandler = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (enableSettings && event.currentTarget) {
        await handlePreferencesChange(new FormData(event.currentTarget));
      }
    },
    [enableSettings, handlePreferencesChange]
  );

  const debouncedHandlePreferencesChange = useMemo(
    () => debounce(handlePreferencesChange, 200),
    [handlePreferencesChange]
  );

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (enableSettings && event.currentTarget.form) {
        debouncedHandlePreferencesChange(
          new FormData(event.currentTarget.form)
        );
      }
    },
    [debouncedHandlePreferencesChange, enableSettings]
  );

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
          onSubmit={submitHandler}
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
                    key={`tag-${category.tag}-${endpoint}-${isRegistered}`}
                    value="1"
                    defaultChecked={
                      enableSettings ? tags[category.tag] === "1" : true
                    }
                    type="checkbox"
                    disabled={!enableSettings}
                    className="text-indigo-600 focus:ring-indigo-500 h-4 w-4 rounded border-gray-300"
                    onChange={handleChange}
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
