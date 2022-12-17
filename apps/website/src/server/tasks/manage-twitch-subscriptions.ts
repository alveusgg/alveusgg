import { getTwitchConfig } from "../../config/twitch";
import { getClientCredentialsAccessToken } from "../../utils/oauth2";
import {
  createSubscription,
  getSubscriptions,
  getSubscriptionsForUser,
  removeSubscription,
} from "../../utils/twitch-event-sub";

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
  clientId: string,
  accessToken: string,
  twitchEventSubCallback: string,
  twitchEventSubSecret: string
) {
  let isEnabled = false;
  let isPending = false;
  const { data } = await getSubscriptionsForUser(clientId, accessToken, id);

  const enabledSubs = [];
  const pendingSubs = [];
  const failedSubs = [];
  for (const sub of data) {
    if (
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
      [...enabledSubs, ...pendingSubs, ...failedSubs].map(async (sub) => {
        return await removeSubscription(clientId, accessToken, sub.id);
      })
    )
  ).reduce((count, removed) => (removed ? count + 1 : count), 0);

  console.info(`Twitch Event Sub: Cleaned up ${totalRemoved} subscriptions!`);

  if (!isEnabled && !isPending) {
    const created = await createSubscription(
      clientId,
      accessToken,
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

async function updateSubscriptionsForChannels(
  clientId: string,
  accessToken: string,
  twitchEventSubCallback: string,
  twitchEventSubSecret: string
) {
  const twitchConfig = await getTwitchConfig();

  for (const key in twitchConfig.channels) {
    const channelConfig = twitchConfig.channels[key];
    if (channelConfig === undefined) {
      continue;
    }

    await updateSubscriptionsForChannel(
      String(channelConfig.id),
      "channel.update",
      clientId,
      accessToken,
      twitchEventSubCallback,
      twitchEventSubSecret
    );
  }
}

async function checkSubscriptions(clientId: string, accessToken: string) {
  const subscriptions = await getSubscriptions(clientId, accessToken);

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
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;
  const twitchEventSubCallback = process.env.TWITCH_EVENTSUB_CALLBACK;
  const twitchEventSubSecret = process.env.TWITCH_EVENTSUB_SECRET;

  if (
    clientId === undefined ||
    clientSecret === undefined ||
    twitchEventSubCallback === undefined ||
    twitchEventSubSecret === undefined
  ) {
    throw Error(
      "Twitch Event Sub: Client id, client secret, event sub callback url or event sub secret missing!"
    );
  }

  const accessToken = await getClientCredentialsAccessToken(
    "twitch",
    clientId,
    clientSecret
  );
  if (accessToken === undefined) {
    console.error("Twitch Event Sub: Could not obtain OAuth access token!");
    return;
  }

  try {
    await checkSubscriptions(clientId, accessToken);
    await updateSubscriptionsForChannels(
      clientId,
      accessToken,
      twitchEventSubCallback,
      twitchEventSubSecret
    );
  } catch (error) {
    console.error("Twitch Event Sub: Error!", error);
  }
}
