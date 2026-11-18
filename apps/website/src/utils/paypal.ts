// PayPal Orders v2 and webhook verification:
// https://developer.paypal.com/api/rest/webhooks/rest/
import { env } from "@/env";

const PAYPAL_API_BASE =
  env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

// Identical on every wishlist order, so the monthly PayPal import into Neon
// can exclude them (the website logs these donations itself)
const WISHLIST_PAYPAL_DESCRIPTION = "Alveus Sanctuary Wishlist";
export const WISHLIST_PAYPAL_CUSTOM_ID = "campaign_wishlist";

async function getAccessToken(): Promise<string> {
  const clientId = env.PAYPAL_CLIENT_ID;
  const clientSecret = env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET not configured");
  }

  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) throw new Error(`PayPal auth failed: ${res.status}`);
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export interface CreateOrderOptions {
  amount: number;
  itemTitle: string;
  donorName?: string;
  donorEmail?: string;
  returnUrl: string;
  cancelUrl: string;
}

export async function createPayPalOrder(
  opts: CreateOrderOptions,
): Promise<{ orderId: string; approvalUrl: string }> {
  const token = await getAccessToken();
  const amount = { currency_code: "USD", value: opts.amount.toFixed(2) };

  const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          custom_id: WISHLIST_PAYPAL_CUSTOM_ID,
          description: WISHLIST_PAYPAL_DESCRIPTION,
          amount: { ...amount, breakdown: { item_total: amount } },
          items: [
            {
              name: WISHLIST_PAYPAL_DESCRIPTION,
              description:
                `Thank you for donating to Alveus Sanctuary toward ${opts.itemTitle}. ` +
                "We’ll do our best to use your gift for this goal. If the item is unavailable or no longer needed, your gift will support the sanctuary’s general operations. " +
                "Any amount raised above the funding goal also supports general operations. Alveus provides no goods or services in exchange for your gift.",
              quantity: "1",
              unit_amount: amount,
              category: "DONATION",
            },
          ],
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            return_url: opts.returnUrl,
            cancel_url: opts.cancelUrl,
            shipping_preference: "NO_SHIPPING",
            user_action: "PAY_NOW",
            // Rules out eChecks and other payments that capture as pending
            payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
          },
        },
      },
    }),
  });

  if (!res.ok) throw new Error(`PayPal order creation failed: ${res.status}`);
  const data = (await res.json()) as {
    id: string;
    links: { rel: string; href: string }[];
  };

  // Orders created with payment_source return the approval link as
  // "payer-action" instead of "approve"
  const approvalUrl = data.links.find(
    (l) => l.rel === "payer-action" || l.rel === "approve",
  )?.href;
  if (!approvalUrl) throw new Error("PayPal response missing approval link");

  return { orderId: data.id, approvalUrl };
}

export interface CaptureResult {
  orderId: string;
  status: string;
  // An order can be COMPLETED while its capture is still PENDING
  captureStatus: string | null;
  amount: number;
  payerEmail: string | null;
  payerName: string | null;
  transactionId: string | null;
}

type PayPalOrderResponse = {
  status: string;
  payer?: {
    email_address?: string;
    name?: { given_name?: string; surname?: string };
  };
  purchase_units?: {
    payments?: {
      captures?: { id: string; status?: string; amount: { value: string } }[];
    };
  }[];
};

function toCaptureResult(
  orderId: string,
  data: PayPalOrderResponse,
): CaptureResult {
  const capture = data.purchase_units?.[0]?.payments?.captures?.[0];

  return {
    orderId,
    status: data.status,
    captureStatus: capture?.status ?? null,
    amount: capture ? parseFloat(capture.amount.value) : 0,
    payerEmail: data.payer?.email_address ?? null,
    payerName: data.payer?.name
      ? [data.payer.name.given_name, data.payer.name.surname]
          .filter(Boolean)
          .join(" ")
      : null,
    transactionId: capture?.id ?? null,
  };
}

export async function capturePayPalOrder(
  orderId: string,
): Promise<CaptureResult> {
  const token = await getAccessToken();

  const res = await fetch(
    `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  // PayPal rejects a second capture, e.g. when the donor reloads the page
  // while the payment is processing, so read the order's current state
  if (!res.ok) return getPayPalOrder(orderId);

  return toCaptureResult(orderId, (await res.json()) as PayPalOrderResponse);
}

export async function getPayPalOrder(orderId: string): Promise<CaptureResult> {
  const token = await getAccessToken();

  const res = await fetch(
    `${PAYPAL_API_BASE}/v2/checkout/orders/${encodeURIComponent(orderId)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) throw new Error(`PayPal order lookup failed: ${res.status}`);

  return toCaptureResult(orderId, (await res.json()) as PayPalOrderResponse);
}

/**
 * Looks up the payer of an order. Capture webhook events don't include the
 * payer, but Neon needs their email to find or create the donor's account.
 */
export async function getPayPalOrderPayer(
  orderId: string,
): Promise<{ email: string | null; name: string | null }> {
  const order = await getPayPalOrder(orderId);
  return { email: order.payerEmail, name: order.payerName };
}

/** Finds the order of a capture, for refund events that only link the capture */
export async function getPayPalCaptureOrderId(
  captureId: string,
): Promise<string | null> {
  const token = await getAccessToken();

  const res = await fetch(
    `${PAYPAL_API_BASE}/v2/payments/captures/${encodeURIComponent(captureId)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) throw new Error(`PayPal capture lookup failed: ${res.status}`);

  const data = (await res.json()) as {
    supplementary_data?: { related_ids?: { order_id?: string } };
  };
  return data.supplementary_data?.related_ids?.order_id ?? null;
}

/**
 * Uses PayPal's verify-webhook-signature endpoint, which handles key rotation.
 * Needs PAYPAL_WEBHOOK_ID, the ID PayPal assigns when the webhook is registered.
 */
export async function verifyPayPalWebhook(
  headers: Record<string, string | string[] | undefined>,
  rawBody: string,
): Promise<boolean> {
  const webhookId = env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    console.error("PAYPAL_WEBHOOK_ID not configured, rejecting webhook");
    return false;
  }

  const header = (name: string) => {
    const val = headers[name.toLowerCase()];
    return Array.isArray(val) ? val[0] : val;
  };

  const transmissionId = header("paypal-transmission-id");
  const transmissionTime = header("paypal-transmission-time");
  const certUrl = header("paypal-cert-url");
  const authAlgo = header("paypal-auth-algo");
  const transmissionSig = header("paypal-transmission-sig");

  if (
    !transmissionId ||
    !transmissionTime ||
    !certUrl ||
    !authAlgo ||
    !transmissionSig
  ) {
    console.warn("PayPal webhook: missing required verification headers");
    return false;
  }

  try {
    const event: unknown = JSON.parse(rawBody);
    if (event === null || typeof event !== "object" || Array.isArray(event)) {
      return false;
    }
  } catch {
    return false;
  }

  const token = await getAccessToken();
  const verification = JSON.stringify({
    transmission_id: transmissionId,
    transmission_time: transmissionTime,
    cert_url: certUrl,
    auth_algo: authAlgo,
    transmission_sig: transmissionSig,
    webhook_id: webhookId,
    webhook_event: null,
  });

  const res = await fetch(
    `${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      // Preserve the event's original JSON formatting for signature verification.
      // @see https://developer.paypal.com/api/rest/webhooks/rest/#postback-method
      body: verification.replace(
        '"webhook_event":null',
        () => `"webhook_event":${rawBody}`,
      ),
    },
  );

  if (!res.ok) return false;
  const data = (await res.json()) as { verification_status: string };
  return data.verification_status === "SUCCESS";
}
