import type { NextApiRequest } from "next";
import {
  type WebhookUnbrandedRequiredHeaders,
  type WebhookRequiredHeaders,
  Webhook,
} from "svix";

function verifySvixWebhook(
  headers: WebhookRequiredHeaders | WebhookUnbrandedRequiredHeaders,
  body: Buffer | string,
  signingSecret: string,
) {
  const wh = new Webhook(signingSecret);
  return wh.verify(body, headers);
}

export function getAndVerifySvixWebhook(
  req: NextApiRequest,
  signingSecret: string,
) {
  return verifySvixWebhook(
    "svix-id" in req.headers
      ? {
          "svix-id": String(req.headers["svix-id"]),
          "svix-signature": String(req.headers["svix-signature"]),
          "svix-timestamp": String(req.headers["svix-timestamp"]),
        }
      : {
          "webhook-id": String(req.headers["webhook-id"]),
          "webhook-signature": String(req.headers["webhook-signature"]),
          "webhook-timestamp": String(req.headers["webhook-timestamp"]),
        },
    Buffer.from(req.read()),
    signingSecret,
  );
}
