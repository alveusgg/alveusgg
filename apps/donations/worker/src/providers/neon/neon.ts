import type { NeonDonation, Providers } from "@alveusgg/donations-core";
import { type AccountResponse, getAccount } from "@alveusgg/neon-crm-api";
import { type Options, envToOptions } from "@alveusgg/neon-crm-api/env";
import {
  type DonationWebhookPayload,
  parseDonationWebhook,
  setupWebhook,
} from "@alveusgg/neon-crm-api/webhooks";
import type { DonationProvider } from "..";
import type { DonationStorage } from "../storage";
import timingSafeCompareString from "../../utils/timing-safe-compare-string";

type NeonDonationProviderOptions = Options & {
  donationDisplayNameCustomFieldId?: string;
};

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
    const displayName = this.extractDisplayName(data, account);

    const donation = {
      id: crypto.randomUUID(),
      provider: "neon",
      providerUniqueId: `${payload.organizationId}-${data.id}`,
      providerMetadata: {
        neonCampaignId: data.campaign.id ?? undefined,
        neonCampaignName: data.campaign.name ?? undefined,
        neonFundId: data.fund.id ?? undefined,
        neonFundName: data.fund.name ?? undefined,
        neonAccountId: data.accountId ?? undefined,
      },
      amount: toCents(data.amount),
      receivedAt: new Date(),
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
        fund: String(data.fund.id),
        campaign: String(data.campaign.id),
        donorCoveredFee: data.donorCoveredFeeFlag ? "yes" : "no",
        anonymous: data.anonymousType ? "yes" : "no",
        payLater: data.payLater ? "yes" : "no",
      },
    } satisfies NeonDonation;

    this.service.add(donation);
    return new Response("OK", { status: 200 });
  }

  private extractDisplayName(
    data: DonationWebhookPayload["data"],
    account: AccountResponse,
  ) {
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
