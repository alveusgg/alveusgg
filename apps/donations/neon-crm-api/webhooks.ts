import {
  type WebhookResponse,
  type WebhookPayload,
  DonationWebhookPayload,
} from "./schema.js";
import { type Options, buildBasicAuth } from "./env.js";
import { createWebhook, deleteWebhook, getWebhooks } from "./index.js";
import { fixTimestampsTimezone, isSameUrlWithoutQuery } from "./utils";
import type { ZodError } from "zod";

export type { DonationWebhookPayload } from "./schema.js";

type WebhookOptions = Pick<Options, "organizationId" | "localTimezone"> & {
  onParseError?: (
    error: ZodError,
    context: {
      kind: "webhook";
      eventTrigger: string | undefined;
    },
  ) => void;
};

type WebhookTypeSchemas = (typeof WebhookPayload.def.options)[number];

export const parseWebhook = async <Schema extends WebhookTypeSchemas>(
  options: WebhookOptions,
  body: unknown,
  schema: Schema,
) => {
  const payload = await schema.safeParseAsync(body);
  if (!payload.success) {
    console.error("Failed to parse Neon webhook payload", {
      error: payload.error,
    });
    options.onParseError?.(payload.error, {
      kind: "webhook",
      eventTrigger:
        typeof body === "object" &&
        body !== null &&
        "eventTrigger" in body &&
        typeof body.eventTrigger === "string"
          ? body.eventTrigger
          : undefined,
    });
    return false;
  }

  if (payload.data.organizationId !== options.organizationId) {
    console.error(
      `Ignoring webhook from ${payload.data.organizationId} because it is not the allowed organization id (${options.organizationId}).`,
    );
    return false;
  }

  payload.data.data.timestamps = fixTimestampsTimezone(
    payload.data.data.timestamps,
    options.localTimezone,
  );

  return payload.data;
};

export const parseDonationWebhook = async (
  options: WebhookOptions,
  body: unknown,
) => parseWebhook(options, body, DonationWebhookPayload);

export async function setupWebhook(
  url: string,
  trigger: WebhookResponse["trigger"],
  options: Options,
) {
  const existingWebhooks = await getWebhooks(options);
  if (!existingWebhooks.ok) {
    throw new Error(
      `Failed to list Neon webhooks before setup: ${existingWebhooks.error}`,
    );
  }

  const matchingWebhooks = existingWebhooks.data
    .filter(
      (webhook) =>
        isSameUrlWithoutQuery(webhook.url, url, ["uuid"]) &&
        webhook.trigger === trigger &&
        webhook.httpBasic.userName === options.basicAuthUsername,
    )
    .sort((a, b) => Number(a.id) - Number(b.id));

  if (matchingWebhooks.length > 0) {
    for (const duplicate of matchingWebhooks.slice(1)) {
      const deleted = await deleteWebhook(options, duplicate.id);
      if (!deleted.ok) {
        throw new Error(
          `Failed to delete duplicate Neon webhook ${duplicate.id}: ${deleted.error}`,
        );
      }
    }
    return;
  }

  const uuid = getWebhookUuid(url, trigger);
  const urlWithUuid = new URL(url);
  urlWithUuid.searchParams.set("uuid", uuid);

  const created = await createWebhook(options, {
    name: getWebhookName(url, trigger),
    url: String(urlWithUuid),
    trigger,
    httpBasic: buildBasicAuth(options),
    customParameters: [
      {
        name: "uuid",
        value: uuid,
      },
    ],
  });
  if (!created.ok) {
    throw new Error(`Failed to create Neon webhook: ${created.error}`);
  }
}

function getWebhookName(url: string, trigger: WebhookResponse["trigger"]) {
  const hostname = new URL(url).hostname.replace(/[^a-zA-Z0-9]+/g, "-");
  return `alveusgg-donations-${trigger.toLowerCase()}-${hostname}`;
}

function getWebhookUuid(url: string, trigger: WebhookResponse["trigger"]) {
  const normalizedUrl = new URL(url);
  normalizedUrl.searchParams.delete("uuid");
  normalizedUrl.searchParams.sort();
  return `${trigger}:${normalizedUrl}`;
}
