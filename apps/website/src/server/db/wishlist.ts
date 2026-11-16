import { Prisma, prisma } from "@alveusgg/database";

import { env } from "@/env";

import { logWishlistDonationToNeon } from "@/server/apis/neon-crm";

import type { PAYMENT_ISSUE_STATUSES } from "@/data/wishlist";

import {
  notifyWishlistDonation,
  notifyWishlistItemFunded,
  notifyWishlistPaymentIssue,
} from "@/utils/discord";
import { getPartialTargetCents, parsePriceCents } from "@/utils/wishlist";

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

/**
 * Identifiers for raw conditional UPDATEs on donation orders. Prisma's own
 * update and updateMany select the matching ids first under relationMode
 * "prisma", so overlapping calls both report success.
 *
 * TODO: Switch to `updateMany` with the conditions in `where` once Prisma keeps
 * them in the UPDATE and returns its affected row count:
 * https://github.com/prisma/orm/issues/30758
 */
const donationOrderSql = () => {
  const quoteIdentifier = (name: string) =>
    Prisma.raw(`\`${name.replaceAll("`", "``")}\``);
  // Field references keep the columns type checked. The client doesn't expose
  // the table's @@map name, so it is written out here.
  const fields = prisma.wishlistDonationOrder.fields;
  return {
    table: quoteIdentifier("wishlist_donation_orders"),
    id: quoteIdentifier(fields.id.name),
    status: quoteIdentifier(fields.status.name),
    capturedAt: quoteIdentifier(fields.capturedAt.name),
    paypalTransactionId: quoteIdentifier(fields.paypalTransactionId.name),
    capturedAmount: quoteIdentifier(fields.capturedAmount.name),
    updatedAt: quoteIdentifier(fields.updatedAt.name),
  };
};

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
  const capturedAt = new Date();

  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.wishlistDonationOrder.findUnique({
      where: { paypalOrderId: capture.paypalOrderId },
      include: { wishlistItem: true },
    });
    if (!order) return { status: "not_found" } as const;

    // Claim the order in one conditional UPDATE, so when the capture call,
    // the webhook, or a webhook retry overlap, exactly one of them applies
    // the donation. Only pending orders are claimed, never denied, refunded
    // or reversed ones.
    const col = donationOrderSql();
    const claimed = await tx.$executeRaw`
      UPDATE ${col.table}
      SET ${col.status} = 'CAPTURED',
        ${col.capturedAt} = ${capturedAt},
        ${col.paypalTransactionId} = ${capture.captureId},
        ${col.capturedAmount} = ${capture.amount},
        ${col.updatedAt} = ${capturedAt}
      WHERE ${col.id} = ${order.id}
        AND ${col.status} = 'PENDING'
        AND ${col.paypalTransactionId} IS NULL`;
    if (claimed === 0) return { status: "duplicate", order } as const;

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

  // Awaited so a serverless function cannot end before the alert is sent
  try {
    await notifyWishlistDonation({
      webhookUrl: env.DISCORD_WISHLIST_WEBHOOK_URL,
      itemTitle: order.wishlistItem.title,
      amount: capture.amount,
      donorName: order.donorName,
      donorMessage: order.donorMessage,
    });
  } catch (err) {
    console.error("Discord notify failed (non-fatal):", err);
  }

  if (result.justFunded) {
    try {
      await notifyWishlistItemFunded({
        webhookUrl: env.DISCORD_WISHLIST_WEBHOOK_URL,
        itemTitle: order.wishlistItem.title,
      });
    } catch (err) {
      console.error("Discord funded alert failed (non-fatal):", err);
    }
  }

  // A Neon failure is logged and never fails or rolls back the donation.
  try {
    const neonDonationId = await logWishlistDonationToNeon({
      captureId: capture.captureId,
      capturedAt,
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

export type WishlistPaymentIssueStatus =
  (typeof PAYMENT_ISSUE_STATUSES)[number];

export type WishlistPaymentIssue = {
  captureId: string;
  paypalOrderId: string | null;
  status: WishlistPaymentIssueStatus;
  amount: number | null;
};

/**
 * Marks the order of a denied, refunded or reversed capture and tells staff.
 * The item keeps its credit, since it may already have been bought. A
 * capture may not be recorded yet, so the order is also matched by order ID,
 * and a later capture claim skips the order since it is no longer pending.
 */
export async function recordWishlistPaymentIssue(issue: WishlistPaymentIssue) {
  const order = await prisma.wishlistDonationOrder.findFirst({
    where: {
      OR: [
        { paypalTransactionId: issue.captureId },
        ...(issue.paypalOrderId
          ? [{ paypalOrderId: issue.paypalOrderId }]
          : []),
      ],
    },
    include: { wishlistItem: { select: { title: true } } },
  });
  if (!order) return { status: "not_found" } as const;

  // One conditional UPDATE, so a repeated or overlapping delivery of the
  // same event alerts staff once
  const col = donationOrderSql();
  const updated = await prisma.$executeRaw`
    UPDATE ${col.table}
    SET ${col.status} = ${issue.status}, ${col.updatedAt} = ${new Date()}
    WHERE ${col.id} = ${order.id} AND ${col.status} <> ${issue.status}`;
  if (updated === 0) return { status: "duplicate", order } as const;

  try {
    await notifyWishlistPaymentIssue({
      webhookUrl: env.DISCORD_WISHLIST_WEBHOOK_URL,
      itemTitle: order.wishlistItem.title,
      status: issue.status,
      amount: issue.amount ?? order.capturedAmount ?? order.amount,
      donorName: order.donorName,
      // Only the capture claim sets the transaction ID
      wasCredited: order.paypalTransactionId != null,
      paypalOrderId: order.paypalOrderId,
      captureId: issue.captureId,
      neonDonationId: order.neonDonationId,
    });
  } catch (err) {
    console.error("Discord payment issue alert failed (non-fatal):", err);
  }

  return { status: "updated", order } as const;
}
