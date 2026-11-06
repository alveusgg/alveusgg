/**
 * Records a capture even if the donor leaves before captureDonation runs.
 * Register https://www.alveussanctuary.org/api/webhooks/paypal in the PayPal
 * dashboard for PAYMENT.CAPTURE.COMPLETED.
 */
import type { NextApiRequest, NextApiResponse } from "next";

import { recordWishlistCapture } from "@/server/db/wishlist";

import { getPayPalOrderPayer, verifyPayPalWebhook } from "@/utils/paypal";

export const config = {
  api: {
    // Raw body required to verify PayPal's signature
    bodyParser: false,
  },
};

async function readRawBody(req: NextApiRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk: Buffer) => {
      data += chunk.toString();
    });
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
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
    // Not an event type we act on, so acknowledge and exit
    return res.status(200).json({ received: true });
  }

  const paypalOrderId =
    event.resource.supplementary_data?.related_ids?.order_id;
  if (!paypalOrderId) {
    console.warn("PayPal webhook: capture event missing order_id");
    return res.status(200).json({ received: true });
  }

  const captureId = event.resource.id;
  const capturedAmount = parseFloat(event.resource.amount?.value ?? "0");

  try {
    // Capture events don't include the payer, which Neon needs. A failed
    // lookup only means Neon falls back to the email the donor entered.
    const payer = await getPayPalOrderPayer(paypalOrderId).catch((err) => {
      console.warn("PayPal webhook: payer lookup failed", err);
      return { email: null, name: null };
    });

    // Idempotent per order and capture ID. If the client-side capture already
    // recorded this payment, or PayPal delivers the event again (which it
    // warns can happen), nothing is applied twice.
    const result = await recordWishlistCapture({
      paypalOrderId,
      captureId,
      amount: capturedAmount,
      payerEmail: payer.email,
      payerName: payer.name,
    });

    if (result.status === "not_found") {
      console.warn(
        `PayPal webhook: no donation order found for PayPal order ${paypalOrderId}`,
      );
    } else if (result.status === "duplicate") {
      return res.status(200).json({ received: true, alreadyProcessed: true });
    } else {
      console.log(
        `PayPal webhook: recorded capture ${captureId} for PayPal order ${paypalOrderId}`,
      );
    }
  } catch (err) {
    // The capture is applied in a single transaction, so a failure leaves
    // nothing half applied. Return an error so PayPal retries the delivery.
    console.error("PayPal webhook: DB update failed", err);
    return res.status(500).json({ error: "Failed to record capture" });
  }

  return res.status(200).json({ received: true });
}
