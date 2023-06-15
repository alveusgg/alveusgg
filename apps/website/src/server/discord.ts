import { env } from "@/env/index.mjs";

import { triggerOutgoingWebhook } from "@/server/outgoing-webhooks";

export const OUTGOING_WEBHOOK_TYPE_DISCORD_CHANNEL = "discordChannel";

export async function triggerDiscordChannelWebhookToEveryone({
  webhookUrl,
  content,
  botName = env.DISCORD_BOT_NAME,
  expiresAt,
}: {
  webhookUrl: string;
  content: string;
  botName?: string;
  expiresAt?: Date;
}) {
  return triggerOutgoingWebhook({
    url: webhookUrl,
    type: OUTGOING_WEBHOOK_TYPE_DISCORD_CHANNEL,
    body: JSON.stringify({
      username: botName,
      allowed_mentions: { parse: ["everyone"] },
      content: `@everyone ${content}`,
    }),
    retry: true,
    expiresAt,
  });
}
