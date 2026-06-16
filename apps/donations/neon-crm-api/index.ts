import {
  type AccountDonation,
  type CreateWebhookInput,
  type RecordId,
  type UpdateCustomFieldInput,
  AccountDonationsResponse,
  AccountResponse,
  CreateWebhookResponse,
  CustomFieldResponse,
  WebhookResponse,
  WebhooksResponse,
} from "./schema.js";
import { type Options, url, fetchOk, fetchWithSchema } from "./api.js";
import { fixTimestampsTimezone } from "./utils";

export {
  type AccountDonation,
  AccountDonationsResponse,
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

export const getAccountDonations = async (
  options: Options,
  id: RecordId,
  { maxPages = Number.POSITIVE_INFINITY }: { maxPages?: number } = {},
) => {
  const donations: AccountDonation[] = [];
  let totalPages = 1;

  for (let page = 0; page < totalPages; page += 1) {
    if (page >= maxPages) {
      return {
        ok: false,
        errorType: "request",
        error: `Account ${id} has at least ${totalPages} donation pages; maxPages=${maxPages}`,
      } as const;
    }

    if (options.debug) {
      console.info(`[neon-api] account ${id} donations page ${page} begin`);
    }

    const response = await fetchAccountDonationsPage(options, id, page);

    if (!response.ok) {
      if (options.debug) {
        console.info(
          `[neon-api] account ${id} donations page ${page} failed`,
          response,
        );
      }
      return response;
    }

    for (const donation of response.data.donations) {
      donation.timestamps = fixTimestampsTimezone(
        donation.timestamps,
        options.localTimezone,
      );
    }

    donations.push(...response.data.donations);
    totalPages = response.data.pagination.totalPages;

    if (options.debug) {
      console.info(
        `[neon-api] account ${id} donations page ${page} parsed ${response.data.donations.length}; totalPages=${totalPages}`,
      );
    }
  }

  if (options.debug) {
    console.info(
      `[neon-api] account ${id} donations complete: ${donations.length}`,
    );
  }

  return { ok: true, data: donations } as const;
};

async function fetchAccountDonationsPage(
  options: Options,
  id: RecordId,
  page: number,
) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetchWithSchema(
      options,
      `${url`accounts/${id}/donations`}?currentPage=${page}`,
      AccountDonationsResponse,
    );

    if (
      response.ok ||
      response.errorType !== "request" ||
      !response.error.includes("429")
    ) {
      return response;
    }

    await new Promise((resolve) => setTimeout(resolve, 1_000 * (attempt + 1)));
  }

  return fetchWithSchema(
    options,
    `${url`accounts/${id}/donations`}?currentPage=${page}`,
    AccountDonationsResponse,
  );
}

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
