import {
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

export const updateCustomField = (
  options: Options,
  id: RecordId,
  change: UpdateCustomFieldInput,
) => fetchOk(options, url`customFields/${id}`, "PUT", change);

export const getCustomField = (options: Options, id: RecordId) =>
  fetchWithSchema(options, url`customFields/${id}`, CustomFieldResponse);

export const getAccount = (options: Options, id: RecordId) =>
  fetchWithSchema(options, url`accounts/${id}`, AccountResponse);

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
