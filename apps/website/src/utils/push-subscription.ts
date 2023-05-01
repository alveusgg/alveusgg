/*
 * TODO: Check if applicationServerKey changed?
 * TODO: Check expirationTime?
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

import { env } from "@/env/client.mjs";
import { trpc } from "./trpc";

const SW_PATH = "/push/alveus/PushServiceWorker.js";

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
      applicationServerKey: env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY,
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

  const [tags, setTags] = useState<Record<string, string> | null>(null);

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

  const setTagsMutation = trpc.pushSubscription.setTags.useMutation({
    onMutate: async ({ endpoint, tags: newTags }) => {
      setTags(newTags); // optimistic update
      const statusKey = trpc.pushSubscription.getStatus.getQueryKey({
        endpoint,
      });
      const previous = queryClient.getQueryData(statusKey);
      await queryClient.cancelQueries(statusKey);
      return { previous };
    },
    onError: () => {
      setTags(null); // roll back
    },
    onSettled: async () => {
      if (endpoint) {
        const statusKey = trpc.pushSubscription.getStatus.getQueryKey({
          endpoint,
        });
        await queryClient.invalidateQueries({ queryKey: statusKey });
      }
    },
  });

  const updateTags = useCallback(
    async (tags: Record<string, string>) => {
      if (endpoint) {
        setTagsMutation.mutate({
          endpoint: endpoint,
          tags: tags,
        });
        await utils.pushSubscription.getStatus.invalidate({ endpoint });
      }
    },
    [endpoint, setTagsMutation, utils.pushSubscription.getStatus]
  );

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
        p256dh: clientSubQuery.data.toJSON().keys?.p256dh,
        auth: clientSubQuery.data.toJSON().keys?.auth,
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
      () =>
        tags ||
        Object.fromEntries(
          serverQuery.data?.tags.map(({ name, value }) => [name, value]) || []
        ),
      [serverQuery.data?.tags, tags]
    ),
    updateTags,
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
