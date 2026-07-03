import {
  type CreateWebhookInput,
  type DonationResponse as Donation,
  type DonationSearchResponse as DonationSearch,
  type RecordId,
  type UpdateCustomFieldInput,
  AccountResponse,
  CreateWebhookResponse,
  CustomFieldResponse,
  DonationResponse,
  DonationSearchResponse,
  WebhookResponse,
  WebhooksResponse,
} from "./schema.js";
import { fetchOk, fetchWithSchema, type Options, url } from "./api.js";
import { fixTimestampsTimezone } from "./utils";

export { formatDateInTimezone } from "./utils";

export type { Donation, DonationSearch };
export {
  type RecordId,
  AccountResponse,
  CreateWebhookResponse,
  CustomFieldResponse,
  DonationResponse,
  DonationSearchResponse,
  WebhookResponse,
  WebhooksResponse,
} from "./schema.js";

export type DonationSearchInput = {
  searchFields: Array<{
    field: string;
    operator: string;
    value?: string | number | boolean;
    valueList?: unknown[];
  }>;
  outputFields: string[];
  pagination?: {
    currentPage?: number;
    pageSize?: number;
    sortColumn?: string;
    sortDirection?: "ASC" | "DESC";
  };
};

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

export const getDonation = async (options: Options, id: RecordId) => {
  const donation = await fetchWithSchema(
    options,
    url`donations/${id}`,
    DonationResponse,
  );

  if (donation.ok) {
    donation.data.timestamps = fixTimestampsTimezone(
      donation.data.timestamps,
      options.localTimezone,
    );
  }

  return donation;
};

export const searchDonations = (
  options: Options,
  search: DonationSearchInput,
) =>
  fetchWithSchema(
    options,
    "donations/search",
    DonationSearchResponse,
    "POST",
    search,
  );

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

export const deleteWebhook = (options: Options, id: RecordId) =>
  fetchOk(options, url`webhooks/${id}`, "DELETE");
