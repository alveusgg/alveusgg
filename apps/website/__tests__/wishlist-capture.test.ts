import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import type { Prisma } from "@alveusgg/database";
import type * as Database from "@alveusgg/database";

import { sendChatMessage } from "@/server/apis/twitch";
import { getAlveusggAccessToken } from "@/server/db/twitch-channels";
import { recordWishlistCapture } from "@/server/db/wishlist";

import { channels } from "@/data/twitch";

import {
  notifyWishlistDonation,
  notifyWishlistItemNeedsTarget,
} from "@/utils/discord";

const { mockEnv, mockPrisma, tx } = vi.hoisted(() => {
  const tx = {
    wishlistDonationOrder: {
      findUnique: vi.fn(),
    },
    $executeRaw: vi.fn(),
    wishlistItem: {
      update: vi.fn(),
    },
  };
  return {
    mockEnv: {
      NEON_CRM_BASE_URL: "https://neon.example.test/v2/",
      NEON_CRM_API_KEY: "test-key" as string | undefined,
      NEON_CRM_ORG_ID: "example",
      NEXT_PUBLIC_SHORT_BASE_URL: "https://short.example.test",
    },
    tx,
    mockPrisma: {
      $transaction: vi.fn((fn: (client: typeof tx) => unknown) => fn(tx)),
      wishlistDonationOrder: {
        update: vi.fn(),
        fields: new Proxy({}, { get: (_, name) => ({ name }) }),
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
  notifyWishlistItemNeedsTarget: vi.fn(() => Promise.resolve()),
}));
vi.mock("@/server/apis/twitch", () => ({
  sendChatMessage: vi.fn(() => Promise.resolve()),
}));
vi.mock("@/server/db/twitch-channels", () => ({
  getAlveusggAccessToken: vi.fn(() => Promise.resolve("chat-token")),
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
  tx.$executeRaw.mockResolvedValue(1);
  tx.wishlistItem.update.mockResolvedValue({
    ...item,
    raisedAmountCents: 2_500,
  });
  mockPrisma.wishlistDonationOrder.update.mockResolvedValue({});
});

afterEach(() => {
  vi.useRealTimers();
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
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-07T18:00:00Z"));

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
      date: "2026-11-07",
      campaign: { id: "24" },
      payments: [
        {
          amount: 25,
          tenderType: 17,
          paymentStatus: "Succeeded",
          receivedDate: "2026-11-07",
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

    const [{ sql, values }] = tx.$executeRaw.mock.calls[0] as [Prisma.Sql];
    expect(sql.replace(/\s+/g, " ").trim()).toBe(
      "UPDATE `wishlist_donation_orders` SET `status` = 'CAPTURED', `capturedAt` = ?, `paypalTransactionId` = ?, `capturedAmount` = ?, `updatedAt` = ? WHERE `id` = ? AND `status` = 'PENDING' AND `paypalTransactionId` IS NULL",
    );
    expect(values).toEqual([
      expect.any(Date),
      "CAPTURE-1",
      25,
      expect.any(Date),
      "order-1",
    ]);
    expect(tx.wishlistItem.update).toHaveBeenCalledWith({
      where: { id: "item-1" },
      data: { raisedAmountCents: { increment: 2_500 } },
    });
  });

  test("ignores a duplicate capture without crediting or logging again", async () => {
    tx.$executeRaw.mockResolvedValue(0);
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);

    const result = await recordWishlistCapture(capture);

    expect(result.status).toBe("duplicate");
    expect(tx.wishlistItem.update).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
    expect(notifyWishlistDonation).not.toHaveBeenCalled();
    expect(sendChatMessage).not.toHaveBeenCalled();
    expect(mockPrisma.wishlistDonationOrder.update).not.toHaveBeenCalled();
  });

  test("thanks the donor in the Alveus chat", async () => {
    mockEnv.NEON_CRM_API_KEY = undefined;
    vi.spyOn(console, "warn").mockImplementation(() => {});

    await recordWishlistCapture(capture);

    expect(sendChatMessage).toHaveBeenCalledExactlyOnceWith(
      "chat-token",
      channels.alveusgg.id,
      channels.alveus.id,
      "alveusLove Stream Name donated $25 towards Heat lamp! https://short.example.test/wishlist",
    );
  });

  test("shows a donor without a name as anonymous, never their PayPal name", async () => {
    mockEnv.NEON_CRM_API_KEY = undefined;
    vi.spyOn(console, "warn").mockImplementation(() => {});
    tx.wishlistDonationOrder.findUnique.mockResolvedValue({
      ...order,
      donorName: " ",
    });

    await recordWishlistCapture({ ...capture, amount: 12.5 });

    expect(vi.mocked(sendChatMessage).mock.calls[0]?.[3]).toBe(
      "alveusLove Anonymous donated $12.50 towards Heat lamp! https://short.example.test/wishlist",
    );
  });

  test("keeps the donation when the chat message fails", async () => {
    mockEnv.NEON_CRM_API_KEY = undefined;
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(getAlveusggAccessToken).mockRejectedValueOnce(
      new Error("No Twitch account found"),
    );

    const result = await recordWishlistCapture(capture);

    expect(result.status).toBe("captured");
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining("Twitch chat message failed"),
      expect.any(Error),
    );
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

  test("waits for the Discord alert before returning", async () => {
    mockEnv.NEON_CRM_API_KEY = undefined;
    vi.spyOn(console, "warn").mockImplementation(() => {});
    let sendAlert = () => {};
    vi.mocked(notifyWishlistDonation).mockReturnValueOnce(
      new Promise<void>((resolve) => {
        sendAlert = resolve;
      }),
    );

    let settled = false;
    const pending = recordWishlistCapture(capture).then((result) => {
      settled = true;
      return result;
    });
    await vi.waitFor(() => expect(notifyWishlistDonation).toHaveBeenCalled());
    expect(settled).toBe(false);

    sendAlert();
    expect((await pending).status).toBe("captured");
  });

  test("keeps the donation when the Discord alert fails", async () => {
    mockEnv.NEON_CRM_API_KEY = undefined;
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(notifyWishlistDonation).mockRejectedValueOnce(
      new Error("Discord is down"),
    );

    const result = await recordWishlistCapture(capture);

    expect(result.status).toBe("captured");
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining("Discord notify failed"),
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

describe("partial items without a target", () => {
  const noTarget = {
    ...item,
    itemType: "PRODUCT",
    allowPartialDonations: true,
    goalAmountCents: null,
    price: "about $40",
  };

  beforeEach(() => {
    mockEnv.NEON_CRM_API_KEY = undefined;
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  test("records the capture and alerts staff once", async () => {
    tx.wishlistDonationOrder.findUnique.mockResolvedValue({
      ...order,
      wishlistItem: noTarget,
    });
    tx.wishlistItem.update.mockResolvedValue({
      ...noTarget,
      raisedAmountCents: 2_500,
    });

    const result = await recordWishlistCapture(capture);

    expect(result.status).toBe("captured");
    expect(tx.wishlistItem.update).toHaveBeenCalledWith({
      where: { id: "item-1" },
      data: { raisedAmountCents: { increment: 2_500 } },
    });
    expect(notifyWishlistDonation).toHaveBeenCalledTimes(1);
    expect(notifyWishlistItemNeedsTarget).toHaveBeenCalledTimes(1);
    expect(notifyWishlistItemNeedsTarget).toHaveBeenCalledWith(
      expect.objectContaining({
        itemTitle: "Heat lamp",
        paypalOrderId: "PAYPAL-ORDER-1",
        amount: 25,
      }),
    );

    // A webhook retry of the same capture loses the claim
    tx.$executeRaw.mockResolvedValue(0);
    const retry = await recordWishlistCapture(capture);

    expect(retry.status).toBe("duplicate");
    expect(notifyWishlistItemNeedsTarget).toHaveBeenCalledTimes(1);
  });

  test("does not alert for a partial item with a target", async () => {
    tx.wishlistDonationOrder.findUnique.mockResolvedValue({
      ...order,
      wishlistItem: { ...noTarget, price: "40.00" },
    });

    const result = await recordWishlistCapture(capture);

    expect(result.status).toBe("captured");
    expect(notifyWishlistItemNeedsTarget).not.toHaveBeenCalled();
  });
});
