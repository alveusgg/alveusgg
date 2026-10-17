import "./env";

import { env } from "@/env";

import { setupWebhookSubscriptionsForBroadcasters } from "@/server/apis/twitch";

import { channels } from "@/data/twitch";

const secret = env.TWITCH_MODERATION_WEBHOOK_SECRET;
if (!secret)
  throw new Error(
    "Set TWITCH_MODERATION_WEBHOOK_SECRET on the website and in this environment first.",
  );
const callback = new URL("/api/twitch/moderation", env.NEXT_PUBLIC_BASE_URL);
if (callback.protocol !== "https:" || callback.username || callback.password)
  throw new Error("EventSub needs a public HTTPS website callback.");

// Deploy the signed receiver before running this one-time setup. Twitch uses
// the application's prior AlveusSanctuary channel:moderate authorization.
for (const type of ["channel.ban", "channel.unban"]) {
  const subscriptions = await setupWebhookSubscriptionsForBroadcasters(
    [channels.alveus.id],
    type,
    "1",
    callback.href,
    secret,
  );
  for (const { status } of subscriptions) console.log(`${type}: ${status}`);
}
