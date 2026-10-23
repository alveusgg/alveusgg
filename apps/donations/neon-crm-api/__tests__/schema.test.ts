import { describe, expect, it } from "vitest";

import {
  CreateWebhookInputBody,
  DonationResponse,
  DonationWebhookPayload,
  WebhookResponse,
  WebhooksResponse,
} from "../schema";

const timestamps = {
  createdBy: "API",
  createdDateTime: "2026-01-01T12:00:00Z",
  lastModifiedBy: null,
  lastModifiedDateTime: "2026-01-01T12:00:00Z",
};

const donation = {
  id: "1",
  accountId: "2",
  amount: 10,
  campaign: null,
  fund: null,
  timestamps,
  date: "2026-01-01",
};

describe("donation anonymity", () => {
  it.each([
    ["Yes", true, false],
    ["DonorNameAnonymous", true, false],
    ["DonationAmountAnonymous", false, true],
    ["No", false, false],
    [null, false, false],
    [undefined, false, false],
  ])(
    "parses %s consistently for sync and webhooks",
    (anonymousType, expectedNameAnonymous, expectedAmountAnonymous) => {
      const response = DonationResponse.parse({ ...donation, anonymousType });
      const webhook = DonationWebhookPayload.parse({
        eventTrigger: "createDonation",
        eventTimestamp: "2026-01-01T12:00:00Z",
        organizationId: "example",
        data: {
          ...donation,
          anonymousType,
          campaign: { id: null, name: null },
          fund: { id: null, name: null },
          donorCoveredFeeFlag: false,
        },
      });

      expect(response.anonymousType).toBe(expectedNameAnonymous);
      expect(webhook.data.anonymousType).toBe(expectedNameAnonymous);
      expect(response.amountAnonymous).toBe(expectedAmountAnonymous);
      expect(webhook.data.amountAnonymous).toBe(expectedAmountAnonymous);
    },
  );

  it("rejects unknown anonymity values", () => {
    expect(
      DonationResponse.safeParse({ ...donation, anonymousType: "unexpected" })
        .success,
    ).toBe(false);
  });
});

describe("donation webhook metadata", () => {
  it.each([null, undefined])(
    "accepts campaign and fund being %s",
    (campaignAndFund) => {
      const webhook = DonationWebhookPayload.parse({
        eventTrigger: "createDonation",
        eventTimestamp: "2026-01-01T12:00:00Z",
        organizationId: "example",
        data: {
          ...donation,
          campaign: campaignAndFund,
          fund: campaignAndFund,
          donorCoveredFeeFlag: false,
        },
      });

      expect(webhook.data.campaign).toBe(campaignAndFund);
      expect(webhook.data.fund).toBe(campaignAndFund);
    },
  );
});

describe("donation amounts", () => {
  // Rejecting these made the sync retry them instead of skipping them.
  it.each([0, -5])("parses an amount of %s", (amount) => {
    const response = DonationResponse.parse({ ...donation, amount });
    const webhook = DonationWebhookPayload.parse({
      eventTrigger: "createDonation",
      eventTimestamp: "2026-01-01T12:00:00Z",
      organizationId: "example",
      data: { ...donation, amount, donorCoveredFeeFlag: false },
    });

    expect(response.amount).toBe(amount);
    expect(webhook.data.amount).toBe(amount);
  });
});

describe("webhook subscriptions", () => {
  it("ignores other triggers and retains donation hooks with or without auth", () => {
    const subscriptions = [
      {
        id: "1",
        name: "Donation subscription",
        url: "https://example.com/donations",
        trigger: "CREATE_DONATION",
        contentType: "application/json",
        triggerSelfImport: false,
        httpBasic: { userName: "donations" },
        customParameters: null,
      },
      ...[
        "CREATE_DONATION",
        "CREATE_PLEDGE_PAYMENT",
        "UPDATE_PLEDGE_PAYMENT",
        "UPDATE_DONATION",
        "FUTURE_EVENT",
      ].map((trigger, index) => ({
        id: String(index + 2),
        name: "Another integration",
        url: "https://other.example.com/webhooks",
        trigger,
        contentType: "application/json",
        triggerSelfImport: false,
        httpBasic: null,
        customParameters: null,
      })),
    ];

    expect(WebhooksResponse.parse(subscriptions)).toEqual(
      subscriptions.slice(0, 2),
    );
    expect(WebhookResponse.safeParse(subscriptions[1]).success).toBe(true);
    expect(WebhookResponse.safeParse(subscriptions[2]).success).toBe(false);
  });

  it("rejects malformed donation hooks instead of hiding them from setup", () => {
    const subscription = {
      id: "1",
      name: "Donations",
      url: "https://example.com/donations",
      trigger: "CREATE_DONATION",
      contentType: "application/json",
      triggerSelfImport: false,
      httpBasic: { userName: "donations" },
      customParameters: null,
    };

    expect(
      WebhooksResponse.safeParse([
        subscription,
        { ...subscription, id: "2", url: "invalid" },
      ]).success,
    ).toBe(false);
  });

  it("ignores unsupported triggers without validating their unrelated fields", () => {
    expect(
      WebhooksResponse.parse([{ trigger: "UPDATE_DONATION", url: null }]),
    ).toEqual([]);
  });

  it.each([null, {}, "not an array"])(
    "rejects an invalid listing wrapper: %s",
    (input) => {
      expect(WebhooksResponse.safeParse(input).success).toBe(false);
    },
  );

  it("keeps creation restricted to the supported donation trigger", () => {
    const input = {
      name: "Donation subscription",
      url: "https://example.com/donations",
      trigger: "CREATE_DONATION",
      contentType: "application/json",
      triggerSelfImport: false,
      httpBasic: { userName: "donations", password: "example" },
      customParameters: [],
    };

    expect(CreateWebhookInputBody.safeParse(input).success).toBe(true);
    expect(
      CreateWebhookInputBody.safeParse({ ...input, trigger: "FUTURE_EVENT" })
        .success,
    ).toBe(false);
  });
});
