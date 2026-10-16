import type { NextApiRequest, NextApiResponse } from "next";
import { type RawBodyError, getRawBody } from "raw-body";

import { env } from "@/env";

import { handleTwitchModerationWebhook } from "@/server/twitch/moderation-webhook";

export const config = { api: { bodyParser: false } };

export default async function moderationWebhook(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).end();
    return;
  }
  let body: Buffer;
  try {
    body = await getRawBody(req, { limit: "64kb" });
  } catch (error) {
    if ((error as RawBodyError).type === "entity.too.large")
      res.status(413).send("EventSub payload too large.");
    else res.status(400).send("Unable to read EventSub payload.");
    return;
  }
  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    if (Array.isArray(value))
      value.forEach((item) => headers.append(name, item));
    else if (value !== undefined) headers.set(name, value);
  }
  const response = await handleTwitchModerationWebhook(
    new Request("http://localhost/api/twitch/moderation", {
      method: "POST",
      headers,
      body: new Uint8Array(body),
    }),
    env.TWITCH_MODERATION_WEBHOOK_SECRET,
  );
  response.headers.forEach((value, name) => res.setHeader(name, value));
  res.status(response.status).send(await response.text());
}
