import fetch from "node-fetch";
import type { OutgoingWebhook } from "@prisma/client";
import { prisma } from "./db/client";

export type OutgoingWebhookType = "form-entry" | "unknown";

class OutgoingWebhookDeliveryError extends Error {
  response?: string;
  status?: number;
}

async function callWebhookUrl(url: string, body: string, type: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);

  return fetch(url, {
    method: "POST",
    headers: {
      "User-Agent": "alveus.gg",
      "Content-Type": "application/json",
      "X-Hook-Type": type,
    },
    signal: controller.signal,
    body,
  }).then((response) => {
    clearTimeout(timeoutId);

    if (!response.ok) {
      const err = new OutgoingWebhookDeliveryError(
        "HTTP status code: " + response.status
      );
      err.response = String(response);
      err.status = response.status;
      throw err;
    }
    return response;
  });
}

async function createOutgoingWebhook({
  url,
  type,
  body,
  success,
  userId,
}: {
  url: string;
  type: string;
  body: string;
  success: boolean;
  userId?: string;
}) {
  return await prisma.outgoingWebhook.create({
    data: {
      url,
      body,
      type,
      user: userId === undefined ? undefined : { connect: { id: userId } },
      deliveredAt: success ? new Date() : undefined,
      failedAt: success ? undefined : new Date(),
      attempts: 1,
    },
  });
}

export async function tryToCallOutgoingWebhook(
  url: string,
  body: string,
  type: string
) {
  let success = false;
  try {
    await callWebhookUrl(url, body, type);
    success = true;
  } catch (e) {}
  return success;
}

export async function triggerOutgoingWebhook({
  url,
  type,
  body,
  userId,
}: {
  url: string;
  type: string;
  body: string;
  userId?: string;
}) {
  const success = await tryToCallOutgoingWebhook(url, body, type);
  return await createOutgoingWebhook({ url, type, body, userId, success });
}

export async function retryOutgoingWebhook(outgoingWebhook: OutgoingWebhook) {
  let success = false;
  try {
    success = await tryToCallOutgoingWebhook(
      outgoingWebhook.url,
      outgoingWebhook.body,
      outgoingWebhook.type
    );
  } catch (e) {}

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
