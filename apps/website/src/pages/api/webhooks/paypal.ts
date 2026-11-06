/**
 * PayPal webhook handler — the independent, server-to-server confirmation
 * path for donations. This exists alongside the client-triggered
 * captureDonation tRPC mutation specifically to cover the case where a
 * donor's browser crashes or closes right after paying but before the
 * client-side capture call completes: PayPal still reaches this endpoint
 * directly, so the donation gets recorded and fulfillment still updates
 * even if the donor never sees the success page.
 *
 * Idempotent by design: since both this webhook AND the client-side
 * capture can independently confirm the same payment, this checks the
 * WishlistDonationOrder's status before processing, so a payment already
 * marked CAPTURED (by either path) is never double-applied to fulfillment.
 *
 * Register this URL in the PayPal Developer Dashboard:
 *   https://www.alveussanctuary.org/api/webhooks/paypal
 * Subscribe to: PAYMENT.CAPTURE.COMPLETED
 */

import type { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@alveusgg/database";

import { verifyPayPalWebhook } from "@/utils/paypal";
import { notifyWishlistDonation } from "@/utils/discord";

export const config = {
  api: {
    // Raw body required to verify PayPal's signature
    bodyParser: false,
  },
};

async function readRawBody(req: NextApiRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk: Buffer) => { data += chunk.toString(); });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

interface PayPalCaptureEvent {
  event_type: string;
  resource: {
    id: string;
    custom_id?: string; // wishlistItemId, set at order creation
    amount?: { value: string };
    supplementary_data?: {
      related_ids?: { order_id?: string };
    };
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const rawBody = await readRawBody(req);

  const isValid = await verifyPayPalWebhook(
    req.headers as Record<string, string | string[] | undefined>,
    rawBody,
  );
  if (!isValid) {
    console.warn("PayPal webhook: invalid signature");
    return res.status(400).json({ error: "Invalid signature" });
  }

  let event: PayPalCaptureEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  if (event.event_type !== "PAYMENT.CAPTURE.COMPLETED") {
    // Not an event type we act on — acknowledge and exit
    return res.status(200).json({ received: true });
  }

  const paypalOrderId = event.resource.supplementary_data?.related_ids?.order_id;
  if (!paypalOrderId) {
    console.warn("PayPal webhook: capture event missing order_id");
    return res.status(200).json({ received: true });
  }

  const donationOrder = await prisma.wishlistDonationOrder.findFirst({
    where: { paypalOrderId },
  });
  if (!donationOrder) {
    console.warn(`PayPal webhook: no donation order found for PayPal order ${paypalOrderId}`);
    return res.status(200).json({ received: true });
  }

  // Idempotency guard — if the client-side capture already processed this
  // (or a duplicate webhook delivery fires, which PayPal explicitly warns
  // can happen), don't apply fulfillment twice.
  if (donationOrder.status === "CAPTURED") {
    return res.status(200).json({ received: true, alreadyProcessed: true });
  }

  // The item ID always comes from our own stored order record, never from
  // the webhook payload's custom_id alone — this is the item the donor
  // actually paid for, not whatever an event field claims.
  const item = await prisma.wishlistItem.findUnique({
    where: { id: donationOrder.wishlistItemId },
  });
  if (!item) {
    console.error(`PayPal webhook: wishlist item ${donationOrder.wishlistItemId} not found`);
    return res.status(200).json({ received: true });
  }

  const capturedAmount = parseFloat(event.resource.amount?.value ?? "0");
  const amountCents = Math.round(capturedAmount * 100);

  try {
    // Same atomic-increment + interactive-transaction pattern as the
    // client-side captureDonation mutation — see that file for the full
    // explanation of why a naive read-then-write isn't safe here.
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
      const priceCents = item.price
        ? Math.round(parseFloat(item.price.replace(/[^0-9.]/g, "")) * 100) || null
        : null;

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

    await prisma.wishlistDonationOrder.update({
      where: { id: donationOrder.id },
      data: {
        status: "CAPTURED",
        capturedAt: new Date(),
        paypalTransactionId: event.resource.id,
        capturedAmount,
      },
    });

    // TODO: Neon CRM logging from the webhook path is not yet implemented —
    // extending @alveusgg/neon-crm-api with a createDonation function is
    // pending schema details from the Neon CRM API docs (tracked in PR
    // discussion). For now, donations reaching PayPal only via this webhook
    // path (donor's browser crashed/closed before the client-side capture
    // ran) will be fulfilled here but not yet logged to Neon CRM until that
    // package extension lands.

    void notifyWishlistDonation({
      itemTitle: item.title,
      amount: capturedAmount,
      donorName: donationOrder.donorName,
      donorMessage: donationOrder.donorMessage,
    }).catch((err) => console.error("Discord notify failed (non-fatal):", err));

    console.log(`PayPal webhook: item "${item.title}" fulfilled via webhook (order ${paypalOrderId})`);
  } catch (err) {
    console.error("PayPal webhook: DB update failed", err);
    // Still return 200 so PayPal doesn't retry indefinitely on a
    // transient error that already partially applied
  }

  return res.status(200).json({ received: true });
}
