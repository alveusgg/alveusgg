import { z } from "zod";

import type { ChatMessage } from "../chat/types.ts";

// https://dev.twitch.tv/docs/eventsub/handling-webhook-events/
export const HEADERS = {
  id: "twitch-eventsub-message-id",
  timestamp: "twitch-eventsub-message-timestamp",
  signature: "twitch-eventsub-message-signature",
  type: "twitch-eventsub-message-type",
} as const;

const MAX_MESSAGE_AGE_MS = 10 * 60 * 1000;

const encoder = new TextEncoder();

const hexToBytes = (hex: string) => {
  if (hex.length % 2 !== 0 || !/^[0-9a-f]*$/i.test(hex)) return undefined;
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
};

/**
 * Verify the HMAC signature Twitch attaches to every EventSub webhook request,
 * and reject messages older than 10 minutes to limit replay attacks.
 */
export const verify = async (
  secret: string,
  headers: Headers,
  body: string,
) => {
  const id = headers.get(HEADERS.id);
  const timestamp = headers.get(HEADERS.timestamp);
  const signature = headers.get(HEADERS.signature);
  if (!id || !timestamp || !signature) return false;

  const sentAt = Date.parse(timestamp);
  if (Number.isNaN(sentAt) || Date.now() - sentAt > MAX_MESSAGE_AGE_MS) {
    return false;
  }

  const [algorithm, hex] = signature.split("=", 2);
  const expected = algorithm === "sha256" && hex ? hexToBytes(hex) : undefined;
  if (!expected) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );

  // `subtle.verify` compares in constant time
  return crypto.subtle.verify(
    "HMAC",
    key,
    expected,
    encoder.encode(id + timestamp + body),
  );
};

const Subscription = z.object({
  id: z.string(),
  type: z.string(),
  version: z.string(),
  status: z.string(),
});

export const Verification = z.object({
  challenge: z.string(),
  subscription: Subscription,
});

export const Revocation = z.object({
  subscription: Subscription,
});

export const Notification = z.object({
  subscription: Subscription,
  event: z.unknown(),
});

// https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types/#channelchatmessage
export const ChatMessageEvent = z.object({
  broadcaster_user_id: z.string(),
  broadcaster_user_login: z.string(),
  chatter_user_id: z.string(),
  chatter_user_login: z.string(),
  chatter_user_name: z.string(),
  message_id: z.string(),
  message: z.object({ text: z.string() }),
  badges: z.array(z.object({ set_id: z.string(), id: z.string() })),
});

export type ChatMessageEvent = z.infer<typeof ChatMessageEvent>;

export const toChatMessage = (event: ChatMessageEvent): ChatMessage => {
  const badges = new Set(event.badges.map((badge) => badge.set_id));
  return {
    id: event.message_id,
    text: event.message.text,
    user: {
      id: event.chatter_user_id,
      login: event.chatter_user_login,
      name: event.chatter_user_name,
      mod: badges.has("moderator"),
      sub: badges.has("subscriber") || badges.has("founder"),
      vip: badges.has("vip"),
      broadcaster: event.chatter_user_id === event.broadcaster_user_id,
    },
  };
};
