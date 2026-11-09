import { prisma } from "@alveusgg/database";

import { env } from "@/env";

import { logWishlistDonationToNeon } from "@/server/apis/neon-crm";

import { getPartialTargetCents, parsePriceCents } from "@/data/wishlist";

import {
  notifyWishlistDonation,
  notifyWishlistItemFunded,
} from "@/utils/discord";

// Splits a capture into the item's credit and the excess over its remaining
// balance. `raisedAfterCents` is the total after incrementing by the full amount.
export function capCreditToRemaining({
  amountCents,
  raisedAfterCents,
  goalCents,
}: {
  amountCents: number;
  raisedAfterCents: number;
  goalCents: number;
}) {
  const raisedBeforeCents = raisedAfterCents - amountCents;
  const remainingCents = Math.max(0, goalCents - raisedBeforeCents);
  const creditedCents = Math.min(amountCents, remainingCents);
  const raisedCents = raisedBeforeCents + creditedCents;

  return {
    creditedCents,
    excessCents: amountCents - creditedCents,
    raisedCents,
    isFunded: raisedCents >= goalCents,
    // Only the donation that crosses the target reports it, so the funded
    // alert is sent once
    justFunded: raisedBeforeCents < goalCents && raisedCents >= goalCents,
  };
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
    const partialTargetCents = item.allowPartialDonations
      ? getPartialTargetCents(item)
      : null;

    if (partialTargetCents != null) {
      // The atomic increment locks the item row until this transaction
      // commits, so a simultaneous capture waits here and then sees this
      // donation in its total. That lets each capture cap its own credit at
      // the remaining balance, and two donors can never overfund the item.
      const afterIncrement = await tx.wishlistItem.update({
        where: { id: item.id },
        data: { raisedAmountCents: { increment: amountCents } },
      });
      const credit = capCreditToRemaining({
        amountCents,
        raisedAfterCents: afterIncrement.raisedAmountCents,
        goalCents: partialTargetCents,
      });

      await tx.wishlistItem.update({
        where: { id: item.id },
        data: {
          raisedAmountCents: { decrement: credit.excessCents },
          ...(credit.isFunded
            ? {
                status: "FULFILLED",
                ...(item.itemType === "PRODUCT"
                  ? { quantityFulfilled: afterIncrement.quantity }
                  : {}),
              }
            : credit.raisedCents > 0
              ? { status: "PARTIALLY_FULFILLED" }
              : {}),
        },
      });

      // The excess is still a valid donation, kept as a general wishlist gift
      if (credit.excessCents > 0) {
        await tx.wishlistDonationOrder.update({
          where: { id: order.id },
          data: { excessAmount: credit.excessCents / 100 },
        });
      }

      return {
        status: "captured",
        order,
        excessAmount: credit.excessCents / 100,
        justFunded: credit.justFunded,
      } as const;
    }

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

    return {
      status: "captured",
      order,
      excessAmount: 0,
      justFunded: false,
    } as const;
  });

  if (result.status !== "captured") return result;
  const { order } = result;

  void notifyWishlistDonation({
    webhookUrl: env.DISCORD_WISHLIST_WEBHOOK_URL,
    itemTitle: order.wishlistItem.title,
    amount: capture.amount,
    donorName: order.donorName,
    donorMessage: order.donorMessage,
  }).catch((err) => console.error("Discord notify failed (non-fatal):", err));

  if (result.justFunded) {
    void notifyWishlistItemFunded({
      webhookUrl: env.DISCORD_WISHLIST_WEBHOOK_URL,
      itemTitle: order.wishlistItem.title,
    }).catch((err) =>
      console.error("Discord funded alert failed (non-fatal):", err),
    );
  }

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
