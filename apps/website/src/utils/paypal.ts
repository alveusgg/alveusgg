/**
 * apps/website/src/lib/paypal.ts
 *
 * PayPal Orders API v2 integration for wishlist item donations.
 * Uses PayPal's server-side SDK pattern — no new npm packages needed,
 * just fetch calls to PayPal's REST API.
 */

const PAYPAL_BASE =
  process.env.PAYPAL_ENV === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

// ─── Token cache (in-memory, reused across requests) ─────────────────────────

let _token: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (_token && Date.now() < _token.expiresAt - 60_000) return _token.value;

  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) throw new Error(`PayPal auth failed: ${res.status}`);

  const data = (await res.json()) as { access_token: string; expires_in: number };
  _token = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return _token.value;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CreateOrderOptions {
  wishlistItemId: string;
  wishlistItemTitle: string;
  amount: number; // in USD
  donorName?: string;
  donorEmail?: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface CaptureResult {
  orderId: string;
  status: string;
  amount: number;
  payerEmail: string | null;
  payerName: string | null;
  transactionId: string | null;
}

// ─── Create a PayPal order ────────────────────────────────────────────────────

export async function createPayPalOrder(opts: CreateOrderOptions): Promise<{
  orderId: string;
  approvalUrl: string;
}> {
  const token = await getAccessToken();

  const body = {
    intent: "CAPTURE",
    purchase_units: [
      {
        reference_id: opts.wishlistItemId,
        description: `Donation for Alveus Sanctuary wishlist item: ${opts.wishlistItemTitle}`,
        custom_id: opts.wishlistItemId,
        amount: {
          currency_code: "USD",
          value: opts.amount.toFixed(2),
        },
        payee: {
          // Your PayPal merchant email, set in env
          email_address: process.env.PAYPAL_MERCHANT_EMAIL,
        },
        soft_descriptor: "ALVEUS SANCTUARY",
      },
    ],
    payment_source: {
      paypal: {
        experience_context: {
          brand_name: "Alveus Sanctuary",
          locale: "en-US",
          landing_page: "BILLING",
          user_action: "PAY_NOW",
          return_url: opts.returnUrl,
          cancel_url: opts.cancelUrl,
        },
      },
    },
  };

  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": `alveus-${opts.wishlistItemId}-${Date.now()}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PayPal createOrder failed: ${err}`);
  }

  const data = (await res.json()) as {
    id: string;
    links: Array<{ rel: string; href: string }>;
  };

  const approvalLink = data.links.find((l) => l.rel === "payer-action");
  if (!approvalLink) throw new Error("No approval URL in PayPal response");

  return { orderId: data.id, approvalUrl: approvalLink.href };
}

// ─── Capture a PayPal order (called after payer approves) ─────────────────────

export async function capturePayPalOrder(orderId: string): Promise<CaptureResult> {
  const token = await getAccessToken();

  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PayPal capture failed: ${err}`);
  }

  const data = (await res.json()) as {
    status: string;
    purchase_units: Array<{
      reference_id: string;
      payments: {
        captures: Array<{
          id: string;
          amount: { value: string };
        }>;
      };
    }>;
    payer: {
      email_address?: string;
      name?: { given_name?: string; surname?: string };
    };
  };

  const capture = data.purchase_units[0]?.payments?.captures?.[0];

  return {
    orderId,
    status: data.status,
    amount: parseFloat(capture?.amount?.value ?? "0"),
    payerEmail: data.payer?.email_address ?? null,
    payerName: data.payer?.name
      ? `${data.payer.name.given_name ?? ""} ${data.payer.name.surname ?? ""}`.trim()
      : null,
    transactionId: capture?.id ?? null,
  };
}

// ─── Verify webhook signature ─────────────────────────────────────────────────

export async function verifyPayPalWebhook(
  headers: Record<string, string | string[] | undefined>,
  rawBody: string
): Promise<boolean> {
  const token = await getAccessToken();

  const verifyBody = {
    auth_algo: headers["paypal-auth-algo"],
    cert_url: headers["paypal-cert-url"],
    transmission_id: headers["paypal-transmission-id"],
    transmission_sig: headers["paypal-transmission-sig"],
    transmission_time: headers["paypal-transmission-time"],
    webhook_id: process.env.PAYPAL_WEBHOOK_ID,
    webhook_event: JSON.parse(rawBody),
  };

  const res = await fetch(
    `${PAYPAL_BASE}/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(verifyBody),
    }
  );

  if (!res.ok) return false;
  const result = (await res.json()) as { verification_status: string };
  return result.verification_status === "SUCCESS";
}
