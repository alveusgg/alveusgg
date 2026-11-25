import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import type { Context } from "@/server/trpc/context";
import { adminWishlistRouter } from "@/server/trpc/router/admin/wishlist";
import { wishlistRouter } from "@/server/trpc/router/wishlist";

import { createPayPalOrder } from "@/utils/paypal";
import { getPayPalReturnParams } from "@/utils/wishlist";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    wishlistItem: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    wishlistDonationOrder: {
      create: vi.fn(),
      findMany: vi.fn(),
      groupBy: vi.fn(),
    },
    wishlistCategory: {
      findMany: vi.fn(),
    },
    fileStorageObject: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/env", () => ({
  env: {
    NEXT_PUBLIC_BASE_URL: "https://alveus.example.test",
    FILE_STORAGE_CDN_URL: "https://files.example.test",
  },
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
  getSession: async () => null,
} as unknown as Context);
const adminCaller = adminWishlistRouter.createCaller({
  getSession: async () => ({ user: { id: "user-1", name: "admin" } }),
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

const PRICE_ERROR =
  "Enter the price as a dollar amount, like 24.99 or 1,547.00";
const PARTIAL_TARGET_ERROR =
  "Partial donations need a readable price or a funding target";

const BOUNDS_ERROR =
  "A full-price product must cost between $1.00 and $10,000.00. Turn on partial donations for more expensive items.";

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

describe("public wishlist", () => {
  const archivedFilter = { status: { not: "ARCHIVED" } };

  test("hides archived items with their categories and images", async () => {
    mockPrisma.wishlistItem.findMany.mockResolvedValue([]);
    mockPrisma.wishlistCategory.findMany.mockResolvedValue([]);
    mockPrisma.fileStorageObject.findMany.mockResolvedValue([]);

    await publicCaller.getPublicWishlist();

    expect(mockPrisma.wishlistItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: archivedFilter }),
    );
    expect(mockPrisma.wishlistCategory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { items: { some: archivedFilter } } }),
    );
    expect(mockPrisma.fileStorageObject.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { wishlistItem: { is: archivedFilter } },
      }),
    );
  });

  test("attaches categories and image URLs to items", async () => {
    mockPrisma.wishlistItem.findMany.mockResolvedValue([
      { ...product, categoryId: "cat-1", fileStorageObjectId: "file-1" },
      { ...goal, categoryId: "cat-old", fileStorageObjectId: null },
    ]);
    mockPrisma.wishlistCategory.findMany.mockResolvedValue([
      {
        id: "cat-1",
        name: "Heat",
        slug: "heat",
        archivedAt: null,
        _count: { items: 1 },
      },
      {
        id: "cat-old",
        name: "Old",
        slug: "old",
        archivedAt: new Date(),
        _count: { items: 1 },
      },
    ]);
    mockPrisma.fileStorageObject.findMany.mockResolvedValue([
      { id: "file-1", key: "wishlist/lamp.png" },
    ]);

    const { items, categories } = await publicCaller.getPublicWishlist();

    expect(items[0]).toMatchObject({
      category: { id: "cat-1", name: "Heat", slug: "heat" },
      imageUrl: "https://files.example.test/wishlist/lamp.png",
    });
    expect(items[0]).not.toHaveProperty("fileStorageObjectId");
    // An archived category still labels its items, but is not a filter
    expect(items[1]).toMatchObject({
      category: { slug: "old" },
      imageUrl: null,
    });
    expect(categories).toEqual([
      { id: "cat-1", name: "Heat", slug: "heat", _count: { items: 1 } },
    ]);
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

describe("full price donations", () => {
  const expensive = { ...product, price: "1,547.00" };

  test("accepts the exact price and orders the server price", async () => {
    mockPrisma.wishlistItem.findUnique.mockResolvedValue(expensive);

    await publicCaller.createDonateOrder({
      wishlistItemId: "item-1",
      amount: 1547,
    });

    expect(createPayPalOrder).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 1547 }),
    );
    expect(mockPrisma.wishlistDonationOrder.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ amount: 1547 }),
    });
  });

  test("rejects any other amount", async () => {
    mockPrisma.wishlistItem.findUnique.mockResolvedValue(expensive);

    await expect(
      publicCaller.createDonateOrder({ wishlistItemId: "item-1", amount: 50 }),
    ).rejects.toThrow("This item is donated at its full price of $1,547.00");
    await expect(
      publicCaller.createDonateOrder({
        wishlistItemId: "item-1",
        amount: 1547.01,
      }),
    ).rejects.toThrow("full price of $1,547.00");
    expect(createPayPalOrder).not.toHaveBeenCalled();
  });

  test.each(["about $40", "", null])(
    "rejects an item with the unreadable price %j",
    async (price) => {
      mockPrisma.wishlistItem.findUnique.mockResolvedValue({
        ...product,
        price,
      });

      await expect(
        publicCaller.createDonateOrder({
          wishlistItemId: "item-1",
          amount: 40,
        }),
      ).rejects.toMatchObject({
        code: "BAD_REQUEST",
        message: "This item is unavailable for donations right now",
      });
      expect(createPayPalOrder).not.toHaveBeenCalled();
      expect(mockPrisma.wishlistDonationOrder.create).not.toHaveBeenCalled();
    },
  );

  test("keeps chip-ins on partial items", async () => {
    mockPrisma.wishlistItem.findUnique.mockResolvedValue({
      ...expensive,
      allowPartialDonations: true,
    });

    await publicCaller.createDonateOrder({
      wishlistItemId: "item-1",
      amount: 50,
    });

    expect(createPayPalOrder).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 50 }),
    );
  });

  test("keeps any amount on goals", async () => {
    mockPrisma.wishlistItem.findUnique.mockResolvedValue(goal);

    await publicCaller.createDonateOrder({
      wishlistItemId: "goal-1",
      amount: 12.34,
    });

    expect(createPayPalOrder).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 12.34 }),
    );
  });

  test("still enforces the amount limit", async () => {
    mockPrisma.wishlistItem.findUnique.mockResolvedValue({
      ...product,
      price: "20,000",
    });

    await expect(
      publicCaller.createDonateOrder({
        wishlistItemId: "item-1",
        amount: 20_000,
      }),
    ).rejects.toThrow();
    expect(createPayPalOrder).not.toHaveBeenCalled();
  });
});

describe("item price validation", () => {
  test.each([
    ["$24.99", "24.99"],
    ["1,547", "1547.00"],
    [" 1,547.5 ", "1547.50"],
  ])("stores %j as %j", async (price, stored) => {
    await adminCaller.createItem({
      itemType: "PRODUCT",
      title: "Heat lamp",
      price,
    });

    expect(mockPrisma.wishlistItem.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ price: stored }),
      }),
    );
  });

  test("rejects an unreadable price on create and update", async () => {
    mockPrisma.wishlistItem.findUnique.mockResolvedValue(product);

    await expect(
      adminCaller.createItem({
        itemType: "PRODUCT",
        title: "Heat lamp",
        price: "20-30",
      }),
    ).rejects.toThrow(
      "Enter the price as a dollar amount, like 24.99 or 1,547.00",
    );
    await expect(
      adminCaller.updateItem({ id: "item-1", price: "1.547,50" }),
    ).rejects.toThrow(
      "Enter the price as a dollar amount, like 24.99 or 1,547.00",
    );
    expect(mockPrisma.wishlistItem.create).not.toHaveBeenCalled();
    expect(mockPrisma.wishlistItem.update).not.toHaveBeenCalled();
  });

  test.each([[""], ["   "], [null], [undefined]])(
    "requires a price to create a product (%j)",
    async (price) => {
      await expect(
        adminCaller.createItem({
          itemType: "PRODUCT",
          title: "Heat lamp",
          price,
        }),
      ).rejects.toThrow(PRICE_ERROR);
      expect(mockPrisma.wishlistItem.create).not.toHaveBeenCalled();
    },
  );

  test.each([[""], [null]])(
    "rejects clearing the price of a product (%j)",
    async (price) => {
      mockPrisma.wishlistItem.findUnique.mockResolvedValue(product);

      await expect(
        adminCaller.updateItem({ id: "item-1", price }),
      ).rejects.toThrow(PRICE_ERROR);
      expect(mockPrisma.wishlistItem.update).not.toHaveBeenCalled();
    },
  );

  test("normalizes the price on update", async () => {
    mockPrisma.wishlistItem.findUnique.mockResolvedValue(product);

    await adminCaller.updateItem({ id: "item-1", price: "$1,547" });

    expect(mockPrisma.wishlistItem.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { price: "1547.00" } }),
    );
  });

  test("leaves goals unaffected", async () => {
    await adminCaller.createItem({
      itemType: "GOAL",
      title: "Enclosure fund",
      goalAmountCents: 50_000,
    });

    expect(mockPrisma.wishlistItem.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.not.objectContaining({ price: expect.anything() }),
      }),
    );
  });
});

describe("legacy items with a missing or unreadable price", () => {
  // What the edit form sends: every field, with the price as stored
  const formUpdate = (price: string | null, status: "ARCHIVED" | "OPENED") => ({
    id: "item-1",
    title: "Heat lamp",
    description: null,
    fileStorageObjectId: null,
    priority: "MEDIUM" as const,
    status,
    categoryId: null,
    notes: null,
    allowPartialDonations: false,
    url: null,
    price,
    quantity: 2,
    quantityFulfilled: 0,
  });

  test.each([["about $40"], [null], [""]])(
    "can still change the status of an item priced %j",
    async (price) => {
      mockPrisma.wishlistItem.findUnique.mockResolvedValue({
        ...product,
        price,
      });

      await adminCaller.updateItem(formUpdate(price || null, "ARCHIVED"));
      await adminCaller.updateItem({ id: "item-1", status: "OPENED" });

      expect(mockPrisma.wishlistItem.update).toHaveBeenCalledTimes(2);
      for (const [call] of mockPrisma.wishlistItem.update.mock.calls) {
        expect(call.data).not.toHaveProperty("price");
      }
      expect(mockPrisma.wishlistItem.update.mock.calls[0]?.[0].data).toEqual(
        expect.objectContaining({ status: "ARCHIVED" }),
      );
    },
  );

  test("can still archive and delete from the table", async () => {
    mockPrisma.wishlistItem.findUnique.mockResolvedValue({
      ...product,
      price: "about $40",
    });
    mockPrisma.wishlistItem.delete.mockResolvedValue({
      ...product,
      fileStorageObjectId: null,
    });

    await adminCaller.deleteItem({ id: "item-1", permanent: false });
    await adminCaller.deleteItem({ id: "item-1", permanent: true });

    expect(mockPrisma.wishlistItem.update).toHaveBeenCalledWith({
      where: { id: "item-1" },
      data: { status: "ARCHIVED" },
    });
    expect(mockPrisma.wishlistItem.delete).toHaveBeenCalledWith({
      where: { id: "item-1" },
    });
  });

  test("rejects a changed price that is still unreadable", async () => {
    mockPrisma.wishlistItem.findUnique.mockResolvedValue({
      ...product,
      price: "about $40",
    });

    await expect(
      adminCaller.updateItem({ id: "item-1", price: "about $45" }),
    ).rejects.toThrow(PRICE_ERROR);
    expect(mockPrisma.wishlistItem.update).not.toHaveBeenCalled();
  });
});

describe("partial donation targets", () => {
  test("accepts a partial product with a readable price", async () => {
    await adminCaller.createItem({
      itemType: "PRODUCT",
      title: "Heat lamp",
      price: "40",
      allowPartialDonations: true,
    });

    expect(mockPrisma.wishlistItem.create).toHaveBeenCalled();
  });

  test("rejects turning on partial donations without a target", async () => {
    mockPrisma.wishlistItem.findUnique.mockResolvedValue({
      ...product,
      price: "about $40",
    });

    await expect(
      adminCaller.updateItem({ id: "item-1", allowPartialDonations: true }),
    ).rejects.toThrow(PARTIAL_TARGET_ERROR);
    expect(mockPrisma.wishlistItem.update).not.toHaveBeenCalled();
  });

  test("rejects removing the only target of a partial product", async () => {
    mockPrisma.wishlistItem.findUnique.mockResolvedValue({
      ...product,
      price: null,
      allowPartialDonations: true,
      goalAmountCents: 10_000,
    });

    await expect(
      adminCaller.updateItem({ id: "item-1", goalAmountCents: null }),
    ).rejects.toThrow(PARTIAL_TARGET_ERROR);
    expect(mockPrisma.wishlistItem.update).not.toHaveBeenCalled();
  });

  test("accepts an explicit target when the price is unreadable", async () => {
    mockPrisma.wishlistItem.findUnique.mockResolvedValue({
      ...product,
      price: "about $40",
    });

    await adminCaller.updateItem({
      id: "item-1",
      allowPartialDonations: true,
      goalAmountCents: 4_000,
    });

    expect(mockPrisma.wishlistItem.update).toHaveBeenCalled();
  });

  test("still archives a legacy partial product with no target", async () => {
    mockPrisma.wishlistItem.findUnique.mockResolvedValue({
      ...product,
      price: null,
      allowPartialDonations: true,
    });

    await adminCaller.updateItem({
      id: "item-1",
      status: "ARCHIVED",
      allowPartialDonations: true,
      price: null,
      goalAmountCents: null,
      quantity: 2,
    });

    expect(mockPrisma.wishlistItem.update).toHaveBeenCalled();
  });

  test("rejects an order on a partial product with no target", async () => {
    mockPrisma.wishlistItem.findUnique.mockResolvedValue({
      ...product,
      price: "about $40",
      allowPartialDonations: true,
    });

    await expect(
      publicCaller.createDonateOrder({ wishlistItemId: "item-1", amount: 10 }),
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: "This item is unavailable for donations right now",
    });
    expect(createPayPalOrder).not.toHaveBeenCalled();
    expect(mockPrisma.wishlistDonationOrder.create).not.toHaveBeenCalled();
  });
});

describe("full price bounds", () => {
  const create = (price: string, allowPartialDonations = false) =>
    adminCaller.createItem({
      itemType: "PRODUCT",
      title: "Heat lamp",
      price,
      allowPartialDonations,
    });

  test.each(["20,000", "10,000.01", "0.99"])(
    "rejects a full-price product priced %j",
    async (price) => {
      await expect(create(price)).rejects.toMatchObject({
        code: "BAD_REQUEST",
        message: BOUNDS_ERROR,
      });
      expect(mockPrisma.wishlistItem.create).not.toHaveBeenCalled();
    },
  );

  test.each(["1", "10,000"])(
    "accepts a full-price product priced %j",
    async (price) => {
      await create(price);
      expect(mockPrisma.wishlistItem.create).toHaveBeenCalled();
    },
  );

  test("does not bind partial products or goals", async () => {
    await create("20,000", true);
    await adminCaller.createItem({
      itemType: "GOAL",
      title: "Enclosure",
      goalAmountCents: 5_000_000,
    });
    expect(mockPrisma.wishlistItem.create).toHaveBeenCalledTimes(2);
  });

  test("rejects a price change out of bounds", async () => {
    mockPrisma.wishlistItem.findUnique.mockResolvedValue(product);

    await expect(
      adminCaller.updateItem({ id: "item-1", price: "12,000" }),
    ).rejects.toThrow(BOUNDS_ERROR);
    expect(mockPrisma.wishlistItem.update).not.toHaveBeenCalled();
  });

  test("rejects turning partial donations off on an expensive item", async () => {
    mockPrisma.wishlistItem.findUnique.mockResolvedValue({
      ...product,
      price: "20000.00",
      allowPartialDonations: true,
    });

    await expect(
      adminCaller.updateItem({ id: "item-1", allowPartialDonations: false }),
    ).rejects.toThrow(BOUNDS_ERROR);
    expect(mockPrisma.wishlistItem.update).not.toHaveBeenCalled();
  });

  test("still archives an existing out of bounds item", async () => {
    mockPrisma.wishlistItem.findUnique.mockResolvedValue({
      ...product,
      price: "20000.00",
    });

    await adminCaller.updateItem({
      id: "item-1",
      title: "Heat lamp",
      status: "ARCHIVED",
      allowPartialDonations: false,
      price: "20000.00",
      quantity: 2,
    });
    await adminCaller.updateItem({ id: "item-1", status: "OPENED" });

    expect(mockPrisma.wishlistItem.update).toHaveBeenCalledTimes(2);
  });

  test("checkout accepts the maximum and rejects below the minimum", async () => {
    mockPrisma.wishlistItem.findUnique.mockResolvedValue({
      ...product,
      price: "10,000",
    });
    await publicCaller.createDonateOrder({
      wishlistItemId: "item-1",
      amount: 10_000,
    });
    expect(createPayPalOrder).toHaveBeenCalledTimes(1);

    mockPrisma.wishlistItem.findUnique.mockResolvedValue(goal);
    await expect(
      publicCaller.createDonateOrder({
        wishlistItemId: "goal-1",
        amount: 0.99,
      }),
    ).rejects.toThrow();
    expect(createPayPalOrder).toHaveBeenCalledTimes(1);
  });
});

describe("item create and update", () => {
  test("rejects a product with more fulfilled than its quantity", async () => {
    await expect(
      adminCaller.createItem({
        itemType: "PRODUCT",
        title: "Heat lamp",
        price: "40",
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
      categoryId: null,
      notes: null,
    });

    expect(mockPrisma.wishlistItem.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          description: null,
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

  test.each([
    "PENDING",
    "CAPTURED",
    "FAILED",
    "REFUNDED",
    "DENIED",
    "REVERSED",
  ])("filters donations by %s", async (status) => {
    mockPrisma.wishlistDonationOrder.findMany.mockResolvedValue([]);

    await adminCaller.adminGetDonations({
      status: status as "PENDING",
    });

    expect(mockPrisma.wishlistDonationOrder.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status } }),
    );
  });

  test("rejects an unknown status filter", async () => {
    await expect(
      adminCaller.adminGetDonations({ status: "LOST" as "PENDING" }),
    ).rejects.toThrow();
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
      {
        status: "REFUNDED",
        _count: { _all: 2 },
        _sum: { capturedAmount: 50 },
      },
      { status: "DENIED", _count: { _all: 1 }, _sum: { capturedAmount: null } },
    ]);

    const totals = await adminCaller.adminGetDonationTotals({
      wishlistItemId: "item-1",
    });

    expect(totals).toEqual({
      orders: 318,
      captured: 300,
      pending: 12,
      paymentIssues: 3,
      capturedAmount: 4500,
    });
    expect(mockPrisma.wishlistDonationOrder.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({ where: { wishlistItemId: "item-1" } }),
    );
  });
});
