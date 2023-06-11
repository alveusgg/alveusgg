import type { TwitchConfig } from "@/config/twitch";
import { getTwitchConfig } from "@/config/twitch";
import { env } from "@/env/server.mjs";
import {
  createSubscription,
  getSubscriptions,
  getSubscriptionsForUser,
  removeSubscription,
} from "../utils/twitch-api";

/*
  Notes:
  - Actively removing subscriptions if the secret changes should not be necessary as they would simply fail and be cleaned

  Possible Changes:
  - retry if token expires during operation
 */

const subscriptionsStatusToCleanUp = [
  "webhook_callback_verification_failed",
  "notification_failures_exceeded",
  "authorization_revoked",
  "moderator_removed",
  "user_removed",
  "version_removed",
];

async function updateSubscriptionsForChannel(
  id: string,
  type: string,
  twitchEventSubCallback: string,
  twitchEventSubSecret: string
) {
  let isEnabled = false;
  let isPending = false;
  const { data } = await getSubscriptionsForUser(id);

  const enabledSubs = [];
  const pendingSubs = [];
  const failedSubs = [];
  for (const sub of data) {
    if (
      sub.type !== type ||
      sub.transport.method !== "webhook" ||
      sub.transport.callback !== twitchEventSubCallback
    ) {
      continue;
    }

    if (sub.status === "enabled") {
      enabledSubs.push(sub);
    } else if (sub.status === "pending") {
      pendingSubs.push(sub);
    } else if (subscriptionsStatusToCleanUp.includes(sub.status)) {
      failedSubs.push(sub);
      console.warn("Twitch Event Sub: Subscription failed!", {
        id: sub.id,
        status: sub.status,
      });
    } else {
      // ignore unknown status
    }
  }

  if (enabledSubs.length > 0) {
    isEnabled = true;
    enabledSubs.shift();
  }

  if (!isEnabled && pendingSubs.length > 0) {
    isPending = true;
    pendingSubs.shift();
  }

  const totalRemoved = (
    await Promise.allSettled(
      [...enabledSubs, ...pendingSubs, ...failedSubs].map(
        async (sub) => await removeSubscription(sub.id)
      )
    )
  ).reduce((count, removed) => (removed ? count + 1 : count), 0);

  console.info(`Twitch Event Sub: Cleaned up ${totalRemoved} subscriptions!`);

  if (!isEnabled && !isPending) {
    const created = await createSubscription(
      type,
      String(id),
      twitchEventSubCallback,
      twitchEventSubSecret
    );

    if (created) {
      isPending = true;
      console.info(`Twitch Event Sub: Created subscription!`, { type, id });
    } else {
      console.warn(`Twitch Event Sub: Could not create subscription!`, {
        type,
        id,
      });
    }
  }

  return isEnabled ? "enabled" : isPending ? "pending" : null;
}

async function updateSubscriptionsForChannels() {
  const twitchEventSubCallback = env.TWITCH_EVENTSUB_CALLBACK;
  const twitchEventSubSecret = env.TWITCH_EVENTSUB_SECRET;
  const twitchConfig: TwitchConfig = await getTwitchConfig();

  for (const key in twitchConfig.channels) {
    const channelConfig = twitchConfig.channels[key];
    if (channelConfig === undefined) {
      continue;
    }

    await updateSubscriptionsForChannel(
      String(channelConfig.id),
      "channel.update",
      twitchEventSubCallback,
      twitchEventSubSecret
    );
    await updateSubscriptionsForChannel(
      String(channelConfig.id),
      "stream.online",
      twitchEventSubCallback,
      twitchEventSubSecret
    );
    await updateSubscriptionsForChannel(
      String(channelConfig.id),
      "stream.offline",
      twitchEventSubCallback,
      twitchEventSubSecret
    );
  }
}

async function checkSubscriptions() {
  const subscriptions = await getSubscriptions();

  console.info("Twitch Event Sub: Stats", {
    total: subscriptions.total,
    total_cost: subscriptions.total_cost,
    max_total_cost: subscriptions.max_total_cost,
  });
  if (subscriptions.total_cost >= subscriptions.max_total_cost) {
    console.warn(
      "Twitch Event Sub: Warning: Reached max cost of event subs for twitch!"
    );
  }
}

export async function updateSubscriptions() {
  try {
    await checkSubscriptions();
    await updateSubscriptionsForChannels();
  } catch (error) {
    console.error("Twitch Event Sub: Error!", error);
  }
}
