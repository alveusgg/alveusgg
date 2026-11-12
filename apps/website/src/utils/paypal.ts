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
const WISHLIST_PAYPAL_CUSTOM_ID = "campaign_wishlist";

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
          custom_id: WISHLIST_PAYPAL_CUSTOM_ID,
          description: WISHLIST_PAYPAL_DESCRIPTION,
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
  const data = (await res.json()) as {
    id: string;
    links: { rel: string; href: string }[];
  };

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

  const data = (await res.json()) as {
    status: string;
    payer?: {
      email_address?: string;
      name?: { given_name?: string; surname?: string };
    };
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
      ? [data.payer.name.given_name, data.payer.name.surname]
          .filter(Boolean)
          .join(" ")
      : null,
    transactionId: capture?.id ?? null,
  };
}

/**
 * Looks up the payer of an order. Capture webhook events don't include the
 * payer, but Neon needs their email to find or create the donor's account.
 */
export async function getPayPalOrderPayer(
  orderId: string,
): Promise<{ email: string | null; name: string | null }> {
  const token = await getAccessToken();

  const res = await fetch(
    `${PAYPAL_API_BASE}/v2/checkout/orders/${encodeURIComponent(orderId)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) throw new Error(`PayPal order lookup failed: ${res.status}`);

  const data = (await res.json()) as {
    payer?: {
      email_address?: string;
      name?: { given_name?: string; surname?: string };
    };
  };

  return {
    email: data.payer?.email_address ?? null,
    name: data.payer?.name
      ? [data.payer.name.given_name, data.payer.name.surname]
          .filter(Boolean)
          .join(" ")
      : null,
  };
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

  let webhookEvent: unknown;
  try {
    webhookEvent = JSON.parse(rawBody);
  } catch {
    return false;
  }

  const token = await getAccessToken();

  const res = await fetch(
    `${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`,
    {
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
    },
  );

  if (!res.ok) return false;
  const data = (await res.json()) as { verification_status: string };
  return data.verification_status === "SUCCESS";
}
