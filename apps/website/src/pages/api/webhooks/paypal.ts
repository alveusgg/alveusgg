/**
 * Records a capture even if the donor leaves before captureDonation runs.
 * Register https://www.alveussanctuary.org/api/webhooks/paypal in the PayPal
 * dashboard for PAYMENT.CAPTURE.COMPLETED, and for PAYMENT.CAPTURE.DENIED,
 * DECLINED, REFUNDED and REVERSED so staff hear about failed payments.
 */
import type { NextApiRequest, NextApiResponse } from "next";

import {
  type WishlistPaymentIssueStatus,
  recordWishlistCapture,
  recordWishlistPaymentIssue,
} from "@/server/db/wishlist";

import {
  WISHLIST_PAYPAL_CUSTOM_ID,
  getPayPalCaptureOrderId,
  getPayPalOrderPayer,
  verifyPayPalWebhook,
} from "@/utils/paypal";

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
  // A capture, or for refunds and reversals a refund that links "up" to it
  resource: {
    id: string;
    custom_id?: string;
    amount?: { value: string };
    supplementary_data?: {
      related_ids?: { order_id?: string };
    };
    links?: { rel: string; href: string }[];
  };
}

// PayPal lists DENIED for v1 payments and DECLINED for v2, so both are handled
const paymentIssueStatuses: Record<string, WishlistPaymentIssueStatus> = {
  "PAYMENT.CAPTURE.DENIED": "DENIED",
  "PAYMENT.CAPTURE.DECLINED": "DENIED",
  "PAYMENT.CAPTURE.REFUNDED": "REFUNDED",
  "PAYMENT.CAPTURE.REVERSED": "REVERSED",
};

const getCaptureId = (resource: PayPalCaptureEvent["resource"]) => {
  const up = resource.links?.find((link) => link.rel === "up")?.href;
  return up?.match(/\/v2\/payments\/captures\/([^/?]+)/)?.[1] ?? resource.id;
};

async function handlePaymentIssue(
  event: PayPalCaptureEvent,
  status: WishlistPaymentIssueStatus,
  res: NextApiResponse,
) {
  const customId = event.resource.custom_id;
  if (customId && customId !== WISHLIST_PAYPAL_CUSTOM_ID) {
    return res.status(200).json({ received: true });
  }

  const captureId = getCaptureId(event.resource);
  const amount = event.resource.amount
    ? parseFloat(event.resource.amount.value)
    : null;
  const paypalOrderId =
    event.resource.supplementary_data?.related_ids?.order_id ?? null;

  try {
    let result = await recordWishlistPaymentIssue({
      captureId,
      paypalOrderId,
      status,
      amount,
    });

    // A refund of a capture we never recorded carries no order ID, so ask
    // PayPal which order the capture belongs to
    if (result.status === "not_found" && !paypalOrderId) {
      const captureOrderId = await getPayPalCaptureOrderId(captureId).catch(
        (err) => {
          console.warn("PayPal webhook: capture lookup failed", err);
          return null;
        },
      );
      if (captureOrderId) {
        result = await recordWishlistPaymentIssue({
          captureId,
          paypalOrderId: captureOrderId,
          status,
          amount,
        });
      }
    }

    if (result.status === "not_found") {
      console.warn(
        `PayPal webhook: no donation order found for ${event.event_type} on capture ${captureId}`,
      );
    } else if (result.status === "duplicate") {
      return res.status(200).json({ received: true, alreadyProcessed: true });
    }
  } catch (err) {
    console.error("PayPal webhook: DB update failed", err);
    return res.status(500).json({ error: "Failed to record payment issue" });
  }

  return res.status(200).json({ received: true });
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

  const issueStatus = paymentIssueStatuses[event.event_type];
  if (issueStatus) return handlePaymentIssue(event, issueStatus, res);

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
