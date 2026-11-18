import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import type * as Database from "@alveusgg/database";

import { recordWishlistCapture } from "@/server/db/wishlist";

const { mockEnv, mockPrisma, tx } = vi.hoisted(() => {
  const tx = {
    wishlistDonationOrder: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $executeRaw: vi.fn(),
    wishlistItem: {
      update: vi.fn(),
    },
  };
  return {
    mockEnv: {
      NEON_CRM_BASE_URL: "https://neon.example.test/v2/",
      NEON_CRM_API_KEY: "test-key",
      NEON_CRM_ORG_ID: "example",
      WISHLIST_ADDITIONAL_CAMPAIGN_CATEGORIES: undefined as string | undefined,
    },
    tx,
    mockPrisma: {
      $transaction: vi.fn((fn: (client: typeof tx) => unknown) => fn(tx)),
      wishlistDonationOrder: {
        update: vi.fn(),
        fields: new Proxy({}, { get: (_, name) => ({ name }) }),
      },
      wishlistItem: {
        findUnique: vi.fn(),
      },
    },
  };
});

vi.mock("@/env", () => ({ env: mockEnv }));
vi.mock("@alveusgg/database", async (importOriginal) => ({
  ...(await importOriginal<typeof Database>()),
  prisma: mockPrisma,
}));
vi.mock("@/utils/discord", () => ({
  notifyWishlistDonation: vi.fn(() => Promise.resolve()),
  notifyWishlistItemFunded: vi.fn(() => Promise.resolve()),
}));

const item = {
  id: "item-1",
  title: "Heat lamp",
  itemType: "GOAL",
  goalAmountCents: 10_000,
  raisedAmountCents: 0,
  allowPartialDonations: false,
  price: null,
  quantity: 1,
  quantityFulfilled: 0,
  status: "NEEDED",
  categoryId: "category-1",
};

const order = {
  id: "order-1",
  paypalOrderId: "PAYPAL-ORDER-1",
  donorName: "Stream Name",
  donorEmail: null,
  donorMessage: null,
  wishlistItem: item,
};

const capture = {
  paypalOrderId: "PAYPAL-ORDER-1",
  captureId: "CAPTURE-1",
  amount: 25,
  payerEmail: "donor@example.com",
  payerName: "Jane Donor",
};

const category = (slug: string, archivedAt: Date | null = null) => ({
  categoryId: "category-1",
  category: { slug, archivedAt },
});

let fetch: ReturnType<typeof vi.fn>;

const loggedDonation = () => {
  const call = fetch.mock.calls.find(
    ([url]) => url === "https://neon.example.test/v2/donations",
  );
  return JSON.parse(String(call?.[1]?.body));
};

beforeEach(() => {
  mockEnv.WISHLIST_ADDITIONAL_CAMPAIGN_CATEGORIES = "25:arri-wishlist,99:test";
  tx.wishlistDonationOrder.findUnique.mockResolvedValue(order);
  tx.wishlistDonationOrder.update.mockResolvedValue({});
  tx.$executeRaw.mockResolvedValue(1);
  tx.wishlistItem.update.mockResolvedValue({
    ...item,
    raisedAmountCents: 2_500,
  });
  mockPrisma.wishlistDonationOrder.update.mockResolvedValue({});
  fetch = vi.fn((url: string) =>
    Promise.resolve(
      url.endsWith("accounts/search")
        ? Response.json({
            pagination: {
              currentPage: 0,
              pageSize: 1,
              totalPages: 1,
              totalResults: 1,
            },
            searchResults: [{ "Account ID": "123" }],
          })
        : Response.json({ id: "789" }),
    ),
  );
  vi.stubGlobal("fetch", fetch);
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe("wishlist Neon campaign", () => {
  test("logs an item in a mapped category to its campaign", async () => {
    mockPrisma.wishlistItem.findUnique.mockResolvedValue(
      category("arri-wishlist"),
    );

    const result = await recordWishlistCapture(capture);

    expect(result.status).toBe("captured");
    expect(mockPrisma.wishlistItem.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "item-1" } }),
    );
    expect(loggedDonation().campaign).toEqual({ id: "25" });
    expect(mockPrisma.wishlistDonationOrder.update).toHaveBeenCalledWith({
      where: { id: "order-1" },
      data: { neonDonationId: "789" },
    });
  });

  test("logs an item in an unmapped category to the default campaign", async () => {
    mockPrisma.wishlistItem.findUnique.mockResolvedValue(category("other"));

    await recordWishlistCapture(capture);

    expect(loggedDonation().campaign).toEqual({ id: "24" });
    expect(console.warn).not.toHaveBeenCalled();
  });

  test("logs an item with no category to the default campaign", async () => {
    mockPrisma.wishlistItem.findUnique.mockResolvedValue({
      categoryId: null,
      category: null,
    });

    await recordWishlistCapture(capture);

    expect(loggedDonation().campaign).toEqual({ id: "24" });
    expect(console.warn).not.toHaveBeenCalled();
  });

  test("logs the excess over the target to the item's campaign", async () => {
    const partialOrder = {
      ...order,
      wishlistItem: {
        ...item,
        allowPartialDonations: true,
        raisedAmountCents: 9_000,
      },
    };
    tx.wishlistDonationOrder.findUnique.mockResolvedValue(partialOrder);
    tx.wishlistItem.update.mockResolvedValueOnce({
      ...partialOrder.wishlistItem,
      raisedAmountCents: 11_500,
    });
    mockPrisma.wishlistItem.findUnique.mockResolvedValue(
      category("arri-wishlist"),
    );

    const result = await recordWishlistCapture(capture);

    expect(result).toMatchObject({ status: "captured", excessAmount: 15 });
    expect(loggedDonation()).toMatchObject({
      amount: 25,
      campaign: { id: "25" },
    });
  });

  test.each([
    ["archived", category("arri-wishlist", new Date("2026-11-01"))],
    ["missing", { categoryId: "category-1", category: null }],
  ])(
    "falls back to the default campaign with a warning when the category is %s",
    async (_, row) => {
      mockPrisma.wishlistItem.findUnique.mockResolvedValue(row);

      const result = await recordWishlistCapture(capture);

      expect(result.status).toBe("captured");
      expect(loggedDonation().campaign).toEqual({ id: "24" });
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining("item-1"),
      );
    },
  );

  test("falls back to the default campaign when the category lookup fails", async () => {
    mockPrisma.wishlistItem.findUnique.mockRejectedValue(new Error("down"));

    const result = await recordWishlistCapture(capture);

    expect(result.status).toBe("captured");
    expect(loggedDonation().campaign).toEqual({ id: "24" });
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("item-1"),
      expect.any(Error),
    );
  });

  test("logs to the default campaign without a lookup when the variable is unset", async () => {
    mockEnv.WISHLIST_ADDITIONAL_CAMPAIGN_CATEGORIES = undefined;

    const result = await recordWishlistCapture(capture);

    expect(result.status).toBe("captured");
    expect(mockPrisma.wishlistItem.findUnique).not.toHaveBeenCalled();
    expect(loggedDonation().campaign).toEqual({ id: "24" });
  });

  test("logs to the default campaign when the variable is invalid", async () => {
    mockEnv.WISHLIST_ADDITIONAL_CAMPAIGN_CATEGORIES = "abc:arri-wishlist";

    const result = await recordWishlistCapture(capture);

    expect(result.status).toBe("captured");
    expect(mockPrisma.wishlistItem.findUnique).not.toHaveBeenCalled();
    expect(loggedDonation().campaign).toEqual({ id: "24" });
  });
});
