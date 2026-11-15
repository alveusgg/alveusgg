import { Readable } from "node:stream";

import type { NextApiRequest, NextApiResponse } from "next";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { recordWishlistCapture } from "@/server/db/wishlist";
import type * as WishlistDb from "@/server/db/wishlist";
import type { Context } from "@/server/trpc/context";
import { wishlistRouter } from "@/server/trpc/router/wishlist";

import { notifyWishlistPaymentIssue } from "@/utils/discord";
import type * as PayPal from "@/utils/paypal";

import handler from "@/pages/api/webhooks/paypal";

type Order = {
  id: string;
  paypalOrderId: string;
  wishlistItemId: string;
  amount: number;
  capturedAmount: number | null;
  donorName: string | null;
  status: string;
  paypalTransactionId: string | null;
};

const { db, mockPrisma } = vi.hoisted(() => {
  const db = { orders: [] as Order[] };
  const matches = (order: Order, where: Partial<Record<keyof Order, string>>) =>
    Object.entries(where).every(
      ([key, value]) => order[key as keyof Order] === value,
    );

  return {
    db,
    mockPrisma: {
      wishlistDonationOrder: {
        findFirst: vi.fn(
          async ({
            where,
          }: {
            where: Partial<Record<keyof Order, string>> & {
              OR?: Partial<Record<keyof Order, string>>[];
            };
          }) => {
            const { OR, ...rest } = where;
            const order = db.orders.find(
              (o) =>
                matches(o, rest) &&
                (!OR || OR.some((condition) => matches(o, condition))),
            );
            return order
              ? { ...order, wishlistItem: { title: "Heat lamp" } }
              : null;
          },
        ),
        findUnique: vi.fn(async ({ where }: { where: { id: string } }) => {
          const order = db.orders.find((o) => o.id === where.id);
          return order ? { ...order, excessAmount: null } : null;
        }),
      },
      // The payment issue UPDATE: status, updatedAt, id, status
      $executeRaw: vi.fn(
        async (
          _sql: TemplateStringsArray,
          status: string,
          _updatedAt: Date,
          id: string,
        ) => {
          const order = db.orders.find((o) => o.id === id);
          if (!order || order.status === status) return 0;
          order.status = status;
          return 1;
        },
      ),
    },
  };
});

vi.mock("@/env", () => ({
  env: {
    NEXT_PUBLIC_BASE_URL: "https://alveus.example.test",
    PAYPAL_ENV: "sandbox",
    PAYPAL_CLIENT_ID: "client-id",
    PAYPAL_CLIENT_SECRET: "client-secret",
    DISCORD_WISHLIST_WEBHOOK_URL: "https://discord.example.test/webhook",
  },
}));
vi.mock("@alveusgg/database", () => ({ prisma: mockPrisma }));
vi.mock("@/utils/discord", () => ({
  notifyWishlistDonation: vi.fn(() => Promise.resolve()),
  notifyWishlistItemFunded: vi.fn(() => Promise.resolve()),
  notifyWishlistPaymentIssue: vi.fn(() => Promise.resolve()),
}));
vi.mock("@/server/db/wishlist", async (importOriginal) => ({
  ...(await importOriginal<typeof WishlistDb>()),
  recordWishlistCapture: vi.fn(),
}));
vi.mock("@/utils/paypal", async (importOriginal) => ({
  ...(await importOriginal<typeof PayPal>()),
  verifyPayPalWebhook: vi.fn(async () => true),
}));

const makeOrder = (overrides: Partial<Order> = {}): Order => ({
  id: "order-1",
  paypalOrderId: "PAYPAL-ORDER-1",
  wishlistItemId: "item-1",
  amount: 25,
  capturedAmount: null,
  donorName: "Stream Name",
  status: "PENDING",
  paypalTransactionId: null,
  ...overrides,
});

const capturedOrder = () =>
  makeOrder({
    status: "CAPTURED",
    capturedAmount: 25,
    paypalTransactionId: "CAPTURE-1",
  });

beforeEach(() => {
  db.orders = [makeOrder()];
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe("capture status on the success page", () => {
  const caller = wishlistRouter.createCaller({
    session: null,
  } as unknown as Context);

  const paypalCapture = (captureStatus: string) =>
    vi
      .fn()
      .mockResolvedValueOnce(Response.json({ access_token: "token" }))
      .mockResolvedValueOnce(
        Response.json({
          id: "PAYPAL-ORDER-1",
          status: "COMPLETED",
          payer: { email_address: "donor@example.com" },
          purchase_units: [
            {
              payments: {
                captures: [
                  {
                    id: "CAPTURE-1",
                    status: captureStatus,
                    amount: { value: "25.00" },
                  },
                ],
              },
            },
          ],
        }),
      );

  test("leaves a completed order with a pending capture pending", async () => {
    vi.stubGlobal("fetch", paypalCapture("PENDING"));

    const result = await caller.captureDonation({
      paypalOrderId: "PAYPAL-ORDER-1",
      wishlistItemId: "item-1",
    });

    expect(result).toMatchObject({ success: true, processing: true });
    expect(recordWishlistCapture).not.toHaveBeenCalled();
    expect(db.orders[0]?.status).toBe("PENDING");
  });

  test("records a completed capture", async () => {
    vi.stubGlobal("fetch", paypalCapture("COMPLETED"));
    vi.mocked(recordWishlistCapture).mockResolvedValue({
      status: "captured",
      order: {} as never,
      excessAmount: 0,
      justFunded: false,
    });

    const result = await caller.captureDonation({
      paypalOrderId: "PAYPAL-ORDER-1",
      wishlistItemId: "item-1",
    });

    expect(result).toMatchObject({ processing: false, amount: 25 });
    expect(recordWishlistCapture).toHaveBeenCalledWith(
      expect.objectContaining({ captureId: "CAPTURE-1", amount: 25 }),
    );
  });
});

describe("PayPal payment issue webhooks", () => {
  const send = async (event: Record<string, unknown>) => {
    const req = Readable.from([
      JSON.stringify(event),
    ]) as unknown as NextApiRequest & {
      method: string;
      headers: Record<string, string>;
    };
    req.method = "POST";
    req.headers = {};
    const res = {
      statusCode: 0,
      body: undefined as unknown,
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      json(body: unknown) {
        this.body = body;
        return this;
      },
    };
    await handler(req, res as unknown as NextApiResponse);
    return res;
  };

  const refundEvent = (eventType: string) => ({
    event_type: eventType,
    resource: {
      id: "REFUND-1",
      amount: { value: "25.00" },
      status: "COMPLETED",
      links: [
        {
          rel: "self",
          href: "https://api.paypal.com/v2/payments/refunds/REFUND-1",
        },
        {
          rel: "up",
          href: "https://api.paypal.com/v2/payments/captures/CAPTURE-1",
        },
      ],
    },
  });

  test("marks a denied capture and alerts staff once", async () => {
    // A pending capture was never recorded, so it is found by order ID
    const res = await send({
      event_type: "PAYMENT.CAPTURE.DENIED",
      resource: {
        id: "CAPTURE-1",
        status: "DECLINED",
        amount: { value: "25.00" },
        supplementary_data: { related_ids: { order_id: "PAYPAL-ORDER-1" } },
      },
    });

    expect(res.statusCode).toBe(200);
    expect(db.orders[0]?.status).toBe("DENIED");
    expect(notifyWishlistPaymentIssue).toHaveBeenCalledOnce();
    expect(notifyWishlistPaymentIssue).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "DENIED",
        amount: 25,
        wasCredited: false,
        captureId: "CAPTURE-1",
      }),
    );
  });

  test.each([
    ["PAYMENT.CAPTURE.REFUNDED", "REFUNDED"],
    ["PAYMENT.CAPTURE.REVERSED", "REVERSED"],
  ])(
    "marks a captured order on %s without changing the item",
    async (eventType, status) => {
      db.orders = [capturedOrder()];

      const res = await send(refundEvent(eventType));

      expect(res.statusCode).toBe(200);
      expect(db.orders[0]).toMatchObject({
        status,
        capturedAmount: 25,
        paypalTransactionId: "CAPTURE-1",
      });
      expect(notifyWishlistPaymentIssue).toHaveBeenCalledOnce();
      expect(notifyWishlistPaymentIssue).toHaveBeenCalledWith(
        expect.objectContaining({ status, wasCredited: true }),
      );
      expect(mockPrisma.wishlistDonationOrder.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { OR: [{ paypalTransactionId: "CAPTURE-1" }] },
        }),
      );
    },
  );

  test("ignores a repeated delivery of the same event", async () => {
    db.orders = [capturedOrder()];

    const first = await send(refundEvent("PAYMENT.CAPTURE.REFUNDED"));
    const repeat = await send(refundEvent("PAYMENT.CAPTURE.REFUNDED"));

    expect(first.body).toEqual({ received: true });
    expect(repeat.statusCode).toBe(200);
    expect(repeat.body).toEqual({ received: true, alreadyProcessed: true });
    expect(db.orders[0]?.status).toBe("REFUNDED");
    expect(notifyWishlistPaymentIssue).toHaveBeenCalledOnce();
  });
});
