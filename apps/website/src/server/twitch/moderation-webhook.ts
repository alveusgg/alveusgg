import { createHmac, timingSafeEqual } from "node:crypto";

import { z } from "zod";

import { invalidateTwitchBan } from "@/server/utils/twitch-bans";

import { channels } from "@/data/twitch";

const payloadSchema = z.object({
  subscription: z.object({
    type: z.enum(["channel.ban", "channel.unban"]),
    version: z.literal("1"),
    condition: z.object({ broadcaster_user_id: z.literal(channels.alveus.id) }),
  }),
  challenge: z.string().min(1).optional(),
  event: z
    .object({
      broadcaster_user_id: z.literal(channels.alveus.id),
      user_id: z.string().regex(/^[0-9]{1,32}$/),
    })
    .optional(),
});

export async function handleTwitchModerationWebhook(
  request: Request,
  secret: string | undefined,
) {
  if (request.method !== "POST")
    return new Response(null, { status: 405, headers: { Allow: "POST" } });
  if (!secret)
    return new Response("Moderation webhooks are not configured.", {
      status: 503,
    });
  const id = request.headers.get("twitch-eventsub-message-id");
  const timestamp = request.headers.get("twitch-eventsub-message-timestamp");
  const signature = request.headers.get("twitch-eventsub-message-signature");
  const type = request.headers.get("twitch-eventsub-message-type");
  const sentAt = timestamp ? Date.parse(timestamp) : NaN;
  if (
    !id ||
    id.length > 128 ||
    !timestamp ||
    !Number.isFinite(sentAt) ||
    Date.now() - sentAt > 10 * 60_000 ||
    sentAt - Date.now() > 60_000 ||
    !signature ||
    !/^sha256=[a-f0-9]{64}$/.test(signature)
  )
    return new Response("Invalid EventSub signature or timestamp.", {
      status: 403,
    });

  const body = await request.text();
  if (Buffer.byteLength(body) > 64 * 1024)
    return new Response("EventSub payload too large.", { status: 413 });
  const expected = createHmac("sha256", secret)
    .update(id)
    .update(timestamp)
    .update(body)
    .digest();
  const supplied = Buffer.from(signature.slice(7), "hex");
  if (!timingSafeEqual(expected, supplied))
    return new Response("Invalid EventSub signature or timestamp.", {
      status: 403,
    });

  let json: unknown;
  try {
    json = JSON.parse(body);
  } catch {
    return new Response("Invalid EventSub payload.", { status: 400 });
  }
  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success)
    return new Response("Unsupported EventSub subscription or payload.", {
      status: 400,
    });
  const payload = parsed.data;
  if (
    request.headers.get("twitch-eventsub-subscription-type") !==
      payload.subscription.type ||
    request.headers.get("twitch-eventsub-subscription-version") !==
      payload.subscription.version
  )
    return new Response("Unsupported EventSub subscription or payload.", {
      status: 400,
    });

  if (type === "webhook_callback_verification" && payload.challenge)
    return new Response(payload.challenge, {
      headers: { "Content-Type": "text/plain" },
    });
  if (type === "revocation") {
    console.warn(
      "Twitch moderation subscription revoked:",
      payload.subscription.type,
    );
    return new Response(null, { status: 204 });
  }
  if (type !== "notification" || !payload.event)
    return new Response("Unsupported EventSub message.", { status: 400 });
  try {
    // Invalidation is intentionally independent of event ordering: delayed or
    // duplicate unbans must not overwrite a newer ban with an access grant.
    await invalidateTwitchBan(payload.event.user_id);
  } catch {
    // Acknowledge only after Redis confirms the fence. Twitch can retry an
    // unavailable receiver; a lost event still has the five-minute fallback.
    return new Response("Moderation cache update temporarily unavailable.", {
      status: 503,
    });
  }
  return new Response(null, { status: 204 });
}
