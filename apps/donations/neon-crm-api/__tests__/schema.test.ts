import { describe, expect, it } from "vitest";

import {
  CreateWebhookInputBody,
  DonationResponse,
  DonationWebhookPayload,
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

describe("webhook subscriptions", () => {
  it("accepts mixed event triggers and subscriptions without basic auth", () => {
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

    expect(WebhooksResponse.parse(subscriptions)).toEqual(subscriptions);
  });

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
