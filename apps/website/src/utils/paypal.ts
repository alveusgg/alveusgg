/**
 * PayPal Orders v2 API integration + webhook signature verification.
 *
 * NOTE: createPayPalOrder/capturePayPalOrder implement PayPal's documented
 * REST API shape but have not been exercised against live PayPal
 * credentials/sandbox — same caveat as the rest of this integration.
 * verifyPayPalWebhook follows PayPal's documented verify-webhook-signature
 * endpoint: https://developer.paypal.com/api/rest/webhooks/rest/
 */

const PAYPAL_API_BASE =
  process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
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
  wishlistItemId: string;
  wishlistItemTitle: string;
  amount: number;
  donorName?: string;
  donorEmail?: string;
  returnUrl: string;
  cancelUrl: string;
}

export async function createPayPalOrder(
  opts: CreateOrderOptions,
): Promise<{ orderId: string; approvalUrl: string }> {
  const token = await getAccessToken();

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
          custom_id: opts.wishlistItemId,
          description: `Wishlist donation: ${opts.wishlistItemTitle}`.slice(0, 127),
          amount: { currency_code: "USD", value: opts.amount.toFixed(2) },
        },
      ],
      application_context: {
        return_url: opts.returnUrl,
        cancel_url: opts.cancelUrl,
        user_action: "PAY_NOW",
      },
    }),
  });

  if (!res.ok) throw new Error(`PayPal order creation failed: ${res.status}`);
  const data = (await res.json()) as { id: string; links: { rel: string; href: string }[] };

  const approvalUrl = data.links.find((l) => l.rel === "approve")?.href;
  if (!approvalUrl) throw new Error("PayPal response missing approval link");

  return { orderId: data.id, approvalUrl };
}

export interface CaptureResult {
  orderId: string;
  status: string;
  amount: number;
  payerEmail: string | null;
  payerName: string | null;
  transactionId: string | null;
}

export async function capturePayPalOrder(orderId: string): Promise<CaptureResult> {
  const token = await getAccessToken();

  const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = (await res.json()) as {
    status: string;
    payer?: { email_address?: string; name?: { given_name?: string; surname?: string } };
    purchase_units?: {
      payments?: {
        captures?: { id: string; amount: { value: string } }[];
      };
    }[];
  };

  const capture = data.purchase_units?.[0]?.payments?.captures?.[0];

  return {
    orderId,
    status: data.status,
    amount: capture ? parseFloat(capture.amount.value) : 0,
    payerEmail: data.payer?.email_address ?? null,
    payerName: data.payer?.name
      ? [data.payer.name.given_name, data.payer.name.surname].filter(Boolean).join(" ")
      : null,
    transactionId: capture?.id ?? null,
  };
}

/**
 * Verifies an incoming PayPal webhook actually came from PayPal, using
 * PayPal's server-side verify-webhook-signature endpoint (recommended over
 * manual signature verification, since PayPal's key rotation is handled
 * for you). Requires PAYPAL_WEBHOOK_ID — the ID assigned when the webhook
 * is registered in the PayPal Developer Dashboard.
 */
export async function verifyPayPalWebhook(
  headers: Record<string, string | string[] | undefined>,
  rawBody: string,
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    console.error("PAYPAL_WEBHOOK_ID not configured — rejecting webhook");
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

  if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
    console.warn("PayPal webhook: missing required verification headers");
    return false;
  }

  let webhookEvent: unknown;
  try {
    webhookEvent = JSON.parse(rawBody);
  } catch {
    return false;
  }

  const token = await getAccessToken();

  const res = await fetch(`${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      transmission_id: transmissionId,
      transmission_time: transmissionTime,
      cert_url: certUrl,
      auth_algo: authAlgo,
      transmission_sig: transmissionSig,
      webhook_id: webhookId,
      webhook_event: webhookEvent,
    }),
  });

  if (!res.ok) return false;
  const data = (await res.json()) as { verification_status: string };
  return data.verification_status === "SUCCESS";
}
