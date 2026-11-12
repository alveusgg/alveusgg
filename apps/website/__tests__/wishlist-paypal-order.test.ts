import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import type { Context } from "@/server/trpc/context";
import { wishlistRouter } from "@/server/trpc/router/wishlist";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    wishlistItem: { findUnique: vi.fn() },
    wishlistDonationOrder: { create: vi.fn() },
  },
}));

vi.mock("@/env", () => ({
  env: {
    NEXT_PUBLIC_BASE_URL: "https://alveus.example.test",
    PAYPAL_ENV: "sandbox",
    PAYPAL_CLIENT_ID: "client-id",
    PAYPAL_CLIENT_SECRET: "client-secret",
  },
}));
vi.mock("@alveusgg/database", () => ({ prisma: mockPrisma }));
vi.mock("@/server/utils/auth", () => ({
  checkPermissions: () => true,
  checkIsSuperUserSession: () => false,
}));

const caller = wishlistRouter.createCaller({
  session: null,
} as unknown as Context);

const product = {
  id: "item-1",
  title: "Heat lamp for the reptile room",
  itemType: "PRODUCT",
  status: "NEEDED",
  allowPartialDonations: false,
  goalAmountCents: null,
  raisedAmountCents: 0,
  price: "$40.00",
  quantity: 2,
  quantityFulfilled: 0,
};

const orderTypes = [
  { name: "a donation", item: product, amount: 40 },
  {
    name: "a chip-in",
    item: { ...product, id: "item-2", allowPartialDonations: true },
    amount: 10,
  },
  {
    name: "a goal contribution",
    item: {
      ...product,
      id: "goal-1",
      title: "Enclosure fund",
      itemType: "GOAL",
      price: null,
      quantity: 1,
      goalAmountCents: 50_000,
    },
    amount: 25,
  },
];

const orderBody = (fetch: ReturnType<typeof vi.fn>) => {
  const call = fetch.mock.calls.find(([url]) =>
    String(url).endsWith("/v2/checkout/orders"),
  );
  return JSON.parse(String(call?.[1]?.body));
};

beforeEach(() => {
  vi.spyOn(console, "log").mockImplementation(() => {});
  mockPrisma.wishlistDonationOrder.create.mockResolvedValue({});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe("PayPal order request", () => {
  test.each(orderTypes)(
    "tags $name with the fixed description and custom ID",
    async ({ item, amount }) => {
      mockPrisma.wishlistItem.findUnique.mockResolvedValue(item);
      const fetch = vi
        .fn()
        .mockResolvedValueOnce(Response.json({ access_token: "token" }))
        .mockResolvedValueOnce(
          Response.json({
            id: "PAYPAL-ORDER-1",
            links: [{ rel: "approve", href: "https://paypal.test/approve" }],
          }),
        );
      vi.stubGlobal("fetch", fetch);

      await caller.createDonateOrder({ wishlistItemId: item.id, amount });

      expect(orderBody(fetch)).toEqual({
        intent: "CAPTURE",
        purchase_units: [
          {
            custom_id: "campaign_wishlist",
            description: "Alveus Sanctuary Wishlist",
            amount: { currency_code: "USD", value: amount.toFixed(2) },
          },
        ],
        application_context: {
          return_url: `https://alveus.example.test/wishlist/donate/success?itemId=${item.id}`,
          cancel_url: "https://alveus.example.test/wishlist?donated=cancelled",
          user_action: "PAY_NOW",
        },
      });
    },
  );
});
