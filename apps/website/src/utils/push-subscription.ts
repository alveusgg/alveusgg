/*
 * TODO: Check if applicationServerKey changed?
 * TODO: Check expirationTime?
 */

import { trpc } from "./trpc";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

const SW_PATH = "/push/alveus/AlveusPushWorker.js";

export const isNotificationsSupported =
  typeof window !== "undefined" && "Notification" in window;

export const isWebPushSupported =
  typeof window !== "undefined" && "PushManager" in window;

export const isServiceWorkersSupported =
  typeof navigator !== "undefined" && "serviceWorker" in navigator;

const pushServiceWorkerRegistration: Promise<ServiceWorkerRegistration | null> =
  new Promise((resolve, reject) => {
    if (!isServiceWorkersSupported) {
      resolve(null);
      return;
    }

    navigator.serviceWorker
      .register(SW_PATH, {
        type: "module",
        updateViaCache: "none",
      })
      .then((registration) => {
        resolve(registration);
      })
      .catch(() => {
        reject(null);
      });
  });

async function getSubscription() {
  const registration = await pushServiceWorkerRegistration;
  const pushManager = registration?.pushManager;
  if (!pushManager) {
    return null;
  }

  const subscription = await pushManager.getSubscription();
  if (subscription) {
    return subscription;
  }

  try {
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

export function usePushSubscription(
  notificationsPermission: NotificationPermission | false
) {
  const clientSubQuery = useQuery({
    queryKey: ["alveus-push-subscription", notificationsPermission],
    queryFn: async () => {
      return await getSubscription();
    },
    enabled:
      typeof window !== "undefined" && notificationsPermission === "granted",
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const endpoint = clientSubQuery.data?.endpoint;
  const serverQuery = trpc.pushSubscription.getStatus.useQuery(
    {
      endpoint: endpoint as string,
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      enabled:
        typeof window !== "undefined" &&
        clientSubQuery.status === "success" &&
        endpoint !== undefined,
    }
  );

  const queryClient = useQueryClient();
  const utils = trpc.useContext();
  const register = trpc.pushSubscription.register.useMutation({
    onSuccess: () => {
      if (endpoint) {
        queryClient.invalidateQueries({
          queryKey: trpc.pushSubscription.getStatus.getQueryKey({ endpoint }),
        });
      }
    },
  });

  useEffect(() => {
    const isClientSubscriptionReady =
      clientSubQuery.status === "success" && endpoint;
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
        endpoint,
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
    endpoint,
  ]);

  return {
    endpoint: clientSubQuery.data?.endpoint,
    isRegistered:
      serverQuery.status === "success" && serverQuery.data !== undefined,
    tags: useMemo(
      (): Record<string, string> =>
        Object.fromEntries(
          serverQuery.data?.tags.map(({ name, value }) => [name, value]) || []
        ),
      [serverQuery.data?.tags]
    ),
  };
}

export function usePushServiceWorker() {
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
