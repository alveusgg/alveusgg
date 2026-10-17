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
  parseDonationEventWebhook,
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
type NeonFailedDonation = { firstFailedAt: string; attempts: number };
// Imported donations whose payment has not settled yet, and donations removed
// after a failed payment that could still succeed on a retry.
type NeonTrackedPayment = {
  importedAt: string;
  removedAt?: string;
  checkedAt?: string;
};
type NeonTrackedPayments = Record<string, NeonTrackedPayment>;
type NeonSyncMetadata = {
  lastSyncedAt?: string;
  catchUp?: {
    startedAt: string;
    sinceDate: string;
    untilDate: string;
    lastDonationId?: string;
  };
  // Donations that failed to import are retried by later runs, so a single
  // broken record cannot hold back the cursor.
  failedDonations?: Record<string, NeonFailedDonation>;
};
export type NeonSyncResult = {
  complete: boolean;
  found: number;
  imported: number;
  skipped: number;
  retrying: number;
};

const SYNC_CONFIG_KEY = "neon-sync";
const SYNC_LOOKBACK_DAYS = 2;
const SYNC_MAX_PAGES = 10;
const SYNC_PAGE_SIZE = 50;
// Staff enter these by hand, often to backfill donations that were already
// counted elsewhere (e.g. Twitch charity donations that received pixels).
// Search results report a different "Origin Category" than the donation
// record, so only trust the donation's own origin.
const MANUAL_ORIGIN_CATEGORIES = new Set([
  "Batch Donation",
  "Custom Import",
  "Data Entry",
  "Self-Import",
]);
const SUCCEEDED_STATUS = "SUCCEEDED";
const SYNC_MAX_RETRIES_PER_RUN = 10;
// More failures in a row than this look like an outage rather than a broken
// record, so the page is replayed instead of skipped.
const SYNC_MAX_CONSECUTIVE_FAILURES = 3;
const SYNC_FAILED_DONATION_TTL_MS = 24 * 60 * 60 * 1000;
const SYNC_CATCH_UP_ALERT_MS = 6 * 60 * 60 * 1000;
const PAYMENTS_CONFIG_KEY = "neon-payments";
// Neon Pay can take hours to settle a card payment, and a declined payment
// may still be retried after the donor talks to their bank.
const PAYMENT_TRACKING_MS = 7 * 24 * 60 * 60 * 1000;
const SYNC_MAX_PAYMENT_CHECKS = 20;
const FAILED_DONATION_STATUSES = new Set(["FAILED", "CANCELED", "REFUNDED"]);
const WEBHOOK_TRIGGERS = [
  "CREATE_DONATION",
  "UPDATE_DONATION",
  "DELETE_DONATION",
] as const;

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

function reportNeonSyncIssue(
  kind: string,
  context: Record<string, unknown>,
  error?: unknown,
) {
  Sentry.withScope((scope) => {
    scope.setTag("integration", "neon-crm");
    scope.setTag("error.kind", kind);
    scope.setContext("neon", context);
    if (error) Sentry.captureException(error);
    else Sentry.captureMessage(`Neon donation sync: ${kind}`, "warning");
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
    for (const trigger of WEBHOOK_TRIGGERS) {
      await setupWebhook(url, trigger, this.options);
    }
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

    const body: unknown = await request.json();
    if (!isCreateDonationEvent(body)) {
      return this.handleDonationEvent(body);
    }

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

    // The donation record is the source of truth for origin and payment.
    const donationRes = await getDonation(this.options, data.id);
    if (!donationRes.ok) {
      return new Response("Failed to fetch this donation.", { status: 500 });
    }
    const details = donationRes.data;
    if (this.isManualDonation(data.id, details.origin)) {
      return new Response("OK", { status: 200 });
    }
    if (details.status && FAILED_DONATION_STATUSES.has(details.status)) {
      console.info("Skipping Neon donation with a failed payment", {
        id: data.id,
        status: details.status,
      });
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

    // Award pixels right away, but remove them again if the payment fails.
    if (
      (await this.service.add(donation)) > 0 &&
      !isPaymentSucceeded(details)
    ) {
      this.trackPayment(data.id, { importedAt: new Date().toISOString() });
    }
    return new Response("OK", { status: 200 });
  }

  private async handleDonationEvent(body: unknown) {
    const payload = await parseDonationEventWebhook(this.options, body);
    if (!payload) {
      return new Response(`The donation payload was unexpected`, {
        status: 400,
      });
    }

    try {
      await this.reconcilePayment(payload.data.id);
    } catch (error) {
      console.error("Failed to reconcile Neon donation", {
        id: payload.data.id,
        error,
      });
      return new Response("Failed to reconcile this donation.", {
        status: 500,
      });
    }
    return new Response("OK", { status: 200 });
  }

  /**
   * Remove a donation's pixels once its payment fails or it is deleted, and
   * import it again if a removed payment later succeeds.
   */
  private async reconcilePayment(id: string) {
    const tracked = this.getTrackedPayments()[id];
    const donationRes = await getDonation(this.options, id);
    if (!donationRes.ok) {
      if (donationRes.errorType === "request" && donationRes.status === 404) {
        await this.removeDonation(id, "deleted in Neon", tracked);
        return "removed";
      }
      throw new Error(`Failed to fetch Neon donation ${id}`);
    }

    const data = donationRes.data;
    if (data.status && FAILED_DONATION_STATUSES.has(data.status)) {
      if (tracked?.removedAt) return "removed";
      await this.removeDonation(
        id,
        `payment ${data.status.toLowerCase()}`,
        tracked,
      );
      return "removed";
    }
    // Staff edits to older donations also trigger updates; leave those alone.
    if (!tracked) return "ignored";
    if (!isPaymentSucceeded(data)) return "pending";

    // Keep tracking until the re-import succeeds, so a failed one is retried.
    if (tracked.removedAt) await this.importDonation(data);
    this.untrackPayment(id);
    return "settled";
  }

  private async removeDonation(
    id: string,
    reason: string,
    tracked: NeonTrackedPayment | undefined,
  ) {
    await this.service.remove(this.name, this.providerUniqueId(id), reason);
    if (tracked && !tracked.removedAt) {
      this.trackPayment(id, {
        ...tracked,
        removedAt: new Date().toISOString(),
      });
    }
  }

  private async recheckPayments(now: Date) {
    // Least recently checked first, so long-pending payments cannot starve
    // newer ones.
    const entries = Object.entries(this.getTrackedPayments())
      .sort(([, a], [, b]) =>
        (a.checkedAt ?? "").localeCompare(b.checkedAt ?? ""),
      )
      .slice(0, SYNC_MAX_PAYMENT_CHECKS);
    for (const [id, tracked] of entries) {
      try {
        const state = await this.reconcilePayment(id);
        if (
          state !== "settled" &&
          now.getTime() - Date.parse(tracked.importedAt) >= PAYMENT_TRACKING_MS
        ) {
          console.info("Stopped tracking unsettled Neon payment", {
            id,
            state,
          });
          this.untrackPayment(id);
        }
      } catch (error) {
        console.error("Failed to recheck Neon payment", { id, error });
        reportNeonSyncIssue("payment-check-failed", { donationId: id }, error);
      } finally {
        const current = this.getTrackedPayments()[id];
        if (current) {
          this.trackPayment(id, { ...current, checkedAt: now.toISOString() });
        }
      }
    }
  }

  private getTrackedPayments() {
    return (
      this.service.config.get<NeonTrackedPayments>(PAYMENTS_CONFIG_KEY) ?? {}
    );
  }

  private trackPayment(id: string, entry: NeonTrackedPayment) {
    this.service.config.set(PAYMENTS_CONFIG_KEY, {
      ...this.getTrackedPayments(),
      [id]: entry,
    } satisfies NeonTrackedPayments);
  }

  private untrackPayment(id: string) {
    const { [id]: _, ...rest } = this.getTrackedPayments();
    this.service.config.set(
      PAYMENTS_CONFIG_KEY,
      Object.keys(rest).length ? rest : undefined,
    );
  }

  private providerUniqueId(id: string) {
    return `${this.options.organizationId}-${id}`;
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
    if (Object.keys(this.getTrackedPayments()).length) {
      await this.recheckPayments(startedAt);
    }

    const failedDonations = { ...metadata.failedDonations };
    let found = 0;
    let imported = 0;
    let skipped = 0;

    const retries = Object.entries(failedDonations).slice(
      0,
      SYNC_MAX_RETRIES_PER_RUN,
    );
    for (const [id, failure] of retries) {
      // Re-insert failures at the end, so later entries also get their turn.
      delete failedDonations[id];
      try {
        if (await this.importDonationById(id)) imported++;
        else skipped++;
      } catch (error) {
        if (
          startedAt.getTime() - Date.parse(failure.firstFailedAt) <
          SYNC_FAILED_DONATION_TTL_MS
        ) {
          failedDonations[id] = { ...failure, attempts: failure.attempts + 1 };
        } else {
          reportNeonSyncIssue(
            "donation-abandoned",
            { donationId: id, attempts: failure.attempts + 1 },
            error,
          );
        }
      }
    }

    for (let page = 0; page < SYNC_MAX_PAGES; page++) {
      const response = await searchDonations(this.options, {
        searchFields: [
          {
            field: "Donation Status",
            operator: "EQUAL",
            value: "Succeeded",
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
      const pageFailures: Record<string, NeonFailedDonation> = {};
      let consecutiveFailures = 0;
      for (const id of ids) {
        try {
          if (await this.importDonationById(id)) imported++;
          else skipped++;
          consecutiveFailures = 0;
        } catch (error) {
          if (++consecutiveFailures >= SYNC_MAX_CONSECUTIVE_FAILURES) {
            throw error;
          }
          pageFailures[id] = {
            firstFailedAt: startedAt.toISOString(),
            attempts: 1,
          };
          reportNeonSyncIssue("donation-deferred", { donationId: id }, error);
        }
      }

      // Checkpoint only a fully processed page; an aborted page is safely
      // replayed through the existing donation-ID deduplication next time.
      catchUp.lastDonationId = lastId;
      Object.assign(failedDonations, pageFailures);
      const pendingFailures = Object.keys(failedDonations).length
        ? failedDonations
        : undefined;
      await this.service.config.set(
        SYNC_CONFIG_KEY,
        complete
          ? ({
              lastSyncedAt: catchUp.startedAt,
              failedDonations: pendingFailures,
            } satisfies NeonSyncMetadata)
          : ({
              ...metadata,
              catchUp: { ...catchUp },
              failedDonations: pendingFailures,
            } satisfies NeonSyncMetadata),
      );
      const retrying = Object.keys(failedDonations).length;
      if (complete) {
        return { complete: true, found, imported, skipped, retrying };
      }
    }

    const catchUpDuration = startedAt.getTime() - Date.parse(catchUp.startedAt);
    if (catchUpDuration >= SYNC_CATCH_UP_ALERT_MS) {
      reportNeonSyncIssue("catch-up-delayed", {
        catchUpStartedAt: catchUp.startedAt,
        lastDonationId: catchUp.lastDonationId,
      });
    }

    return {
      complete: false,
      found,
      imported,
      skipped,
      retrying: Object.keys(failedDonations).length,
    };
  }

  private async importDonationById(id: string) {
    const donationResponse = await getDonation(this.options, id);
    if (!donationResponse.ok) {
      // Search still lists some deleted donations; retrying cannot help.
      if (
        donationResponse.errorType === "request" &&
        donationResponse.status === 404
      ) {
        console.info("Skipping deleted Neon donation", { id });
        return false;
      }
      throw new Error(`Failed to fetch Neon donation ${id}`);
    }

    return this.importDonation(donationResponse.data);
  }

  private async importDonation(data: Donation) {
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

    if (this.isManualDonation(data.id, data.origin)) {
      return false;
    }

    return isPaymentSucceeded(data);
  }

  private isManualDonation(id: string, origin: NeonDonationData["origin"]) {
    const category = origin?.originCategory;
    if (!category || !MANUAL_ORIGIN_CATEGORIES.has(category)) return false;

    console.info("Skipping manually entered Neon donation", { id, category });
    return true;
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

const isCreateDonationEvent = (body: unknown) =>
  typeof body === "object" &&
  body !== null &&
  "eventTrigger" in body &&
  body.eventTrigger === "createDonation";

const isPaymentSucceeded = (data: Donation) => {
  if (data.status && data.status !== SUCCEEDED_STATUS) return false;
  return (
    data.payments.length === 0 ||
    data.payments.some((payment) => payment.paymentStatus === SUCCEEDED_STATUS)
  );
};

const toCents = (val: number): number =>
  Number.parseInt(val.toFixed(2).replace(".", ""), 10);

const subtractDays = (date: Date, days: number) =>
  new Date(date.getTime() - days * 24 * 60 * 60 * 1000);
