import { type OutgoingWebhook, prisma } from "@alveusgg/database";

import { env } from "@/env";

export type OutgoingWebhookType = "form-entry" | "unknown";

type OutgoingWebhookData = Pick<
  OutgoingWebhook,
  "url" | "type" | "body" | "retry" | "expiresAt"
>;

class OutgoingWebhookDeliveryError extends Error {
  response?: string;
  status?: number;
}

async function callWebhookUrl(data: OutgoingWebhookData) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);

  return fetch(data.url, {
    method: "POST",
    headers: {
      "User-Agent": "alveus.gg",
      "Content-Type": "application/json",
      "X-Hook-Type": data.type,
    },
    signal: controller.signal,
    body: data.body,
  }).then((response) => {
    clearTimeout(timeoutId);

    if (!response.ok) {
      const err = new OutgoingWebhookDeliveryError(
        "HTTP status code: " + response.status,
      );
      err.response = String(response);
      err.status = response.status;
      throw err;
    }
    return response;
  });
}

export async function tryToCallOutgoingWebhook(data: OutgoingWebhookData) {
  let success = false;
  try {
    await callWebhookUrl(data);
    success = true;
  } catch (_) {}
  return success;
}

export async function triggerOutgoingWebhook({
  url,
  type,
  body,
  userId,
  retry = false,
  expiresAt = null,
}: {
  url: string;
  type: string;
  body: string;
  userId?: string;
  retry?: boolean;
  expiresAt?: Date | null;
}): Promise<OutgoingWebhook> {
  const data = {
    url,
    body,
    type,
    expiresAt,
    retry,
  };
  const success = await tryToCallOutgoingWebhook(data);

  return prisma.outgoingWebhook.create({
    data: {
      ...data,
      user: userId === undefined ? undefined : { connect: { id: userId } },
      deliveredAt: success ? new Date() : undefined,
      failedAt: success ? undefined : new Date(),
      attempts: 1,
    },
  });
}

export async function retryOutgoingWebhook(outgoingWebhook: OutgoingWebhook) {
  let success = false;
  try {
    success = await tryToCallOutgoingWebhook(outgoingWebhook);
  } catch (_) {}

  await prisma.outgoingWebhook.update({
    where: { id: outgoingWebhook.id },
    data: {
      attempts: { increment: 1 },
      deliveredAt: success ? new Date() : undefined,
      failedAt: success ? undefined : new Date(),
    },
  });

  return success;
}

export async function retryOutgoingWebhooks({
  maxAttempts = 5,
  retryDelay = 10,
  limit = 100,
  type,
}: {
  maxAttempts?: number;
  retryDelay?: number;
  limit?: number;
  type?: string;
}) {
  const now = new Date();

  const retryConditions = Array(maxAttempts)
    .fill(0)
    .map((_, i) => retryDelay * Math.pow(2, i + 1))
    .map((delay, attempts) => ({
      attempts: attempts,
      failedAt: { lte: new Date(now.getTime() - delay) },
    }));

  const pendingOutgoingWebhooks = await prisma.outgoingWebhook.findMany({
    where: {
      deliveredAt: null,
      AND: [
        {
          OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
        },
        {
          OR: retryConditions,
        },
      ],
      retry: true,
      type,
    },
    take: limit,
  });

  const tasks = pendingOutgoingWebhooks.map((outgoingWebhook) =>
    retryOutgoingWebhook(outgoingWebhook),
  );

  await Promise.all(tasks);
}

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
  botName: username = env.DISCORD_CHANNEL_WEBHOOK_NAME,
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
  const embed = {
    title: contentTitle || "Notification",
    description: (
      (contentMessage || "") +
      (contentLink
        ? `\n[${contentLink.replace(/^https?:\/\/(www\.)?/, "")}](${contentLink})`
        : "")
    ).trim(),
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

export async function triggerPlainDiscordChannelWebhook({
  webhookUrl,
  contentMessage,
  botName: username = env.DISCORD_CHANNEL_WEBHOOK_NAME,
  expiresAt,
}: {
  webhookUrl: string;
  contentMessage?: string;
  botName?: string;
  expiresAt?: Date;
}) {
  const body: DiscordWebhookNotificationBody = {
    username,
    tts: false,
    avatar_url: `${env.NEXT_PUBLIC_BASE_URL}/apple-touch-icon.png`,
    allowed_mentions: {
      parse: [],
    },
    content: contentMessage || "",
  };

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
