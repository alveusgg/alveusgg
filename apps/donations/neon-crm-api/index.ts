import { DateTime } from "luxon";

import {
  type Timestamps,
  type CreateWebhookInput,
  type RecordId,
  type UpdateCustomFieldInput,
  AccountResponse,
  CreateWebhookResponse,
  CustomFieldResponse,
  WebhookResponse,
  WebhooksResponse,
} from "./schema.js";
import { type Options, url, fetchOk, fetchWithSchema } from "./api.js";

export {
  type RecordId,
  AccountResponse,
  CreateWebhookResponse,
  CustomFieldResponse,
  WebhookResponse,
  WebhooksResponse,
} from "./schema.js";

const fixTimestampTimezone = (dateTime: Date, zone: string): Date =>
  DateTime.fromISO(dateTime.toISOString().replace("Z", ""), {
    zone,
  }).toJSDate();

/**
 * WORKAROUND HOTFIX: Neon One API mislabels local time as UTC ('Z').
 * Remove this logic when they fix the timezone in their API response.
 */
export const fixTimestampsTimezone = (
  timestamps: Timestamps,
  zone: string,
) => ({
  ...timestamps,
  createdDateTime: fixTimestampTimezone(timestamps.createdDateTime, zone),
  lastModifiedDateTime: fixTimestampTimezone(
    timestamps.lastModifiedDateTime,
    zone,
  ),
});

export const updateCustomField = (
  options: Options,
  id: RecordId,
  change: UpdateCustomFieldInput,
) => fetchOk(options, url`customFields/${id}`, "PUT", change);

export const getCustomField = (options: Options, id: RecordId) =>
  fetchWithSchema(options, url`customFields/${id}`, CustomFieldResponse);

export const getAccount = async (options: Options, id: RecordId) => {
  const account = await fetchWithSchema(
    options,
    url`accounts/${id}`,
    AccountResponse,
  );
  if (account.ok) {
    if (account.data.companyAccount) {
      account.data.companyAccount.timestamps = fixTimestampsTimezone(
        account.data.companyAccount.timestamps,
        options.localTimezone,
      );
    }
    if (account.data.individualAccount) {
      account.data.individualAccount.timestamps = fixTimestampsTimezone(
        account.data.individualAccount.timestamps,
        options.localTimezone,
      );
    }
  }
  return account;
};

export const getWebhook = (options: Options, id: RecordId) =>
  fetchWithSchema(options, url`webhooks/${id}`, WebhookResponse);

export const getWebhooks = (options: Options) =>
  fetchWithSchema(options, "webhooks", WebhooksResponse);

export const createWebhook = (
  options: Options,
  input: Required<
    Pick<CreateWebhookInput, "httpBasic" | "url" | "name" | "trigger">
  > &
    Partial<Pick<CreateWebhookInput, "customParameters" | "triggerSelfImport">>,
) =>
  fetchWithSchema(options, "webhooks", CreateWebhookResponse, "POST", {
    contentType: "application/json",
    triggerSelfImport: input.triggerSelfImport ?? false,
    trigger: input.trigger,
    name: input.name,
    url: input.url,
    httpBasic: input.httpBasic,
    customParameters: input.customParameters ?? [],
  } satisfies CreateWebhookInput);
