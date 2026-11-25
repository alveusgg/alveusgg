import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { prisma } from "@alveusgg/database";

import { env } from "@/env";

import {
  getWishlistItemImageUrl,
  recordWishlistCapture,
} from "@/server/db/wishlist";
import { publicProcedure, router } from "@/server/trpc/trpc";

import { capturePayPalOrder, createPayPalOrder } from "@/utils/paypal";
import {
  DONATION_MAX_CENTS,
  DONATION_MIN_CENTS,
  formatPriceExact,
  getDonationOptions,
  partialDonationAmount,
} from "@/utils/wishlist";

const publicStatusEnum = z.enum([
  "NEEDED",
  "PARTIALLY_FULFILLED",
  "FULFILLED",
  "OPENED",
]);

/** What the success page shows for an order another call already captured */
const getCapturedSummary = async (orderId: string) => {
  const order = await prisma.wishlistDonationOrder.findUnique({
    where: { id: orderId },
  });
  return {
    success: true,
    alreadyCaptured: true,
    processing: false,
    amount: order?.capturedAmount ?? undefined,
    excessAmount: order?.excessAmount ?? 0,
  };
};

export const wishlistRouter = router({
  getPublicItems: publicProcedure
    .input(
      z.object({
        categorySlug: z.string().optional(),
        status: publicStatusEnum.optional(),
      }),
    )
    .query(async ({ input }) => {
      // Explicit select: `notes` is admin-only and must never reach the
      // public API, even if new internal-only columns get added later.
      const items = await prisma.wishlistItem.findMany({
        where: {
          status: input.status ?? { not: "ARCHIVED" },
          ...(input.categorySlug
            ? { category: { slug: input.categorySlug } }
            : {}),
        },
        select: {
          id: true,
          title: true,
          description: true,
          fileStorageObject: { select: { key: true } },
          itemType: true,
          url: true,
          price: true,
          quantity: true,
          quantityFulfilled: true,
          goalAmountCents: true,
          raisedAmountCents: true,
          allowPartialDonations: true,
          priority: true,
          status: true,
          sortOrder: true,
          categoryId: true,
          category: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: [
          { sortOrder: "asc" },
          { priority: "desc" },
          { createdAt: "desc" },
        ],
      });

      // Resolved here, so clients get a single image URL and no storage keys
      return items.map(({ fileStorageObject, ...item }) => ({
        ...item,
        imageUrl: getWishlistItemImageUrl(fileStorageObject),
      }));
    }),

  getCategories: publicProcedure.query(async () => {
    const visibleItems = { status: { not: "ARCHIVED" } } as const;
    return prisma.wishlistCategory.findMany({
      where: { archivedAt: null, items: { some: visibleItems } },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { items: { where: visibleItems } } },
      },
    });
  }),

  // Recent donations for the stream overlay, which runs logged out in OBS.
  // Returns only what is shown on stream, never donor emails.
  getRecentDonationAlerts: publicProcedure.query(async () => {
    const donations = await prisma.wishlistDonationOrder.findMany({
      where: {
        status: "CAPTURED",
        capturedAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
      },
      select: {
        id: true,
        donorName: true,
        amount: true,
        capturedAmount: true,
        wishlistItem: { select: { title: true } },
      },
      orderBy: { capturedAt: "desc" },
      take: 20,
    });

    return donations.map((d) => ({
      id: d.id,
      donorName: d.donorName,
      amount: d.capturedAmount ?? d.amount,
      itemTitle: d.wishlistItem.title,
    }));
  }),

  // Checked when the donate dialog opens, since the page may be outdated by then
  getDonationOptions: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const item = await prisma.wishlistItem.findUnique({
        where: { id: input.id },
        select: {
          status: true,
          itemType: true,
          allowPartialDonations: true,
          price: true,
          quantity: true,
          goalAmountCents: true,
          raisedAmountCents: true,
        },
      });
      if (!item) throw new TRPCError({ code: "NOT_FOUND" });
      return getDonationOptions(item);
    }),

  createDonateOrder: publicProcedure
    .input(
      z.object({
        wishlistItemId: z.string(),
        amount: z
          .number()
          .min(DONATION_MIN_CENTS / 100)
          .max(DONATION_MAX_CENTS / 100),
        donorName: z.string().max(100).optional(),
        donorEmail: z.string().email().optional(),
        donorMessage: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const item = await prisma.wishlistItem.findUnique({
        where: { id: input.wishlistItemId },
      });
      if (!item) throw new TRPCError({ code: "NOT_FOUND" });
      const options = getDonationOptions(item);
      if (!options.available) {
        throw new TRPCError({ code: "BAD_REQUEST", message: options.reason });
      }

      // Chip-ins are checked against the remaining balance here, and capped
      // again at capture time in case other donors finish first.
      if (options.remainingCents != null) {
        const amount = partialDonationAmount(options.remainingCents).safeParse(
          input.amount,
        );
        if (!amount.success) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: amount.error.issues[0]?.message ?? "Invalid amount",
          });
        }
      }

      // Full-price products are ordered at the price stored on the server
      let orderAmount = input.amount;
      if (options.priceCents != null) {
        if (Math.round(input.amount * 100) !== options.priceCents) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `This item is donated at its full price of ${formatPriceExact(options.priceCents)}`,
          });
        }
        orderAmount = options.priceCents / 100;
      }

      const baseUrl = env.NEXT_PUBLIC_BASE_URL;

      const { orderId, approvalUrl } = await createPayPalOrder({
        amount: orderAmount,
        itemTitle: item.title,
        donorName: input.donorName,
        donorEmail: input.donorEmail,
        // PayPal appends the order ID as `token`, plus `PayerID`
        returnUrl: `${baseUrl}/wishlist/donate/success?itemId=${item.id}`,
        cancelUrl: `${baseUrl}/wishlist?donated=cancelled`,
      });

      // captureDonation trusts this stored item ID, never one from the client
      await prisma.wishlistDonationOrder.create({
        data: {
          paypalOrderId: orderId,
          wishlistItemId: item.id,
          amount: orderAmount,
          donorName: input.donorName ?? null,
          donorEmail: input.donorEmail ?? null,
          donorMessage: input.donorMessage ?? null,
          status: "PENDING",
        },
      });

      return { orderId, approvalUrl };
    }),

  captureDonation: publicProcedure
    .input(
      z.object({
        paypalOrderId: z.string(),
        // Only checked against the stored order, never used to pick the item
        wishlistItemId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const existing = await prisma.wishlistDonationOrder.findFirst({
        where: { paypalOrderId: input.paypalOrderId },
      });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      if (existing.status === "CAPTURED")
        return getCapturedSummary(existing.id);

      // The item ID comes from the return URL, which the donor can edit, so
      // the stored one is used and a mismatch is rejected
      if (input.wishlistItemId !== existing.wishlistItemId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Item ID does not match the original donation order",
        });
      }

      const capture = await capturePayPalOrder(input.paypalOrderId);
      // A pending capture (e.g. held for review) stays a pending order, and
      // the PAYMENT.CAPTURE.COMPLETED webhook records it once it clears
      if (
        capture.status === "COMPLETED" &&
        capture.captureStatus === "PENDING"
      ) {
        return {
          success: true,
          alreadyCaptured: false,
          processing: true,
          amount: capture.amount,
          excessAmount: 0,
        };
      }
      if (
        capture.status !== "COMPLETED" ||
        capture.captureStatus !== "COMPLETED" ||
        !capture.transactionId
      ) {
        // A second capture call for an order the first call (or the webhook)
        // already recorded is rejected by PayPal, so check our record again.
        const current = await prisma.wishlistDonationOrder.findUnique({
          where: { id: existing.id },
        });
        if (current?.status === "CAPTURED") {
          return getCapturedSummary(existing.id);
        }
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `PayPal status: ${capture.captureStatus ?? capture.status}`,
        });
      }

      const result = await recordWishlistCapture({
        paypalOrderId: input.paypalOrderId,
        captureId: capture.transactionId,
        amount: capture.amount,
        payerEmail: capture.payerEmail,
        payerName: capture.payerName,
      });
      if (result.status === "not_found") {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (result.status === "duplicate") {
        return getCapturedSummary(existing.id);
      }

      return {
        success: true,
        alreadyCaptured: false,
        processing: false,
        amount: capture.amount,
        excessAmount: result.excessAmount,
      };
    }),
});
