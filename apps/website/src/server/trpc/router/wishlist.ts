import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { prisma } from "@alveusgg/database";

import { env } from "@/env";

import { recordWishlistCapture } from "@/server/db/wishlist";
import { publicProcedure, router } from "@/server/trpc/trpc";

import {
  canAcceptDonations,
  getPartialTargetCents,
  partialDonationAmount,
} from "@/data/wishlist";

import { capturePayPalOrder, createPayPalOrder } from "@/utils/paypal";

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
      return prisma.wishlistItem.findMany({
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
          imageUrl: true,
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

  createDonateOrder: publicProcedure
    .input(
      z.object({
        wishlistItemId: z.string(),
        amount: z.number().min(1).max(10_000),
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
      if (!canAcceptDonations(item.status)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This item is no longer accepting donations",
        });
      }

      // Chip-ins are checked against the remaining balance here, and capped
      // again at capture time in case other donors finish first.
      const partialTargetCents = item.allowPartialDonations
        ? getPartialTargetCents(item)
        : null;
      if (partialTargetCents != null) {
        const remainingCents = partialTargetCents - item.raisedAmountCents;
        if (remainingCents <= 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "This item is already fully funded",
          });
        }
        const amount = partialDonationAmount(remainingCents).safeParse(
          input.amount,
        );
        if (!amount.success) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: amount.error.issues[0]?.message ?? "Invalid amount",
          });
        }
      }

      const baseUrl = env.NEXT_PUBLIC_BASE_URL;

      const { orderId, approvalUrl } = await createPayPalOrder({
        wishlistItemId: item.id,
        wishlistItemTitle: item.title,
        amount: input.amount,
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
          amount: input.amount,
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
      if (capture.status !== "COMPLETED" || !capture.transactionId) {
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
          message: `PayPal status: ${capture.status}`,
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
        amount: capture.amount,
        excessAmount: result.excessAmount,
      };
    }),
});
