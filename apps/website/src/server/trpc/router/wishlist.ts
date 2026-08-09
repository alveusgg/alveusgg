/**
 * Public wishlist procedures — donor-facing item browsing and the PayPal
 * donate flow. Staff-only procedures live in ./admin/wishlist.ts.
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { prisma } from "@alveusgg/database";

import { publicProcedure, router } from "@/server/trpc/trpc";

import { createPayPalOrder, capturePayPalOrder } from "@/utils/paypal";
import { logDonationToNeonCrm } from "@/utils/neonCrm";
import { notifyWishlistDonation } from "@/utils/discord";

const statusEnum = z.enum(["NEEDED", "PARTIALLY_FULFILLED", "FULFILLED", "OPENED", "ARCHIVED"]);

export const wishlistRouter = router({
  getPublicItems: publicProcedure
    .input(z.object({
      categorySlug: z.string().optional(),
      status: statusEnum.optional(),
    }))
    .query(async ({ input }) => {
      return prisma.wishlistItem.findMany({
        where: {
          status: input.status ?? { not: "ARCHIVED" },
          ...(input.categorySlug ? { category: { slug: input.categorySlug } } : {}),
        },
        include: { category: true },
        orderBy: [{ sortOrder: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
      });
    }),

  getCategories: publicProcedure.query(async () => {
    return prisma.wishlistCategory.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { items: { where: { status: { not: "ARCHIVED" } } } } },
      },
    });
  }),

  createDonateOrder: publicProcedure
    .input(z.object({
      wishlistItemId: z.string(),
      amount: z.number().min(1).max(10_000),
      donorName: z.string().max(100).optional(),
      donorEmail: z.string().email().optional(),
      donorMessage: z.string().max(500).optional(),
    }))
    .mutation(async ({ input }) => {
      const item = await prisma.wishlistItem.findUnique({
        where: { id: input.wishlistItemId },
      });
      if (!item) throw new TRPCError({ code: "NOT_FOUND" });
      if (item.status === "ARCHIVED") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Item is no longer available" });
      }

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.alveussanctuary.org";

      const { orderId, approvalUrl } = await createPayPalOrder({
        wishlistItemId: item.id,
        wishlistItemTitle: item.title,
        amount: input.amount,
        donorName: input.donorName,
        donorEmail: input.donorEmail,
        returnUrl: `${baseUrl}/wishlist/donate/success?orderId=PAYPAL_ORDER_ID&itemId=${item.id}`,
        cancelUrl: `${baseUrl}/wishlist?donated=cancelled`,
      });

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
    .input(z.object({
      paypalOrderId: z.string(),
      wishlistItemId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const existing = await prisma.wishlistDonationOrder.findFirst({
        where: { paypalOrderId: input.paypalOrderId },
      });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      if (existing.status === "CAPTURED") return { success: true, alreadyCaptured: true };

      const capture = await capturePayPalOrder(input.paypalOrderId);
      if (capture.status !== "COMPLETED") {
        throw new TRPCError({ code: "BAD_REQUEST", message: `PayPal status: ${capture.status}` });
      }

      const item = await prisma.wishlistItem.findUnique({
        where: { id: input.wishlistItemId },
      });
      if (!item) throw new TRPCError({ code: "NOT_FOUND" });

      const neonPromise = logDonationToNeonCrm({
        transactionId: capture.transactionId ?? input.paypalOrderId,
        amount: capture.amount,
        payerEmail: capture.payerEmail ?? existing.donorEmail,
        payerName: capture.payerName ?? existing.donorName,
        wishlistItemId: input.wishlistItemId,
        wishlistItemTitle: item.title,
        donationDate: new Date().toISOString().split("T")[0]!,
      }).catch((err) => {
        console.error("Neon CRM log failed (non-fatal):", err);
        return { success: false as const };
      });

      if (item.itemType === "GOAL") {
        const newRaisedCents = item.raisedAmountCents + Math.round(capture.amount * 100);
        const isFullyFunded = newRaisedCents >= (item.goalAmountCents ?? Infinity);

        await prisma.wishlistItem.update({
          where: { id: item.id },
          data: {
            raisedAmountCents: newRaisedCents,
            status: isFullyFunded
              ? "FULFILLED"
              : newRaisedCents > 0
              ? "PARTIALLY_FULFILLED"
              : item.status,
          },
        });
      } else {
        const newFulfilled = Math.min(item.quantityFulfilled + 1, item.quantity);
        await prisma.wishlistItem.update({
          where: { id: item.id },
          data: {
            quantityFulfilled: newFulfilled,
            status: newFulfilled >= item.quantity
              ? "FULFILLED"
              : newFulfilled > 0
              ? "PARTIALLY_FULFILLED"
              : item.status,
          },
        });
      }

      const neonResult = await neonPromise;

      await prisma.wishlistDonationOrder.update({
        where: { id: existing.id },
        data: {
          status: "CAPTURED",
          capturedAt: new Date(),
          paypalTransactionId: capture.transactionId,
          capturedAmount: capture.amount,
          ...(neonResult.success && "donationId" in neonResult
            ? { neonDonationId: (neonResult as { donationId?: string }).donationId }
            : {}),
        },
      });

      void notifyWishlistDonation({
        itemTitle: item.title,
        amount: capture.amount,
        donorName: existing.donorName,
        donorMessage: existing.donorMessage,
      }).catch((err) => console.error("Discord notify failed (non-fatal):", err));

      return { success: true, amount: capture.amount };
    }),
});
