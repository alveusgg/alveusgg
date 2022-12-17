import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextApiRequest, NextApiResponse } from "next";
import getRawBody from "raw-body";

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
  res: NextApiResponse
) {
  if (process.env.TWITCH_EVENTSUB_SECRET === undefined) {
    throw Error("Twitch eventsub secret missing!");
  }

  const signature = getFirstHeader(req.headers[TWITCH_MESSAGE_SIGNATURE]);
  const messageType = getFirstHeader(req.headers[TWITCH_MESSAGE_TYPE]);

  const secret = process.env.TWITCH_EVENTSUB_SECRET;

  const requestBody = await getRawBody(req, { encoding: "utf-8" });
  const message = getHmacMessageHeader(req) + requestBody;
  const hmac = HMAC_PREFIX + getHmac(secret, message); // Signature to compare

  if (signature == undefined || !verifyMessage(hmac, signature)) {
    res.status(403).end();
    return;
  }

  // Get JSON object from body, so you can process the message.
  const notification = JSON.parse(requestBody);

  if (messageType === MESSAGE_TYPE_NOTIFICATION) {
    // TODO: Do something with the event's data.

    console.log(`Event type: ${notification.subscription.type}`);
    console.log(JSON.stringify(notification.event, null, 4));

    res.status(204).end();
    return;
  }

  if (messageType === MESSAGE_TYPE_VERIFICATION) {
    console.error("verification success!");
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
        4
      )}`
    );
    return;
  }

  res.status(204).end();
  console.log(`Unknown message type: ${messageType}`);
}
