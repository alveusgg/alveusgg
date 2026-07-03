import type { NeonDonation, Providers } from "@alveusgg/donations-core";
import {
  type AccountResponse,
  type Donation,
  formatDateInTimezone,
  getAccount,
  getDonation,
  searchDonations,
} from "@alveusgg/neon-crm-api";
import { type Options, envToOptions } from "@alveusgg/neon-crm-api/env";
import {
  type DonationWebhookPayload,
  parseDonationWebhook,
  setupWebhook,
} from "@alveusgg/neon-crm-api/webhooks";
import * as Sentry from "@sentry/cloudflare";
import type { ZodError } from "zod";
import type { DonationProvider } from "..";
import type { DonationStorage } from "../storage";
import timingSafeCompareString from "../../utils/timing-safe-compare-string";

type NeonDonationProviderOptions = Options & {
  donationDisplayNameCustomFieldId?: string;
  onParseError?: (
    error: ZodError,
    context: {
      eventTrigger?: string;
      kind?: string;
      method?: string;
      path?: string;
    },
  ) => void;
};

type NeonDonationData = DonationWebhookPayload["data"] | Donation;
type NeonSyncMetadata = {
  lastSyncedAt?: string;
};
type NeonSyncResult = {
  found: number;
  imported: number;
  skipped: number;
};

const SYNC_CONFIG_KEY = "neon-sync";
const SYNC_LOOKBACK_DAYS = 2;
const SYNC_MAX_PAGES = 10;
const SYNC_PAGE_SIZE = 50;
const SELF_IMPORT_ORIGIN_CATEGORY = "Self-Import";
const SUCCEEDED_STATUS = "SUCCEEDED";

function reportNeonParseError(
  error: ZodError,
  context: {
    eventTrigger?: string;
    kind?: string;
    method?: string;
    path?: string;
  },
) {
  Sentry.withScope((scope) => {
    scope.setTag("integration", "neon-crm");
    scope.setTag("error.kind", "schema-parse");
    if (context.path) scope.setTag("neon.path", context.path);
    if (context.kind) scope.setTag("neon.kind", context.kind);
    scope.setContext("neon", context);
    scope.setContext("zod", { issues: error.issues });
    Sentry.captureException(error);
  });
}

export class NeonDonationProvider implements DonationProvider {
  name: Providers = "neon";

  constructor(
    private options: NeonDonationProviderOptions,
    private service: DonationStorage,
  ) {
    if (!options.basicAuthUsername || !options.basicAuthPassword) {
      throw new Error(
        "Neon donation providers require basic auth credentials. Please provide basicAuthUsername and basicAuthPassword .",
      );
    }
  }

  static async init(
    service: DonationStorage,
    env: Env,
  ): Promise<NeonDonationProvider> {
    const options: NeonDonationProviderOptions = {
      ...envToOptions(env),
      donationDisplayNameCustomFieldId:
        env.NEON_DONATION_DISPLAY_NAME_CUSTOM_FIELD_ID,
      onParseError: reportNeonParseError,
    };

    try {
      await setupWebhook(
        `${env.SELF_URL}/donations/neon/live`,
        "CREATE_DONATION",
        options,
      );
    } catch (e) {
      console.error("Failed to set up Neon webhook", e);
      throw e;
    }

    return new NeonDonationProvider(options, service);
  }

  async clear() {
    this.service.config.set(this.name, undefined);
    this.service.config.set(SYNC_CONFIG_KEY, undefined);
  }

  async handle(request: Request): Promise<Response> {
    const expectedAuth = btoa(
      `${this.options.basicAuthUsername}:${this.options.basicAuthPassword}`,
    );
    const authHeader = request.headers.get("authorization");
    if (
      !authHeader ||
      !timingSafeCompareString(authHeader, `Basic ${expectedAuth}`)
    ) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const payload = await parseDonationWebhook(this.options, body);
    if (!payload) {
      return new Response(`The donation payload was unexpected`, {
        status: 400,
      });
    }

    const { data } = payload;

    const accountRes = await getAccount(this.options, data.accountId);
    if (!accountRes.ok) {
      if (accountRes.errorType === "request")
        return new Response(
          "Failed to fetch account data for this donation. Rejecting.",
          { status: 400 },
        );

      return new Response("Failed to fetch account data for this donation.", {
        status: 500,
      });
    }

    const account = accountRes.data;
    const donation = this.createDonation(data, account, new Date());

    await this.service.add(donation);
    return new Response("OK", { status: 200 });
  }

  async syncRecentDonations(): Promise<NeonSyncResult> {
    const startedAt = new Date();
    const metadata =
      this.service.config.get<NeonSyncMetadata>(SYNC_CONFIG_KEY) ?? {};
    const since = subtractDays(
      metadata.lastSyncedAt ? new Date(metadata.lastSyncedAt) : startedAt,
      SYNC_LOOKBACK_DAYS,
    );
    const sinceDate = formatDateInTimezone(since, this.options.localTimezone);

    let currentPage = 0;
    let totalPages = 1;
    let found = 0;
    let imported = 0;
    let skipped = 0;

    while (currentPage < totalPages && currentPage < SYNC_MAX_PAGES) {
      const response = await searchDonations(this.options, {
        searchFields: [
          {
            field: "Donation Status",
            operator: "EQUAL",
            value: "Succeeded",
          },
          {
            field: "Origin Category",
            operator: "NOT_EQUAL",
            value: SELF_IMPORT_ORIGIN_CATEGORY,
          },
          {
            field: "Donation Created Date",
            operator: "GREATER_AND_EQUAL",
            value: sinceDate,
          },
        ],
        outputFields: [
          "Donation ID",
          "Donation Created Date",
          "Donation Status",
          "Origin Category",
        ],
        pagination: {
          currentPage,
          pageSize: SYNC_PAGE_SIZE,
          sortColumn: "Donation Created Date",
          sortDirection: "DESC",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to search Neon donations: ${response.error}`);
      }

      totalPages = response.data.pagination.totalPages;
      found += response.data.searchResults.length;

      for (const result of response.data.searchResults) {
        const donationId = result["Donation ID"];
        if (typeof donationId !== "string") {
          skipped++;
          continue;
        }

        const importedDonation = await this.importDonationById(donationId);
        if (importedDonation) {
          imported++;
        } else {
          skipped++;
        }
      }

      currentPage++;
    }

    if (totalPages > SYNC_MAX_PAGES) {
      throw new Error(
        `Neon donation sync found ${totalPages} pages since ${sinceDate}; max pages is ${SYNC_MAX_PAGES}.`,
      );
    }

    this.service.config.set(SYNC_CONFIG_KEY, {
      lastSyncedAt: startedAt.toISOString(),
    } satisfies NeonSyncMetadata);

    return { found, imported, skipped };
  }

  private async importDonationById(id: string) {
    const donationResponse = await getDonation(this.options, id);
    if (!donationResponse.ok) {
      throw new Error(`Failed to fetch Neon donation ${id}`);
    }

    const data = donationResponse.data;
    if (!this.shouldSyncDonation(data)) {
      return false;
    }

    const accountRes = await getAccount(this.options, data.accountId);
    if (!accountRes.ok) {
      throw new Error(`Failed to fetch Neon account ${data.accountId}`);
    }

    const donation = this.createDonation(data, accountRes.data, new Date());
    return (await this.service.add(donation)) > 0;
  }

  private shouldSyncDonation(data: Donation) {
    if (data.origin?.originCategory === SELF_IMPORT_ORIGIN_CATEGORY) {
      return false;
    }

    if (data.status && data.status !== SUCCEEDED_STATUS) {
      return false;
    }

    return (
      data.payments.length === 0 ||
      data.payments.some(
        (payment) =>
          payment.paymentStatus && payment.paymentStatus === SUCCEEDED_STATUS,
      )
    );
  }

  private createDonation(
    data: NeonDonationData,
    account: AccountResponse,
    receivedAt: Date,
  ) {
    const displayName = this.extractDisplayName(data, account);

    return {
      id: crypto.randomUUID(),
      provider: "neon",
      providerUniqueId: `${this.options.organizationId}-${data.id}`,
      providerMetadata: {
        neonCampaignId: data.campaign?.id ?? undefined,
        neonCampaignName: data.campaign?.name ?? undefined,
        neonFundId: data.fund?.id ?? undefined,
        neonFundName: data.fund?.name ?? undefined,
        neonAccountId: data.accountId ?? undefined,
      },
      amount: toCents(data.amount),
      receivedAt,
      donatedAt: data.timestamps.createdDateTime,
      donatedBy: {
        primary: "displayName",
        displayName: displayName,
        email:
          account.individualAccount?.primaryContact.email1 ??
          account.companyAccount?.primaryContact.email1 ??
          undefined,
        firstName:
          account.individualAccount?.primaryContact.firstName ?? undefined,
        lastName:
          account.individualAccount?.primaryContact.lastName ?? undefined,
        username:
          account.individualAccount?.login?.username ??
          account.companyAccount?.login?.username ??
          undefined,
      },
      tags: {
        fund: String(data.fund?.id ?? ""),
        campaign: String(data.campaign?.id ?? ""),
        donorCoveredFee: data.donorCoveredFeeFlag ? "yes" : "no",
        anonymous: data.anonymousType ? "yes" : "no",
        payLater: data.payLater ? "yes" : "no",
      },
    } satisfies NeonDonation;
  }

  private extractDisplayName(data: NeonDonationData, account: AccountResponse) {
    if (data.anonymousType) {
      return "Anonymous";
    }

    const customFieldId = this.options.donationDisplayNameCustomFieldId;
    if (customFieldId) {
      const displayNameField = data.donationCustomFields?.find(
        ({ id }) => id === customFieldId,
      );
      if (
        displayNameField &&
        "value" in displayNameField &&
        displayNameField.value.trim() !== ""
      ) {
        return displayNameField.value.trim();
      }
    }

    if (account.individualAccount) {
      if (account.individualAccount.primaryContact.preferredName) {
        return account.individualAccount.primaryContact.preferredName;
      }

      if (account.individualAccount.primaryContact.firstName) {
        return account.individualAccount.primaryContact.firstName;
      }
    }

    if (account.companyAccount) {
      if (account.companyAccount.name) {
        return account.companyAccount.name;
      }

      if (account.companyAccount.primaryContact.preferredName) {
        return account.companyAccount.primaryContact.preferredName;
      }

      if (account.companyAccount.primaryContact.firstName) {
        return account.companyAccount.primaryContact.firstName;
      }
    }

    return "Anonymous";
  }
}

const toCents = (val: number): number =>
  Number.parseInt(val.toFixed(2).replace(".", ""), 10);

const subtractDays = (date: Date, days: number) =>
  new Date(date.getTime() - days * 24 * 60 * 60 * 1000);
