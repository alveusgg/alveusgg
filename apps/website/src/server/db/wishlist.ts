import { prisma } from "@alveusgg/database";

import { logWishlistDonationToNeon } from "@/server/apis/neon-crm";

import { notifyWishlistDonation } from "@/utils/discord";

/** Parses a display price like "$29.99" into whole cents. Returns null if unparseable. */
export function parsePriceCents(price: string | null): number | null {
  if (!price) return null;
  const n = parseFloat(price.replace(/[^0-9.]/g, ""));
  return isNaN(n) || n <= 0 ? null : Math.round(n * 100);
}

export type WishlistCapture = {
  paypalOrderId: string;
  captureId: string;
  amount: number;
  payerEmail: string | null;
  payerName: string | null;
};

/**
 * Applies a completed PayPal capture to its wishlist item, then notifies
 * Discord and logs the donation in Neon. Both the capture mutation and the
 * PayPal webhook call this, so it is idempotent per order and capture ID.
 */
export async function recordWishlistCapture(capture: WishlistCapture) {
  const amountCents = Math.round(capture.amount * 100);

  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.wishlistDonationOrder.findUnique({
      where: { paypalOrderId: capture.paypalOrderId },
      include: { wishlistItem: true },
    });
    if (!order) return { status: "not_found" } as const;

    // Claim the order with a conditional update, so when the capture call,
    // the webhook, or a webhook retry overlap, exactly one of them applies
    // the donation. The others see zero updated rows and stop here.
    const claimed = await tx.wishlistDonationOrder.updateMany({
      where: {
        id: order.id,
        status: { not: "CAPTURED" },
        paypalTransactionId: null,
      },
      data: {
        status: "CAPTURED",
        capturedAt: new Date(),
        paypalTransactionId: capture.captureId,
        capturedAmount: capture.amount,
      },
    });
    if (claimed.count === 0) return { status: "duplicate", order } as const;

    const item = order.wishlistItem;

    // Both branches use an atomic `increment` (`UPDATE ... SET x = x + n`),
    // so two donations completing at the same moment can never overwrite
    // each other's contribution.
    if (item.itemType === "GOAL") {
      const afterIncrement = await tx.wishlistItem.update({
        where: { id: item.id },
        data: { raisedAmountCents: { increment: amountCents } },
      });
      const isFullyFunded =
        afterIncrement.raisedAmountCents >=
        (afterIncrement.goalAmountCents ?? Infinity);
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
    } else {
      // PRODUCT items accumulate dollars toward each unit's price, so a $1
      // donation on a $500 item does not count as one whole unit funded.
      const priceCents = parsePriceCents(item.price);
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
          status:
            newQuantityFulfilled >= afterIncrement.quantity
              ? "FULFILLED"
              : newQuantityFulfilled > 0
                ? "PARTIALLY_FULFILLED"
                : afterIncrement.status,
        },
      });
    }

    return { status: "captured", order } as const;
  });

  if (result.status !== "captured") return result;
  const { order } = result;

  void notifyWishlistDonation({
    itemTitle: order.wishlistItem.title,
    amount: capture.amount,
    donorName: order.donorName,
    donorMessage: order.donorMessage,
  }).catch((err) => console.error("Discord notify failed (non-fatal):", err));

  // A Neon failure is logged and never fails or rolls back the donation.
  try {
    const neonDonationId = await logWishlistDonationToNeon({
      captureId: capture.captureId,
      amount: capture.amount,
      email: capture.payerEmail ?? order.donorEmail,
      name: capture.payerName ?? order.donorName,
      itemTitle: order.wishlistItem.title,
    });
    if (neonDonationId) {
      await prisma.wishlistDonationOrder.update({
        where: { id: order.id },
        data: { neonDonationId },
      });
    }
  } catch (err) {
    console.error(
      `Neon CRM log failed for PayPal capture ${capture.captureId} (donation still recorded):`,
      err,
    );
  }

  return result;
}
