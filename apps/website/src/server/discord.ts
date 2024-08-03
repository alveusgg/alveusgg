import { env } from "@/env";
import { triggerOutgoingWebhook } from "@/server/outgoing-webhooks";

export const OUTGOING_WEBHOOK_TYPE_DISCORD_CHANNEL = "discordChannel";

type DiscordWebhookNotificationBody = {
  avatar_url: string;
  username: string;
  content?: string;
  tts: boolean;
  allowed_mentions: {
    parse?: Array<"everyone" | "roles" | "users">;
    users?: string[];
  };
  embeds?: Array<{
    title: string;
    description: string;
    color?: number;
    fields?: Array<{ name: string; value: string; inline?: boolean }>;
    footer?: { text: string; icon_url?: string };
    thumbnail?: { url: string };
    image?: { url: string };
    author?: { name: string; url?: string; icon_url?: string };
    timestamp?: Date;
  }>;
};

export async function triggerDiscordChannelWebhook({
  webhookUrl,
  contentTitle,
  contentMessage,
  contentLink,
  imageUrl,
  botName: username = env.DISCORD_BOT_NAME,
  expiresAt,
  toEveryone = false,
}: {
  webhookUrl: string;
  contentTitle?: string;
  contentMessage?: string;
  contentLink?: string;
  imageUrl?: string;
  botName?: string;
  expiresAt?: Date;
  toEveryone?: boolean;
}) {
  const linkRegex = /twitch\.tv\/(\w+)/;
  const match = contentLink ? contentLink.match(linkRegex) : null;
  const formattedLink = match
    ? `[<:twitch:603947671941546025>/${match[1]}](${contentLink})`
    : `[Click Here](${contentLink})`;

  const embed = {
    title: contentTitle || "Notification",
    description: contentMessage || "",
    color: 0x636a60,
    url: contentLink,
    footer: {
      text: "alveus.gg/updates",
      icon_url: `${env.NEXT_PUBLIC_BASE_URL}/apple-touch-icon.png`,
    },
    timestamp: new Date(Date.now()),
    image: {
      url: imageUrl || "",
    },
  };

  const body: DiscordWebhookNotificationBody = {
    username,
    tts: false,
    avatar_url: `${env.NEXT_PUBLIC_BASE_URL}/apple-touch-icon.png`,
    allowed_mentions: {
      parse: [],
    },
    embeds: [embed],
  };

  if (toEveryone) {
    body.allowed_mentions = { parse: ["everyone"] };
    body.content = `@everyone ${contentTitle}`;
  }

  const url = new URL(webhookUrl);
  url.searchParams.set("wait", "true");

  return triggerOutgoingWebhook({
    url: url.toString(),
    type: OUTGOING_WEBHOOK_TYPE_DISCORD_CHANNEL,
    body: JSON.stringify(body),
    retry: true,
    expiresAt,
  });
}
