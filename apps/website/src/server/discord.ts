import { env } from "@/env";

import { triggerOutgoingWebhook } from "@/server/outgoing-webhooks";

export const OUTGOING_WEBHOOK_TYPE_DISCORD_CHANNEL = "discordChannel";

type DiscordWebhookNotificationBody = {
  // We dont use: files[], embeds, payload_json, attachments, flags, thread_name
  avatar_url: string;
  username: string;
  content: string;
  tts: boolean;
  allowed_mentions: {
    parse?: Array<"everyone" | "roles" | "users">;
    users?: string[];
  };
};

export async function triggerDiscordChannelWebhook({
  webhookUrl,
  content,
  botName: username = env.DISCORD_BOT_NAME,
  expiresAt,
  toEveryone = false,
}: {
  webhookUrl: string;
  content: string;
  botName?: string;
  expiresAt?: Date;
  toEveryone?: boolean;
}) {
  const body: DiscordWebhookNotificationBody = {
    username,
    content,
    tts: false,
    avatar_url: `${env.NEXT_PUBLIC_BASE_URL}/apple-touch-icon.png`,
    allowed_mentions: {
      parse: [],
    },
  };

  if (toEveryone) {
    body.allowed_mentions = { parse: ["everyone"] };
    body.content = `@everyone ${content}`;
  }

  const url = new URL(webhookUrl);
  url.searchParams.set("wait", "true");
  //url.searchParams.set('thread_id', '1234567890');

  return triggerOutgoingWebhook({
    url: url.toString(),
    type: OUTGOING_WEBHOOK_TYPE_DISCORD_CHANNEL,
    body: JSON.stringify(body),
    retry: true,
    expiresAt,
  });
}
