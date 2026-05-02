import {
  type WebhookResponse,
  type WebhookPayload,
  DonationWebhookPayload,
} from "./schema.js";
import { type Options, buildBasicAuth } from "./env.js";
import { createWebhook, fixTimestampsTimezone, getWebhooks } from "./index.js";

export type { DonationWebhookPayload } from "./schema.js";

type WebhookOptions = Pick<Options, "organizationId" | "localTimezone">;

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

const cleanSearchParams = (
  urlString: string,
  paramsToExclude: string[] = [],
) => {
  const url = new URL(urlString);
  const params = url.searchParams;
  paramsToExclude.forEach((param) => params.delete(param));
  params.sort();
  return `${url.origin + url.pathname}?${params.toString()}`;
};

const isSameUrlWithoutQuery = (
  a: string,
  b: string,
  paramsToExclude: string[] = [],
) =>
  cleanSearchParams(a, paramsToExclude) ===
  cleanSearchParams(b, paramsToExclude);

export async function setupWebhook(
  url: string,
  trigger: WebhookResponse["trigger"],
  options: Options,
) {
  const existingWebhooks = await getWebhooks(options);
  const webhookSetUp =
    existingWebhooks.ok &&
    existingWebhooks.data.some(
      (webhook) =>
        isSameUrlWithoutQuery(webhook.url, url, ["uuid"]) &&
        webhook.trigger === trigger &&
        webhook.httpBasic.userName === options.basicAuthUsername,
    );

  if (webhookSetUp) {
    return;
  }

  const uuid = crypto.randomUUID();
  const urlWithUuid = new URL(url);
  urlWithUuid.searchParams.set("uuid", uuid);

  const created = await createWebhook(options, {
    name: `alveusgg-donations-${uuid}`,
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
  if (!created) {
    throw new Error("Failed to create Neon webhook");
  }
}
