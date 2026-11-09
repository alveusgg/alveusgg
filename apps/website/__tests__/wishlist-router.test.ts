import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import type { Context } from "@/server/trpc/context";
import { adminWishlistRouter } from "@/server/trpc/router/admin/wishlist";
import { wishlistRouter } from "@/server/trpc/router/wishlist";

import { getPayPalReturnParams } from "@/data/wishlist";

import { createPayPalOrder } from "@/utils/paypal";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    wishlistItem: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    wishlistDonationOrder: {
      create: vi.fn(),
      findMany: vi.fn(),
      groupBy: vi.fn(),
    },
  },
}));

vi.mock("@/env", () => ({
  env: { NEXT_PUBLIC_BASE_URL: "https://alveus.example.test" },
}));
vi.mock("@alveusgg/database", () => ({ prisma: mockPrisma }));
vi.mock("@/server/utils/auth", () => ({
  checkPermissions: () => true,
  checkIsSuperUserSession: () => false,
}));
vi.mock("@/utils/paypal", () => ({
  createPayPalOrder: vi.fn(() =>
    Promise.resolve({
      orderId: "PAYPAL-ORDER-1",
      approvalUrl: "https://paypal.example.test/approve",
    }),
  ),
  capturePayPalOrder: vi.fn(),
}));

const publicCaller = wishlistRouter.createCaller({
  session: null,
} as unknown as Context);
const adminCaller = adminWishlistRouter.createCaller({
  session: { user: { id: "user-1", name: "admin" } },
} as unknown as Context);

const product = {
  id: "item-1",
  title: "Heat lamp",
  itemType: "PRODUCT",
  status: "NEEDED",
  allowPartialDonations: false,
  goalAmountCents: null,
  raisedAmountCents: 0,
  price: "$40.00",
  quantity: 2,
  quantityFulfilled: 0,
};

const goal = {
  ...product,
  id: "goal-1",
  itemType: "GOAL",
  price: null,
  quantity: 1,
  goalAmountCents: 50_000,
};

beforeEach(() => {
  vi.spyOn(console, "log").mockImplementation(() => {});
  mockPrisma.wishlistItem.update.mockResolvedValue({});
  mockPrisma.wishlistItem.create.mockResolvedValue({});
  mockPrisma.wishlistDonationOrder.create.mockResolvedValue({});
});

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe("PayPal return URL", () => {
  test("reads the order ID from the token PayPal appends", () => {
    expect(
      getPayPalReturnParams({
        itemId: "item-1",
        token: "PAYPAL-ORDER-1",
        PayerID: "PAYER-1",
      }),
    ).toEqual({ orderId: "PAYPAL-ORDER-1", itemId: "item-1" });
  });

  test("leaves the order ID unset when the token is missing", () => {
    expect(getPayPalReturnParams({ itemId: "item-1" })).toEqual({
      orderId: undefined,
      itemId: "item-1",
    });
    expect(getPayPalReturnParams({ itemId: "item-1", token: "" })).toEqual({
      orderId: undefined,
      itemId: "item-1",
    });
  });

  test("creates the order without an order ID placeholder", async () => {
    mockPrisma.wishlistItem.findUnique.mockResolvedValue(product);

    await publicCaller.createDonateOrder({
      wishlistItemId: "item-1",
      amount: 40,
    });

    expect(createPayPalOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        returnUrl:
          "https://alveus.example.test/wishlist/donate/success?itemId=item-1",
        cancelUrl: "https://alveus.example.test/wishlist?donated=cancelled",
      }),
    );
  });
});

describe("public item list", () => {
  test("does not accept the archived status", async () => {
    await expect(
      publicCaller.getPublicItems({ status: "ARCHIVED" as "NEEDED" }),
    ).rejects.toThrow();
    expect(mockPrisma.wishlistItem.findMany).not.toHaveBeenCalled();
  });

  test("hides archived items by default", async () => {
    mockPrisma.wishlistItem.findMany.mockResolvedValue([]);

    await publicCaller.getPublicItems({});

    expect(mockPrisma.wishlistItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: { not: "ARCHIVED" } },
      }),
    );
  });
});

describe("donation order creation", () => {
  test.each(["NEEDED", "PARTIALLY_FULFILLED"])(
    "accepts a %s item",
    async (status) => {
      mockPrisma.wishlistItem.findUnique.mockResolvedValue({
        ...product,
        status,
      });

      await expect(
        publicCaller.createDonateOrder({
          wishlistItemId: "item-1",
          amount: 40,
        }),
      ).resolves.toEqual(
        expect.objectContaining({ orderId: "PAYPAL-ORDER-1" }),
      );
    },
  );

  test.each(["FULFILLED", "OPENED", "ARCHIVED"])(
    "rejects a %s item",
    async (status) => {
      mockPrisma.wishlistItem.findUnique.mockResolvedValue({
        ...product,
        status,
      });

      await expect(
        publicCaller.createDonateOrder({
          wishlistItemId: "item-1",
          amount: 40,
        }),
      ).rejects.toThrow("This item is no longer accepting donations");
      expect(createPayPalOrder).not.toHaveBeenCalled();
    },
  );
});

describe("item create and update", () => {
  test("rejects a product with more fulfilled than its quantity", async () => {
    await expect(
      adminCaller.createItem({
        itemType: "PRODUCT",
        title: "Heat lamp",
        quantity: 1,
        quantityFulfilled: 2,
      }),
    ).rejects.toThrow("Quantity fulfilled cannot be more than the quantity");
    expect(mockPrisma.wishlistItem.create).not.toHaveBeenCalled();
  });

  test("rejects an update with more fulfilled than its quantity", async () => {
    mockPrisma.wishlistItem.findUnique.mockResolvedValue(product);

    await expect(
      adminCaller.updateItem({
        id: "item-1",
        quantity: 1,
        quantityFulfilled: 2,
      }),
    ).rejects.toThrow("Quantity fulfilled cannot be more than the quantity");
    await expect(
      adminCaller.updateItem({ id: "item-1", quantityFulfilled: 3 }),
    ).rejects.toThrow("Quantity fulfilled cannot be more than the quantity");
    expect(mockPrisma.wishlistItem.update).not.toHaveBeenCalled();
  });

  test("never changes the item type", async () => {
    mockPrisma.wishlistItem.findUnique.mockResolvedValue(product);

    await adminCaller.updateItem({
      id: "item-1",
      title: "Lamp",
      ...{ itemType: "GOAL" },
    });

    expect(mockPrisma.wishlistItem.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { title: "Lamp" } }),
    );
  });

  test("rejects product fields on a goal", async () => {
    mockPrisma.wishlistItem.findUnique.mockResolvedValue(goal);

    await expect(
      adminCaller.updateItem({ id: "goal-1", price: "$10.00" }),
    ).rejects.toThrow("Goals cannot have product fields");
    await expect(
      adminCaller.updateItem({ id: "goal-1", goalAmountCents: null }),
    ).rejects.toThrow("Goals need a target amount");
    expect(mockPrisma.wishlistItem.update).not.toHaveBeenCalled();
  });

  test("saves cleared optional fields as null", async () => {
    mockPrisma.wishlistItem.findUnique.mockResolvedValue(product);

    await adminCaller.updateItem({
      id: "item-1",
      description: null,
      imageUrl: null,
      categoryId: null,
      notes: null,
    });

    expect(mockPrisma.wishlistItem.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          description: null,
          imageUrl: null,
          categoryId: null,
          notes: null,
        },
      }),
    );
  });
});

describe("donation list", () => {
  const order = (id: number) => ({ id: `order-${id}` });

  test("pages through donations with a cursor", async () => {
    mockPrisma.wishlistDonationOrder.findMany.mockResolvedValue(
      Array.from({ length: 51 }, (_, i) => order(i)),
    );

    const page = await adminCaller.adminGetDonations({ cursor: "order-x" });

    expect(page.donations).toHaveLength(50);
    expect(page.nextCursor).toBe("order-50");
    expect(mockPrisma.wishlistDonationOrder.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 51, cursor: { id: "order-x" } }),
    );
  });

  test("has no next page on the last page", async () => {
    mockPrisma.wishlistDonationOrder.findMany.mockResolvedValue([order(1)]);

    const page = await adminCaller.adminGetDonations({});

    expect(page.nextCursor).toBeUndefined();
  });

  test("totals every order with a database aggregate", async () => {
    mockPrisma.wishlistDonationOrder.groupBy.mockResolvedValue([
      {
        status: "CAPTURED",
        _count: { _all: 300 },
        _sum: { capturedAmount: 4500 },
      },
      {
        status: "PENDING",
        _count: { _all: 12 },
        _sum: { capturedAmount: null },
      },
      { status: "FAILED", _count: { _all: 3 }, _sum: { capturedAmount: null } },
    ]);

    const totals = await adminCaller.adminGetDonationTotals({
      wishlistItemId: "item-1",
    });

    expect(totals).toEqual({
      orders: 315,
      captured: 300,
      pending: 12,
      capturedAmount: 4500,
    });
    expect(mockPrisma.wishlistDonationOrder.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({ where: { wishlistItemId: "item-1" } }),
    );
  });
});
