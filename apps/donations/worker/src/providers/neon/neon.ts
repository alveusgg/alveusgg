import { basicAuth } from "hono/basic-auth";
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

type NeonDonationProviderOptions = Options & {
  donationDisplayNameCustomFieldId?: string;
};

export class NeonDonationProvider implements DonationProvider {
  name: Providers = "neon";
  middleware;

  constructor(
    private options: NeonDonationProviderOptions,
    private service: DonationStorage,
  ) {
    if (!options.basicAuthUsername || !options.basicAuthPassword) {
      throw new Error(
        "Neon donation providers require basic auth credentials. Please provide basicAuthUsername and basicAuthPassword .",
      );
    }

    this.middleware = basicAuth({
      username: options.basicAuthUsername,
      password: options.basicAuthPassword,
    });
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

    await setupWebhook(
      `${env.SELF_URL}/donations/${this.name}/live`,
      "CREATE_DONATION",
      options,
    );

    return new NeonDonationProvider(options, service);
  }

  async clear() {
    this.service.config.set(this.name, undefined);
  }

  async handle(request: Request): Promise<Response> {
    const body = await request.json();
    const payload = await parseDonationWebhook(this.options, body);
    if (!payload) {
      return new Response(`The donation payload was unexpected`, {
        status: 400,
      });
    }

    const { data } = payload;

    const account = await getAccount(this.options, data.accountId);
    if (!account) {
      return new Response(
        "Failed to fetch account data for this donation. Rejecting.",
        { status: 400 },
      );
    }
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
      },
      amount: data.amount * 100,
      receivedAt: new Date(data.timestamps.createdDateTime),
      donatedBy: {
        primary: "displayName",
        displayName: displayName,
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
