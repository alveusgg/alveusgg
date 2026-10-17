import { describe, expect, it } from "vitest";

import {
  CreateWebhookInputBody,
  DonationEventWebhookPayload,
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

    expect(WebhooksResponse.parse(subscriptions)).toEqual([
      subscriptions[0],
      subscriptions[1],
      subscriptions[4],
    ]);
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
      WebhooksResponse.parse([{ trigger: "UPDATE_PLEDGE_PAYMENT", url: null }]),
    ).toEqual([]);
  });

  it.each([null, {}, "not an array"])(
    "rejects an invalid listing wrapper: %s",
    (input) => {
      expect(WebhooksResponse.safeParse(input).success).toBe(false);
    },
  );

  it("keeps creation restricted to the supported donation triggers", () => {
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
    for (const trigger of ["UPDATE_DONATION", "DELETE_DONATION"]) {
      expect(
        CreateWebhookInputBody.safeParse({ ...input, trigger }).success,
      ).toBe(true);
    }
    expect(
      CreateWebhookInputBody.safeParse({ ...input, trigger: "FUTURE_EVENT" })
        .success,
    ).toBe(false);
  });
});

describe("donation event webhooks", () => {
  const base = {
    eventTimestamp: "2026-10-17T15:50:00Z",
    organizationId: "example",
    customParameters: { uuid: "UPDATE_DONATION:https://example.com" },
  };

  it("reads the donation ID from update events", () => {
    expect(
      DonationEventWebhookPayload.parse({
        ...base,
        eventTrigger: "updateDonation",
        data: { id: "47321", amount: 2 },
      }).data.id,
    ).toBe("47321");
  });

  it("reads the donation ID from delete events", () => {
    expect(
      DonationEventWebhookPayload.parse({
        ...base,
        eventTrigger: "deleteDonation",
        data: {
          donation: {
            donationId: 47322,
            deletedDateTime: "2026-10-17T10:50:00Z",
          },
        },
      }).data.id,
    ).toBe("47322");
  });

  it("rejects events without a donation ID", () => {
    expect(
      DonationEventWebhookPayload.safeParse({
        ...base,
        eventTrigger: "updateDonation",
        data: {},
      }).success,
    ).toBe(false);
  });
});
