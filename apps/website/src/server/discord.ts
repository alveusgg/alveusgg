import { env } from "@/env/index.mjs";

import { triggerOutgoingWebhook } from "@/server/outgoing-webhooks";

export async function triggerDiscordChannelWebhookToEveryone({
  webhookUrl,
  content,
  botName = env.DISCORD_BOT_NAME,
}: {
  webhookUrl: string;
  content: string;
  botName?: string;
}) {
  return triggerOutgoingWebhook({
    url: webhookUrl,
    type: "discordChannel",
    body: JSON.stringify({
      username: botName,
      allowed_mentions: { parse: ["everyone"] },
      content: `@everyone ${content}`,
    }),
  });
}
