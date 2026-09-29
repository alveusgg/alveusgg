import { exports } from "cloudflare:workers";
import { Hono } from "hono";

import {
  ChatMessageEvent,
  HEADERS,
  Notification,
  Revocation,
  toChatMessage,
  Verification,
  verify,
} from "../twitch/eventsub.ts";

export const eventsub = new Hono<{ Bindings: Env }>().post("/", async (c) => {
  // The signature is computed over the raw body, so read it before parsing
  const body = await c.req.text();
  if (!(await verify(c.env.TWITCH_EVENTSUB_SECRET, c.req.raw.headers, body))) {
    return c.text("Invalid signature", 403);
  }

  const payload: unknown = JSON.parse(body);

  switch (c.req.header(HEADERS.type)) {
    case "webhook_callback_verification": {
      const { challenge } = Verification.parse(payload);
      return c.text(challenge, 200);
    }

    case "revocation": {
      const { subscription } = Revocation.parse(payload);
      console.warn(
        `EventSub subscription ${subscription.id} (${subscription.type}) revoked: ${subscription.status}`,
      );
      return c.body(null, 204);
    }

    case "notification": {
      const { subscription, event } = Notification.parse(payload);

      if (subscription.type === "channel.chat.message") {
        const parsed = ChatMessageEvent.parse(event);
        const chat = exports.TwitchChat.getByName(parsed.broadcaster_user_id);
        // Twitch expects a 2xx within a few seconds, so handle it in the background
        c.executionCtx.waitUntil(chat.onChatMessage(toChatMessage(parsed)));
      }

      return c.body(null, 204);
    }

    default:
      return c.text("Unknown message type", 400);
  }
});
