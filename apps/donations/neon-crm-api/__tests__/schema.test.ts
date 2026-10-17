import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
    ["Yes", true],
    ["DonorNameAnonymous", true],
    ["No", false],
    [null, false],
    [undefined, false],
  ])(
    "parses %s consistently for sync and webhooks",
    (anonymousType, expected) => {
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

      expect(response.anonymousType).toBe(expected);
      expect(webhook.data.anonymousType).toBe(expected);
    },
  );

  it.each(["DonationAmountAnonymous", "unexpected"])(
    "rejects unsupported anonymity value %s",
    (anonymousType) => {
      expect(
        DonationResponse.safeParse({ ...donation, anonymousType }).success,
      ).toBe(false);
    },
  );
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

describe("webhook subscriptions", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => vi.restoreAllMocks());

  it("drops unsupported hooks without losing the authenticated donation hook", () => {
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

    expect(WebhooksResponse.parse(subscriptions)).toEqual([subscriptions[0]]);
    expect(console.warn).toHaveBeenCalledTimes(5);
    expect(WebhookResponse.safeParse(subscriptions[1]).success).toBe(false);
  });

  it("reports malformed entries while retaining valid siblings", () => {
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

    expect(WebhooksResponse.parse([null, {}, subscription])).toEqual([
      subscription,
    ]);
    expect(console.warn).toHaveBeenCalledTimes(2);
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
