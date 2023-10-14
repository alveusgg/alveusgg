import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextApiRequest, NextApiResponse } from "next";
import getRawBody from "raw-body";
import { z } from "zod";
import { prisma } from "@/server/db/client";
import { env } from "@/env/index.mjs";

const SERVICE_TWITCH = "twitch";
const EVENT_SOURCE_SUB = "event-sub";

// Notification request headers
const TWITCH_MESSAGE_ID = "Twitch-Eventsub-Message-Id".toLowerCase();
const TWITCH_MESSAGE_TIMESTAMP =
  "Twitch-Eventsub-Message-Timestamp".toLowerCase();
const TWITCH_MESSAGE_SIGNATURE =
  "Twitch-Eventsub-Message-Signature".toLowerCase();
const TWITCH_MESSAGE_TYPE = "Twitch-Eventsub-Message-Type".toLowerCase();

// Notification message types
const MESSAGE_TYPE_VERIFICATION = "webhook_callback_verification";
const MESSAGE_TYPE_NOTIFICATION = "notification";
const MESSAGE_TYPE_REVOCATION = "revocation";

// Prepend this string to the HMAC that's created from the message
const HMAC_PREFIX = "sha256=";

const channelUpdateNotificationEventSchema = z.object({
  broadcaster_user_id: z.string(),
  broadcaster_user_login: z.string(),
  broadcaster_user_name: z.string(),
  title: z.string(),
  language: z.string(),
  category_id: z.string(),
  category_name: z.string(),
  is_mature: z.boolean(),
});

const streamOnlineStatusEventSchema = z.object({
  id: z.string(),
  broadcaster_user_id: z.string(),
  broadcaster_user_login: z.string(),
  broadcaster_user_name: z.string(),
  type: z.string(),
  started_at: z.string().datetime(),
});

const streamOfflineStatusEventSchema = z.object({
  broadcaster_user_id: z.string(),
  broadcaster_user_login: z.string(),
  broadcaster_user_name: z.string(),
});

function getFirstHeader(header: string | string[] | undefined) {
  if (header === undefined || typeof header === "string") {
    return header;
  }
  return header[0];
}

// Build the message used to get the HMAC.
function getHmacMessageHeader(request: NextApiRequest) {
  const messageId = getFirstHeader(request.headers[TWITCH_MESSAGE_ID]) || "";
  const messageTimestamp =
    getFirstHeader(request.headers[TWITCH_MESSAGE_TIMESTAMP]) || "";

  return messageId + messageTimestamp;
}

// Get the HMAC.
function getHmac(secret: string, message: string) {
  return createHmac("sha256", secret).update(message).digest("hex");
}

// Verify whether our hash matches the hash that Twitch passed in the header.
function verifyMessage(hmac: string, verifySignature: string) {
  return timingSafeEqual(Buffer.from(hmac), Buffer.from(verifySignature));
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const signature = getFirstHeader(req.headers[TWITCH_MESSAGE_SIGNATURE]);
  const messageType = getFirstHeader(req.headers[TWITCH_MESSAGE_TYPE]);

  const secret = env.TWITCH_EVENTSUB_SECRET;

  const requestBody = await getRawBody(req, { encoding: "utf-8" });
  const message = getHmacMessageHeader(req) + requestBody;
  const hmac = HMAC_PREFIX + getHmac(secret, message); // Signature to compare

  if (signature == undefined || !verifyMessage(hmac, signature)) {
    res.status(403).end();
    return;
  }

  // Get JSON object from body, so you can process the message.
  const notification = JSON.parse(requestBody);

  if (messageType === MESSAGE_TYPE_VERIFICATION) {
    res.status(200).send(notification.challenge);
    return;
  }

  if (messageType === MESSAGE_TYPE_REVOCATION) {
    res.status(204).end();

    console.log(`${notification.subscription.type} notifications revoked!`);
    console.log(`reason: ${notification.subscription.status}`);
    console.log(
      `condition: ${JSON.stringify(
        notification.subscription.condition,
        null,
        4,
      )}`,
    );
    return;
  }

  if (messageType === MESSAGE_TYPE_NOTIFICATION) {
    // TODO: Do something with the event's data.

    console.log(`Event type: ${notification.subscription.type}`);
    console.log(JSON.stringify(notification.event, null, 4));

    switch (notification.subscription.type) {
      case "channel.update":
        {
          const data = channelUpdateNotificationEventSchema.parse(
            notification.event,
          );

          await prisma.channelUpdateEvent.create({
            data: {
              service: SERVICE_TWITCH,
              category_name: data.category_name,
              category_id: data.category_id,
              title: data.title,
              channel: data.broadcaster_user_id,
              source: EVENT_SOURCE_SUB,
            },
          });
        }
        break;
      case "channel.moderator.add":
        // TODO: Implement https://github.com/pjeweb/alveusgg/issues/36
        break;
      case "channel.moderator.remove":
        // TODO: Implement https://github.com/pjeweb/alveusgg/issues/36
        break;
      case "stream.online":
        {
          const data = streamOnlineStatusEventSchema.parse(notification.event);
          await prisma.streamStatusEvent.create({
            data: {
              service: SERVICE_TWITCH,
              channel: data.broadcaster_user_id,
              online: true,
              source: EVENT_SOURCE_SUB,
              startedAt: data.started_at,
            },
          });
        }
        break;
      case "stream.offline":
        {
          const data = streamOfflineStatusEventSchema.parse(notification.event);
          await prisma.streamStatusEvent.create({
            data: {
              service: SERVICE_TWITCH,
              channel: data.broadcaster_user_id,
              online: false,
              source: EVENT_SOURCE_SUB,
            },
          });
        }
        break;
    }

    res.status(204).end();
    return;
  }

  res.status(204).end();
  console.log(`Unknown message type: ${messageType}`);
}
