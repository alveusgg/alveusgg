import {
  type CreateWebhookInput,
  type DonationResponse as Donation,
  type DonationSearchResponse as DonationSearch,
  type UpdateCustomFieldInput,
  AccountResponse,
  AccountSearchResponse,
  CreateAccountResponse,
  CreateDonationInput,
  CreateDonationResponse,
  CreateIndividualAccountInput,
  CreateWebhookResponse,
  CustomFieldResponse,
  DonationResponse,
  DonationSearchResponse,
  RecordId,
  WebhookResponse,
  WebhooksResponse,
} from "./schema";
import { fetchOk, fetchWithSchema, type Options, url } from "./api";
import { fixTimestampsTimezone } from "./utils";

export { formatDateInTimezone } from "./utils";

export type { Donation, DonationSearch };
export {
  type CreateDonationInput,
  type CreateIndividualAccountInput,
  type RecordId,
  AccountResponse,
  AccountSearchResponse,
  CreateAccountResponse,
  CreateDonationResponse,
  CreateWebhookResponse,
  PAYPAL_TENDER_TYPE,
  CustomFieldResponse,
  DonationResponse,
  DonationSearchResponse,
  WebhookResponse,
  WebhooksResponse,
} from "./schema";

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

export type AccountSearchInput = DonationSearchInput;

export const searchAccounts = (options: Options, search: AccountSearchInput) =>
  fetchWithSchema(
    options,
    "accounts/search",
    AccountSearchResponse,
    "POST",
    search,
  );

export const createAccount = async (
  options: Options,
  input: CreateIndividualAccountInput,
) => {
  const body = CreateIndividualAccountInput.safeParse(input);
  if (!body.success) {
    return { ok: false, errorType: "parse", error: body.error } as const;
  }

  return fetchWithSchema(
    options,
    "accounts",
    CreateAccountResponse,
    "POST",
    body.data,
  );
};

const splitName = (name: string | null | undefined) => {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return {};
  if (parts.length === 1) return { firstName: parts[0] };
  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts[parts.length - 1],
  };
};

/** Reuses the first account whose email matches, otherwise creates one. */
export const findOrCreateAccount = async (
  options: Options,
  { email, name }: { email: string; name?: string | null },
) => {
  const search = await searchAccounts(options, {
    searchFields: [{ field: "Email", operator: "EQUAL", value: email }],
    outputFields: ["Account ID"],
    pagination: { currentPage: 0, pageSize: 1 },
  });
  if (!search.ok) return search;

  const existing = search.data.searchResults[0]?.["Account ID"];
  if (existing !== undefined && existing !== null) {
    // Fail rather than create a duplicate account if the id is unexpected.
    const id = RecordId.safeParse(String(existing));
    if (!id.success) {
      return { ok: false, errorType: "parse", error: id.error } as const;
    }
    return { ok: true, data: { id: id.data, created: false } } as const;
  }

  const created = await createAccount(options, {
    individualAccount: {
      primaryContact: { ...splitName(name), email1: email },
    },
  });
  if (!created.ok) return created;

  return { ok: true, data: { id: created.data.id, created: true } } as const;
};

export const createDonation = async (
  options: Options,
  input: CreateDonationInput,
) => {
  const body = CreateDonationInput.safeParse(input);
  if (!body.success) {
    return { ok: false, errorType: "parse", error: body.error } as const;
  }

  return fetchWithSchema(
    options,
    "donations",
    CreateDonationResponse,
    "POST",
    body.data,
  );
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

export const deleteWebhook = (options: Options, id: RecordId) =>
  fetchOk(options, url`webhooks/${id}`, "DELETE");
