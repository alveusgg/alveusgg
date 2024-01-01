import type { NextApiRequest, NextApiResponse } from "next";

import { env } from "@/env/index.mjs";
import { getAndVerifySvixWebhook } from "@/server/utils/svix";
import { handleWebhook, parseWebhook } from "@/server/utils/email";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (env.RESEND_WEBHOOK_SIGNING_SECRET === undefined) {
    throw new Error("RESEND_WEBHOOK_SIGNING_SECRET is undefined");
  }

  if (req.headers["content-type"] !== "application/json") {
    res.status(400).send("Invalid content-type");
    res.end();
    return;
  }

  let message;
  try {
    message = getAndVerifySvixWebhook(req, env.RESEND_WEBHOOK_SIGNING_SECRET);
  } catch (err) {
    res.status(400).send("Invalid signature");
    res.end();
    return;
  }

  if (req.method !== "POST") {
    res.status(400);
    res.send("Invalid method");
    res.end();
    return;
  }

  const webhook = parseWebhook(message);
  if (!webhook.success) {
    res.status(400).send("Invalid webhook");
    res.end();
    return;
  }

  await handleWebhook(webhook.data);

  res.status(200);
  res.end();
  return;
}
