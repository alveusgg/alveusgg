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
  catchUp?: {
    startedAt: string;
    sinceDate: string;
    untilDate: string;
    lastDonationId?: string;
  };
};
type NeonSyncResult = {
  complete: boolean;
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
  private syncPromise?: Promise<NeonSyncResult>;

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

    return new NeonDonationProvider(options, service);
  }

  async registerWebhook(url: string) {
    await setupWebhook(url, "CREATE_DONATION", this.options);
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

    if (this.shouldSkipAmountAnonymousDonation(data)) {
      return new Response("OK", { status: 200 });
    }

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
    // Overlapping cron/manual requests must share one checkpoint writer.
    this.syncPromise ??= this.syncBatch().finally(() => {
      this.syncPromise = undefined;
    });
    return this.syncPromise;
  }

  private async syncBatch(): Promise<NeonSyncResult> {
    const startedAt = new Date();
    const metadata =
      this.service.config.get<NeonSyncMetadata>(SYNC_CONFIG_KEY) ?? {};
    const catchUp: NonNullable<NeonSyncMetadata["catchUp"]> =
      metadata.catchUp ?? {
        startedAt: startedAt.toISOString(),
        sinceDate: formatDateInTimezone(
          subtractDays(
            metadata.lastSyncedAt ? new Date(metadata.lastSyncedAt) : startedAt,
            SYNC_LOOKBACK_DAYS,
          ),
          this.options.localTimezone,
        ),
        // Freeze the local-date window. A later run resumes the same window,
        // then starts its next lookback from this run's start, not completion.
        untilDate: subtractDays(
          new Date(formatDateInTimezone(startedAt, this.options.localTimezone)),
          -1,
        )
          .toISOString()
          .slice(0, 10),
      };
    let found = 0;
    let imported = 0;
    let skipped = 0;

    for (let page = 0; page < SYNC_MAX_PAGES; page++) {
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
            value: catchUp.sinceDate,
          },
          {
            field: "Donation Created Date",
            operator: "LESS_THAN",
            value: catchUp.untilDate,
          },
          ...(catchUp.lastDonationId
            ? [
                {
                  field: "Donation ID",
                  operator: "GREATER_THAN",
                  value: catchUp.lastDonationId,
                },
              ]
            : []),
        ],
        outputFields: [
          "Donation ID",
          "Donation Created Date",
          "Donation Status",
          "Origin Category",
        ],
        pagination: {
          // Advance by unique ID rather than a shifting numeric page offset.
          currentPage: 0,
          pageSize: SYNC_PAGE_SIZE,
          sortColumn: "Donation ID",
          sortDirection: "ASC",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to search Neon donations: ${response.error}`);
      }

      const results = response.data.searchResults;
      let lastId = catchUp.lastDonationId;
      const ids = results.map((result) => {
        const id = result["Donation ID"];
        if (
          typeof id !== "string" ||
          !/^\d+$/.test(id) ||
          (lastId !== undefined && BigInt(id) <= BigInt(lastId))
        ) {
          throw new Error(
            "Neon donation search did not return increasing numeric IDs",
          );
        }
        lastId = id;
        return id;
      });
      const complete = response.data.pagination.totalPages <= 1;
      if (!complete && !ids.length) {
        throw new Error("Neon donation search returned no cursor progress");
      }
      found += results.length;
      for (const [index, id] of ids.entries()) {
        if (
          results[index]?.["Origin Category"] === SELF_IMPORT_ORIGIN_CATEGORY
        ) {
          skipped++;
          continue;
        }
        if (await this.importDonationById(id)) imported++;
        else skipped++;
      }

      // Checkpoint only a fully processed page; a failed page is safely replayed
      // through the existing donation-ID deduplication on the next invocation.
      catchUp.lastDonationId = lastId;
      await this.service.config.set(
        SYNC_CONFIG_KEY,
        complete
          ? { lastSyncedAt: catchUp.startedAt }
          : ({
              ...metadata,
              catchUp: { ...catchUp },
            } satisfies NeonSyncMetadata),
      );
      if (complete) return { complete: true, found, imported, skipped };
    }

    return { complete: false, found, imported, skipped };
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
    if (this.shouldSkipAmountAnonymousDonation(data)) {
      return false;
    }

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

  private shouldSkipAmountAnonymousDonation(data: NeonDonationData) {
    if (!data.amountAnonymous) return false;

    // The public donation/pixel pipeline exposes amounts. Acknowledge but skip
    // these donations until that pipeline can honor amount privacy.
    console.info("Skipping amount-anonymous Neon donation", { id: data.id });
    return true;
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
