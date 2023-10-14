import fetch from "node-fetch";
import type { OutgoingWebhook } from "@prisma/client";

import { prisma } from "@/server/db/client";

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
  } catch (e) {}
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

  const exponentialDelays = new Array(maxAttempts).map(
    (_, i) => retryDelay * Math.pow(2, i + 1),
  );

  const pendingOutgoingWebhooks = await prisma.outgoingWebhook.findMany({
    where: {
      deliveredAt: null,
      AND: [
        {
          OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
        },
        {
          OR: exponentialDelays.map((delay, attempts) => ({
            attempts: attempts,
            failedAt: { lte: new Date(now.getTime() - delay) },
          })),
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
