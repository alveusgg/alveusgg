import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { recordWishlistCapture } from "@/server/db/wishlist";

const { mockEnv, mockPrisma, tx } = vi.hoisted(() => {
  const tx = {
    wishlistDonationOrder: {
      findUnique: vi.fn(),
      updateMany: vi.fn(),
    },
    wishlistItem: {
      update: vi.fn(),
    },
  };
  return {
    mockEnv: {
      NEON_CRM_BASE_URL: "https://neon.example.test/v2/",
      NEON_CRM_API_KEY: "test-key" as string | undefined,
      NEON_CRM_ORG_ID: "example",
    },
    tx,
    mockPrisma: {
      $transaction: vi.fn((fn: (client: typeof tx) => unknown) => fn(tx)),
      wishlistDonationOrder: { update: vi.fn() },
    },
  };
});

vi.mock("@/env", () => ({ env: mockEnv }));
vi.mock("@alveusgg/database", () => ({ prisma: mockPrisma }));
vi.mock("@/utils/discord", () => ({
  notifyWishlistDonation: vi.fn(() => Promise.resolve()),
}));

const item = {
  id: "item-1",
  title: "Heat lamp",
  itemType: "GOAL",
  goalAmountCents: 10_000,
  raisedAmountCents: 0,
  price: null,
  quantity: 1,
  quantityFulfilled: 0,
  status: "NEEDED",
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

const neonSearch = (rows: Array<Record<string, string>>) =>
  Response.json({
    pagination: {
      currentPage: 0,
      pageSize: 1,
      totalPages: rows.length ? 1 : 0,
      totalResults: rows.length,
    },
    searchResults: rows,
  });

const bodyOf = (fetch: ReturnType<typeof vi.fn>, call: number) =>
  JSON.parse(String(fetch.mock.calls[call]?.[1]?.body));

beforeEach(() => {
  mockEnv.NEON_CRM_API_KEY = "test-key";
  tx.wishlistDonationOrder.findUnique.mockResolvedValue(order);
  tx.wishlistDonationOrder.updateMany.mockResolvedValue({ count: 1 });
  tx.wishlistItem.update.mockResolvedValue({
    ...item,
    raisedAmountCents: 2_500,
  });
  mockPrisma.wishlistDonationOrder.update.mockResolvedValue({});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe("recordWishlistCapture", () => {
  test("reuses an existing Neon account and logs a PayPal donation", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(neonSearch([{ "Account ID": "123" }]))
      .mockResolvedValueOnce(Response.json({ id: "789" }));
    vi.stubGlobal("fetch", fetch);

    const result = await recordWishlistCapture(capture);

    expect(result.status).toBe("captured");
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls[0]?.[0]).toBe(
      "https://neon.example.test/v2/accounts/search",
    );
    expect(bodyOf(fetch, 0)).toEqual({
      searchFields: [
        { field: "Email", operator: "EQUAL", value: "donor@example.com" },
      ],
      outputFields: ["Account ID"],
      pagination: { currentPage: 0, pageSize: 1 },
    });
    expect(fetch.mock.calls[1]?.[0]).toBe(
      "https://neon.example.test/v2/donations",
    );
    expect(bodyOf(fetch, 1)).toEqual({
      accountId: "123",
      amount: 25,
      date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      payments: [
        {
          amount: 25,
          tenderType: 17,
          paymentStatus: "Succeeded",
          note: "PayPal capture ID: CAPTURE-1 (Wishlist: Heat lamp)",
        },
      ],
    });
    expect(mockPrisma.wishlistDonationOrder.update).toHaveBeenCalledWith({
      where: { id: "order-1" },
      data: { neonDonationId: "789" },
    });
  });

  test("creates a Neon account when none matches the email", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(neonSearch([]))
      .mockResolvedValueOnce(Response.json({ id: "456" }))
      .mockResolvedValueOnce(Response.json({ id: "790" }));
    vi.stubGlobal("fetch", fetch);

    await recordWishlistCapture(capture);

    expect(fetch).toHaveBeenCalledTimes(3);
    expect(fetch.mock.calls[1]?.[0]).toBe(
      "https://neon.example.test/v2/accounts",
    );
    expect(bodyOf(fetch, 1)).toEqual({
      individualAccount: {
        primaryContact: {
          firstName: "Jane",
          lastName: "Donor",
          email1: "donor@example.com",
        },
      },
    });
    expect(bodyOf(fetch, 2)).toMatchObject({
      accountId: "456",
      payments: [{ tenderType: 17, paymentStatus: "Succeeded" }],
    });
  });

  test("claims the order by capture ID before applying it", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(neonSearch([{ "Account ID": "123" }]))
        .mockResolvedValueOnce(Response.json({ id: "789" })),
    );

    await recordWishlistCapture(capture);

    expect(tx.wishlistDonationOrder.updateMany).toHaveBeenCalledWith({
      where: {
        id: "order-1",
        status: { not: "CAPTURED" },
        paypalTransactionId: null,
      },
      data: expect.objectContaining({
        status: "CAPTURED",
        paypalTransactionId: "CAPTURE-1",
        capturedAmount: 25,
      }),
    });
    expect(tx.wishlistItem.update).toHaveBeenCalledWith({
      where: { id: "item-1" },
      data: { raisedAmountCents: { increment: 2_500 } },
    });
  });

  test("ignores a duplicate capture without crediting or logging again", async () => {
    tx.wishlistDonationOrder.updateMany.mockResolvedValue({ count: 0 });
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);

    const result = await recordWishlistCapture(capture);

    expect(result.status).toBe("duplicate");
    expect(tx.wishlistItem.update).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
    expect(mockPrisma.wishlistDonationOrder.update).not.toHaveBeenCalled();
  });

  test("keeps the donation when Neon fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 500 })),
    );
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await recordWishlistCapture(capture);

    expect(result.status).toBe("captured");
    expect(tx.wishlistItem.update).toHaveBeenCalled();
    expect(mockPrisma.wishlistDonationOrder.update).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining("Neon CRM log failed"),
      expect.any(Error),
    );
  });

  test("skips Neon when it is not configured", async () => {
    mockEnv.NEON_CRM_API_KEY = undefined;
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = await recordWishlistCapture(capture);

    expect(result.status).toBe("captured");
    expect(fetch).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("Neon CRM is not configured"),
    );
  });
});
