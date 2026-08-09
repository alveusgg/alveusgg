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

/** Parses a display price like "$29.99" into whole cents. Returns null if unparseable. */
function parsePriceCents(price: string | null): number | null {
  if (!price) return null;
  const n = parseFloat(price.replace(/[^0-9.]/g, ""));
  return isNaN(n) || n <= 0 ? null : Math.round(n * 100);
}

export const wishlistRouter = router({
  getPublicItems: publicProcedure
    .input(z.object({
      categorySlug: z.string().optional(),
      status: statusEnum.optional(),
    }))
    .query(async ({ input }) => {
      // Explicit select — `notes` is admin-only and must never reach the
      // public API, even if new internal-only columns get added later.
      return prisma.wishlistItem.findMany({
        where: {
          status: input.status ?? { not: "ARCHIVED" },
          ...(input.categorySlug ? { category: { slug: input.categorySlug } } : {}),
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
          priority: true,
          status: true,
          sortOrder: true,
          categoryId: true,
          category: true,
          createdAt: true,
          updatedAt: true,
          // notes: intentionally excluded — admin-only field
        },
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

      // wishlistItemId is stored server-side here, on our own record — this
      // (not anything the client sends back later) is what captureDonation
      // trusts to determine which item a payment fulfills.
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
      // Accepted for a sanity check only — never used to select which item
      // gets fulfilled. See comment below.
      wishlistItemId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const existing = await prisma.wishlistDonationOrder.findFirst({
        where: { paypalOrderId: input.paypalOrderId },
      });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      if (existing.status === "CAPTURED") return { success: true, alreadyCaptured: true };

      // The donor's browser supplies `input.wishlistItemId` via the return
      // URL, which means it's attacker-controllable. The item that actually
      // gets fulfilled is always `existing.wishlistItemId` — the one we
      // stored server-side back when the order was created — never the
      // client-supplied value. A mismatch here means someone edited the
      // URL, which we reject outright rather than silently ignoring.
      if (input.wishlistItemId !== existing.wishlistItemId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Item ID does not match the original donation order",
        });
      }

      const capture = await capturePayPalOrder(input.paypalOrderId);
      if (capture.status !== "COMPLETED") {
        throw new TRPCError({ code: "BAD_REQUEST", message: `PayPal status: ${capture.status}` });
      }

      const item = await prisma.wishlistItem.findUnique({
        where: { id: existing.wishlistItemId },
      });
      if (!item) throw new TRPCError({ code: "NOT_FOUND" });

      const neonPromise = logDonationToNeonCrm({
        transactionId: capture.transactionId ?? input.paypalOrderId,
        amount: capture.amount,
        payerEmail: capture.payerEmail ?? existing.donorEmail,
        payerName: capture.payerName ?? existing.donorName,
        wishlistItemId: existing.wishlistItemId,
        wishlistItemTitle: item.title,
        donationDate: new Date().toISOString().split("T")[0]!,
      }).catch((err) => {
        console.error("Neon CRM log failed (non-fatal):", err);
        return { success: false as const };
      });

      const amountCents = Math.round(capture.amount * 100);

      // Both branches use an atomic `increment` (translates to
      // `UPDATE ... SET x = x + n` at the database level) inside an
      // interactive transaction, so two donations completing at the same
      // moment can never overwrite each other's contribution — unlike a
      // naive read-then-write, which loses whichever update finishes last.
      if (item.itemType === "GOAL") {
        await prisma.$transaction(async (tx) => {
          const afterIncrement = await tx.wishlistItem.update({
            where: { id: item.id },
            data: { raisedAmountCents: { increment: amountCents } },
          });
          const isFullyFunded =
            afterIncrement.raisedAmountCents >= (afterIncrement.goalAmountCents ?? Infinity);
          await tx.wishlistItem.update({
            where: { id: item.id },
            data: {
              status: isFullyFunded
                ? "FULFILLED"
                : afterIncrement.raisedAmountCents > 0
                ? "PARTIALLY_FULFILLED"
                : afterIncrement.status,
            },
          });
        });
      } else {
        // PRODUCT items accumulate dollars toward each unit's price rather
        // than incrementing quantityFulfilled by 1 per donation regardless
        // of amount — a $1 donation on a $500 item should not count as one
        // whole unit funded. This reuses raisedAmountCents (already present
        // on the model for GOAL items) as the running total for PRODUCT
        // items too, so no schema change is needed.
        const priceCents = parsePriceCents(item.price);

        await prisma.$transaction(async (tx) => {
          const afterIncrement = await tx.wishlistItem.update({
            where: { id: item.id },
            data: { raisedAmountCents: { increment: amountCents } },
          });

          const newQuantityFulfilled = priceCents
            ? Math.min(
                Math.floor(afterIncrement.raisedAmountCents / priceCents),
                afterIncrement.quantity,
              )
            : afterIncrement.quantityFulfilled;

          await tx.wishlistItem.update({
            where: { id: item.id },
            data: {
              quantityFulfilled: newQuantityFulfilled,
              status: newQuantityFulfilled >= afterIncrement.quantity
                ? "FULFILLED"
                : newQuantityFulfilled > 0
                ? "PARTIALLY_FULFILLED"
                : afterIncrement.status,
            },
          });
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
