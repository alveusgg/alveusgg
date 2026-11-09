import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import {
  capCreditToRemaining,
  recordWishlistCapture,
} from "@/server/db/wishlist";

import { getPartialTargetCents, partialDonationAmount } from "@/data/wishlist";

const { mockEnv, mockPrisma, discord, db } = vi.hoisted(() => {
  type Item = {
    id: string;
    title: string;
    itemType: "PRODUCT" | "GOAL";
    allowPartialDonations: boolean;
    goalAmountCents: number | null;
    raisedAmountCents: number;
    price: string | null;
    quantity: number;
    quantityFulfilled: number;
    status: string;
  };
  type Order = {
    id: string;
    paypalOrderId: string;
    donorName: string | null;
    donorEmail: string | null;
    donorMessage: string | null;
    status: string;
    paypalTransactionId: string | null;
    excessAmount: number | null;
  };
  type CountUpdate = { increment?: number; decrement?: number };

  const db = {
    item: {} as Item,
    orders: [] as Order[],
    // Simulates the InnoDB row lock: the first write to the item row waits
    // for the lock, which is held until the transaction commits
    lock: Promise.resolve(),
  };

  const tx = (release: { fn: () => void; held: boolean }) => ({
    wishlistDonationOrder: {
      // A plain read does not take the lock, so both donors can see the
      // same stale total here
      findUnique: vi.fn(
        async ({ where }: { where: { paypalOrderId: string } }) => {
          const order = db.orders.find(
            (o) => o.paypalOrderId === where.paypalOrderId,
          );
          return order ? { ...order, wishlistItem: { ...db.item } } : null;
        },
      ),
      updateMany: vi.fn(
        async ({
          where,
          data,
        }: {
          where: { id: string };
          data: { paypalTransactionId: string };
        }) => {
          const order = db.orders.find((o) => o.id === where.id);
          if (!order || order.paypalTransactionId) return { count: 0 };
          order.status = "CAPTURED";
          order.paypalTransactionId = data.paypalTransactionId;
          return { count: 1 };
        },
      ),
      update: vi.fn(
        async ({
          where,
          data,
        }: {
          where: { id: string };
          data: { excessAmount: number };
        }) => {
          const order = db.orders.find((o) => o.id === where.id);
          if (order) order.excessAmount = data.excessAmount;
          return order;
        },
      ),
    },
    wishlistItem: {
      update: vi.fn(
        async ({
          data,
        }: {
          data: {
            raisedAmountCents: CountUpdate;
            status?: string;
            quantityFulfilled?: number;
          };
        }) => {
          if (!release.held) {
            const previous = db.lock;
            db.lock = new Promise((resolve) => {
              release.fn = resolve;
            });
            release.held = true;
            await previous;
          }
          const { increment = 0, decrement = 0 } = data.raisedAmountCents;
          db.item.raisedAmountCents += increment - decrement;
          if (data.status) db.item.status = data.status;
          if (data.quantityFulfilled != null) {
            db.item.quantityFulfilled = data.quantityFulfilled;
          }
          // Yield so the other transaction gets a chance to run in between
          await new Promise((resolve) => setTimeout(resolve, 0));
          return { ...db.item };
        },
      ),
    },
  });

  return {
    db,
    discord: {
      notifyWishlistDonation: vi.fn(() => Promise.resolve()),
      notifyWishlistItemFunded: vi.fn(() => Promise.resolve()),
    },
    mockEnv: {
      NEON_CRM_BASE_URL: "https://neon.example.test/v2/",
      NEON_CRM_API_KEY: "test-key" as string | undefined,
      NEON_CRM_ORG_ID: "example",
    },
    mockPrisma: {
      $transaction: vi.fn(
        async <T>(fn: (client: ReturnType<typeof tx>) => Promise<T>) => {
          const release = { fn: () => {}, held: false };
          try {
            return await fn(tx(release));
          } finally {
            release.fn();
          }
        },
      ),
      wishlistDonationOrder: { update: vi.fn(() => Promise.resolve({})) },
    },
  };
});

vi.mock("@/env", () => ({ env: mockEnv }));
vi.mock("@alveusgg/database", () => ({ prisma: mockPrisma }));
vi.mock("@/utils/discord", () => discord);

const makeOrder = (n: number) => ({
  id: `order-${n}`,
  paypalOrderId: `PAYPAL-ORDER-${n}`,
  donorName: `Donor ${n}`,
  donorEmail: null,
  donorMessage: null,
  status: "PENDING",
  paypalTransactionId: null,
  excessAmount: null,
});

const captureFor = (n: number, amount: number) => ({
  paypalOrderId: `PAYPAL-ORDER-${n}`,
  captureId: `CAPTURE-${n}`,
  amount,
  payerEmail: `donor${n}@example.com`,
  payerName: `Donor ${n}`,
});

let neonDonationId = 0;
const neonFetch = vi.fn(async (url: string, _init?: RequestInit) => {
  if (url.endsWith("accounts/search")) {
    return Response.json({
      pagination: {
        currentPage: 0,
        pageSize: 1,
        totalPages: 1,
        totalResults: 1,
      },
      searchResults: [{ "Account ID": "123" }],
    });
  }
  neonDonationId += 1;
  return Response.json({ id: String(700 + neonDonationId) });
});

const neonDonationBodies = () =>
  neonFetch.mock.calls
    .filter(([url]) => url.endsWith("/donations"))
    .map(([, init]) => JSON.parse(String(init?.body)));

beforeEach(() => {
  mockEnv.NEON_CRM_API_KEY = "test-key";
  neonDonationId = 0;
  vi.stubGlobal("fetch", neonFetch);
  db.lock = Promise.resolve();
  db.item = {
    id: "item-1",
    title: "Desk lamp",
    itemType: "PRODUCT",
    allowPartialDonations: true,
    goalAmountCents: 5_000,
    raisedAmountCents: 4_000,
    price: "$50.00",
    quantity: 1,
    quantityFulfilled: 0,
    status: "PARTIALLY_FULFILLED",
  };
  db.orders = [makeOrder(1), makeOrder(2)];
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("capCreditToRemaining", () => {
  test("credits the full amount while under the target", () => {
    expect(
      capCreditToRemaining({
        amountCents: 1_000,
        raisedAfterCents: 3_000,
        goalCents: 5_000,
      }),
    ).toEqual({
      creditedCents: 1_000,
      excessCents: 0,
      raisedCents: 3_000,
      isFunded: false,
      justFunded: false,
    });
  });

  test("an exact final donation funds the item", () => {
    expect(
      capCreditToRemaining({
        amountCents: 1_000,
        raisedAfterCents: 5_000,
        goalCents: 5_000,
      }),
    ).toEqual({
      creditedCents: 1_000,
      excessCents: 0,
      raisedCents: 5_000,
      isFunded: true,
      justFunded: true,
    });
  });

  test("caps the credit at the remaining balance", () => {
    expect(
      capCreditToRemaining({
        amountCents: 2_500,
        raisedAfterCents: 6_500,
        goalCents: 5_000,
      }),
    ).toEqual({
      creditedCents: 1_000,
      excessCents: 1_500,
      raisedCents: 5_000,
      isFunded: true,
      justFunded: true,
    });
  });

  test("credits nothing once the item is already funded", () => {
    expect(
      capCreditToRemaining({
        amountCents: 2_500,
        raisedAfterCents: 7_500,
        goalCents: 5_000,
      }),
    ).toEqual({
      creditedCents: 0,
      excessCents: 2_500,
      raisedCents: 5_000,
      isFunded: true,
      justFunded: false,
    });
  });
});

describe("partial donation helpers", () => {
  test("the target defaults to price times quantity", () => {
    expect(
      getPartialTargetCents({
        goalAmountCents: null,
        price: "$29.99",
        quantity: 2,
      }),
    ).toBe(5_998);
    expect(
      getPartialTargetCents({
        goalAmountCents: 4_000,
        price: "$29.99",
        quantity: 2,
      }),
    ).toBe(4_000);
  });

  test("chip-in amounts need $5 and cannot exceed the remaining balance", () => {
    const schema = partialDonationAmount(2_000);
    expect(schema.safeParse(4.99).success).toBe(false);
    expect(schema.safeParse(5).success).toBe(true);
    expect(schema.safeParse(20).success).toBe(true);
    expect(schema.safeParse(20.01).success).toBe(false);
    expect(schema.safeParse(5.555).success).toBe(false);
  });

  test("the minimum drops to the balance when less than $5 is left", () => {
    const schema = partialDonationAmount(300);
    expect(schema.safeParse(3).success).toBe(true);
    expect(schema.safeParse(2.99).success).toBe(false);
  });
});

describe("recordWishlistCapture with partial donations", () => {
  test("a donation over the remaining balance funds the item and keeps the excess", async () => {
    const result = await recordWishlistCapture(captureFor(1, 25));

    expect(result).toMatchObject({
      status: "captured",
      excessAmount: 15,
      justFunded: true,
    });
    expect(db.item).toMatchObject({
      raisedAmountCents: 5_000,
      status: "FULFILLED",
      quantityFulfilled: 1,
    });
    expect(db.orders[0]?.excessAmount).toBe(15);
    expect(discord.notifyWishlistItemFunded).toHaveBeenCalledWith({
      itemTitle: "Desk lamp",
    });
  });

  test("two simultaneous donations never overfund the item", async () => {
    const [first, second] = await Promise.all([
      recordWishlistCapture(captureFor(1, 25)),
      recordWishlistCapture(captureFor(2, 25)),
    ]);

    // The first capture to take the row lock fills the last $10, the other
    // one is credited nothing and all of it is kept as a general donation
    expect(first).toMatchObject({ excessAmount: 15, justFunded: true });
    expect(second).toMatchObject({ excessAmount: 25, justFunded: false });
    expect(db.item.raisedAmountCents).toBe(5_000);
    expect(db.item.status).toBe("FULFILLED");
    expect(db.orders.map((o) => o.excessAmount)).toEqual([15, 25]);
    expect(discord.notifyWishlistItemFunded).toHaveBeenCalledTimes(1);
    expect(discord.notifyWishlistDonation).toHaveBeenCalledTimes(2);
  });

  test("each chip-in logs its own Neon donation", async () => {
    await recordWishlistCapture(captureFor(1, 5));
    await recordWishlistCapture(captureFor(2, 5));

    expect(db.item.raisedAmountCents).toBe(5_000);
    expect(neonDonationBodies()).toEqual([
      {
        accountId: "123",
        amount: 5,
        date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        payments: [
          {
            amount: 5,
            tenderType: 17,
            paymentStatus: "Succeeded",
            receivedDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
            note: "PayPal capture ID: CAPTURE-1 (Wishlist: Desk lamp)",
          },
        ],
      },
      {
        accountId: "123",
        amount: 5,
        date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        payments: [
          {
            amount: 5,
            tenderType: 17,
            paymentStatus: "Succeeded",
            receivedDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
            note: "PayPal capture ID: CAPTURE-2 (Wishlist: Desk lamp)",
          },
        ],
      },
    ]);
    expect(mockPrisma.wishlistDonationOrder.update).toHaveBeenCalledTimes(2);
  });

  test("a repeated capture is ignored", async () => {
    await recordWishlistCapture(captureFor(1, 5));
    const repeat = await recordWishlistCapture(captureFor(1, 5));

    expect(repeat.status).toBe("duplicate");
    expect(db.item.raisedAmountCents).toBe(4_500);
    expect(neonDonationBodies()).toHaveLength(1);
  });
});
