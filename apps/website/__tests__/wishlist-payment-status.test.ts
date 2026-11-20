import { Readable } from "node:stream";

import type { NextApiRequest, NextApiResponse } from "next";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import type { Prisma } from "@alveusgg/database";
import type * as Database from "@alveusgg/database";

import { logWishlistDonationToNeon } from "@/server/apis/neon-crm";
import { recordWishlistCapture } from "@/server/db/wishlist";
import type * as WishlistDb from "@/server/db/wishlist";
import type { Context } from "@/server/trpc/context";
import { wishlistRouter } from "@/server/trpc/router/wishlist";

import {
  notifyWishlistDonation,
  notifyWishlistPaymentIssue,
} from "@/utils/discord";
import type * as Discord from "@/utils/discord";
import { WISHLIST_PAYPAL_CUSTOM_ID } from "@/utils/paypal";
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
  neonDonationId: string | null;
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
        findUnique: vi.fn(
          async ({
            where,
          }: {
            where: { id?: string; paypalOrderId?: string };
          }) => {
            const order = db.orders.find(
              (o) =>
                o.id === where.id || o.paypalOrderId === where.paypalOrderId,
            );
            return order
              ? {
                  ...order,
                  excessAmount: null,
                  wishlistItem: { id: "item-1", title: "Heat lamp" },
                }
              : null;
          },
        ),
        fields: new Proxy({}, { get: (_, name) => ({ name }) }),
      },
      wishlistItem: { update: vi.fn() },
      $transaction: vi.fn((fn: (tx: unknown) => unknown) => fn(mockPrisma)),
      // The capture claim (capturedAt, captureId, amount, updatedAt, id) or
      // the payment issue UPDATE (status, updatedAt, id, status)
      $executeRaw: vi.fn(async ({ sql, values }: Prisma.Sql) => {
        if (sql.includes("'CAPTURED'")) {
          const order = db.orders.find((o) => o.id === values[4]);
          if (
            !order ||
            order.status !== "PENDING" ||
            order.paypalTransactionId
          ) {
            return 0;
          }
          order.status = "CAPTURED";
          order.paypalTransactionId = values[1] as string;
          order.capturedAmount = values[2] as number;
          return 1;
        }
        const [status, , id] = values as [string, Date, string];
        const order = db.orders.find((o) => o.id === id);
        if (!order || order.status === status) return 0;
        order.status = status;
        return 1;
      }),
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
vi.mock("@alveusgg/database", async (importOriginal) => ({
  ...(await importOriginal<typeof Database>()),
  prisma: mockPrisma,
}));
vi.mock("@/utils/discord", () => ({
  notifyWishlistDonation: vi.fn(() => Promise.resolve()),
  notifyWishlistItemFunded: vi.fn(() => Promise.resolve()),
  notifyWishlistPaymentIssue: vi.fn(() => Promise.resolve()),
}));
vi.mock("@/server/apis/neon-crm", () => ({
  logWishlistDonationToNeon: vi.fn(),
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
  neonDonationId: null,
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
      needsTarget: false,
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
      Buffer.from(JSON.stringify(event)),
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

  // Token, then GET /v2/payments/captures/CAPTURE-1
  const captureLookup = (orderId: string) =>
    vi.fn(async (url: string) =>
      url.includes("/v1/oauth2/token")
        ? Response.json({ access_token: "token" })
        : Response.json({
            id: "CAPTURE-1",
            supplementary_data: { related_ids: { order_id: orderId } },
          }),
    );

  test.each([
    ["PAYMENT.CAPTURE.REFUNDED", "REFUNDED"],
    ["PAYMENT.CAPTURE.REVERSED", "REVERSED"],
  ])(
    "matches %s on an unrecorded capture through the capture's order",
    async (eventType, status) => {
      const fetchMock = captureLookup("PAYPAL-ORDER-1");
      vi.stubGlobal("fetch", fetchMock);

      const res = await send(refundEvent(eventType));

      expect(res.statusCode).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith(
        "https://api-m.sandbox.paypal.com/v2/payments/captures/CAPTURE-1",
        expect.anything(),
      );
      expect(db.orders[0]).toMatchObject({
        status,
        paypalTransactionId: null,
      });
      expect(notifyWishlistPaymentIssue).toHaveBeenCalledOnce();
      expect(notifyWishlistPaymentIssue).toHaveBeenCalledWith(
        expect.objectContaining({
          status,
          wasCredited: false,
          captureId: "CAPTURE-1",
          amount: 25,
        }),
      );
    },
  );

  test("does not credit a refunded order when COMPLETED arrives late", async () => {
    vi.stubGlobal("fetch", captureLookup("PAYPAL-ORDER-1"));
    const actual = await vi.importActual<typeof WishlistDb>(
      "@/server/db/wishlist",
    );
    vi.mocked(recordWishlistCapture).mockImplementation(
      actual.recordWishlistCapture,
    );

    await send(refundEvent("PAYMENT.CAPTURE.REFUNDED"));
    const late = await send({
      event_type: "PAYMENT.CAPTURE.COMPLETED",
      resource: {
        id: "CAPTURE-1",
        amount: { value: "25.00" },
        supplementary_data: { related_ids: { order_id: "PAYPAL-ORDER-1" } },
      },
    });

    expect(late.statusCode).toBe(200);
    expect(late.body).toEqual({ received: true, alreadyProcessed: true });
    expect(db.orders[0]).toMatchObject({
      status: "REFUNDED",
      paypalTransactionId: null,
      capturedAmount: null,
    });
    expect(recordWishlistCapture).toHaveBeenCalledOnce();
    expect(mockPrisma.wishlistItem.update).not.toHaveBeenCalled();
    expect(notifyWishlistDonation).not.toHaveBeenCalled();
    expect(logWishlistDonationToNeon).not.toHaveBeenCalled();
    expect(notifyWishlistPaymentIssue).toHaveBeenCalledOnce();
  });

  test("alerts once when a refund of an unrecorded capture repeats", async () => {
    vi.stubGlobal("fetch", captureLookup("PAYPAL-ORDER-1"));

    await send(refundEvent("PAYMENT.CAPTURE.REFUNDED"));
    const repeat = await send(refundEvent("PAYMENT.CAPTURE.REFUNDED"));

    expect(repeat.body).toEqual({ received: true, alreadyProcessed: true });
    expect(db.orders[0]?.status).toBe("REFUNDED");
    expect(notifyWishlistPaymentIssue).toHaveBeenCalledOnce();
  });

  test("acknowledges a refund when the capture lookup fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 500 })),
    );

    const res = await send(refundEvent("PAYMENT.CAPTURE.REFUNDED"));

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ received: true });
    expect(db.orders[0]?.status).toBe("PENDING");
    expect(notifyWishlistPaymentIssue).not.toHaveBeenCalled();
  });

  test("acknowledges a refund whose capture matches no order", async () => {
    vi.stubGlobal("fetch", captureLookup("SOME-OTHER-ORDER"));

    const res = await send(refundEvent("PAYMENT.CAPTURE.REFUNDED"));

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ received: true });
    expect(db.orders[0]?.status).toBe("PENDING");
    expect(notifyWishlistPaymentIssue).not.toHaveBeenCalled();
  });

  test("skips a non-wishlist refund without any lookup", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const event = refundEvent("PAYMENT.CAPTURE.REFUNDED");

    const res = await send({
      ...event,
      resource: { ...event.resource, custom_id: "campaign_wolf" },
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ received: true });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(mockPrisma.wishlistDonationOrder.findFirst).not.toHaveBeenCalled();
    expect(mockPrisma.$executeRaw).not.toHaveBeenCalled();
    expect(db.orders[0]?.status).toBe("PENDING");
  });

  test("handles a refund tagged with the wishlist custom ID", async () => {
    db.orders = [capturedOrder()];
    const event = refundEvent("PAYMENT.CAPTURE.REFUNDED");

    const res = await send({
      ...event,
      resource: { ...event.resource, custom_id: WISHLIST_PAYPAL_CUSTOM_ID },
    });

    expect(res.statusCode).toBe(200);
    expect(db.orders[0]?.status).toBe("REFUNDED");
    expect(notifyWishlistPaymentIssue).toHaveBeenCalledOnce();
  });
});

describe("staff payment issue alert", () => {
  test("says Neon needs a manual update, with the capture and amount", async () => {
    const { notifyWishlistPaymentIssue: notify } =
      await vi.importActual<typeof Discord>("@/utils/discord");
    const fetchMock = vi.fn(async () => new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    await notify({
      webhookUrl: "https://discord.example.test/webhook",
      itemTitle: "Heat lamp",
      status: "REFUNDED",
      amount: 25,
      donorName: null,
      wasCredited: true,
      paypalOrderId: "PAYPAL-ORDER-1",
      captureId: "CAPTURE-1",
      neonDonationId: "777",
    });

    const body = JSON.parse(
      (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1]
        .body as string,
    ) as { embeds: { fields: { name: string; value: string }[] }[] };
    expect(body.embeds[0]?.fields).toEqual(
      expect.arrayContaining([
        { name: "Amount", value: "$25.00", inline: true },
        { name: "PayPal capture", value: "CAPTURE-1", inline: false },
        {
          name: "Neon CRM",
          value:
            "Not updated automatically, needs a manual update (donation #777)",
          inline: false,
        },
      ]),
    );
  });
});
