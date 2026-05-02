import {
  type WebhookResponse,
  type WebhookPayload,
  DonationWebhookPayload,
} from "./schema.js";
import { type Options, buildBasicAuth } from "./env.js";
import { createWebhook, getWebhooks } from "./index.js";

export type { DonationWebhookPayload } from "./schema.js";

type WebhookOptions = Pick<Options, "organizationId">;

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
    return false;
  }

  if (payload.data.organizationId !== options.organizationId) {
    console.error(
      `Ignoring webhook from ${payload.data.organizationId} because it is not the allowed organization id (${options.organizationId}).`,
    );
    return false;
  }

  return payload.data;
};

export const parseDonationWebhook = async (
  options: WebhookOptions,
  body: unknown,
) => parseWebhook(options, body, DonationWebhookPayload);

const isMatchingWebhookSubscription = (
  webhook: WebhookResponse,
  trigger: WebhookResponse["trigger"],
  url: string,
  options: Pick<Options, "basicAuthUsername">,
) =>
  webhook.url === url &&
  webhook.trigger === trigger &&
  webhook.httpBasic.userName === options.basicAuthUsername;

export async function setupWebhook(
  url: string,
  trigger: WebhookResponse["trigger"],
  options: Options,
) {
  const existingWebhooks = await getWebhooks(options);
  const webhookSetUp =
    existingWebhooks.ok &&
    existingWebhooks.data.some((webhook) =>
      isMatchingWebhookSubscription(webhook, trigger, url, options),
    );

  if (webhookSetUp) {
    return;
  }

  const created = await createWebhook(options, {
    name: url,
    url,
    trigger,
    httpBasic: buildBasicAuth(options),
  });
  if (!created) {
    throw new Error("Failed to create Neon webhook");
  }
}
