/**
 * apps/website/src/lib/neonCrm.ts
 *
 * Neon CRM REST API v2 integration.
 * Called after a successful PayPal capture to:
 *   1. Find or create a constituent (donor)
 *   2. Create a donation record linked to the wishlist item
 *
 * Docs: https://developer.neoncrm.com/api-v2/
 *
 * Required env vars:
 *   NEON_CRM_ORG_ID        – your Neon org ID (e.g. "alveussanctuary")
 *   NEON_CRM_API_KEY       – API key from Neon CRM admin → Integrations
 *   NEON_CRM_CAMPAIGN_ID   – optional, links donations to your wishlist campaign
 *   NEON_CRM_FUND_ID       – optional, accounting fund for wishlist donations
 */

const NEON_BASE = () =>
  `https://api.neoncrm.com/v2`;

function neonHeaders() {
  const creds = Buffer.from(
    `${process.env.NEON_CRM_ORG_ID}:${process.env.NEON_CRM_API_KEY}`
  ).toString("base64");
  return {
    Authorization: `Basic ${creds}`,
    "Content-Type": "application/json",
    "NEON-API-VERSION": "2.8",
  };
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NeonDonationOptions {
  /** PayPal transaction details */
  transactionId: string;
  amount: number;
  payerEmail: string | null;
  payerName: string | null;
  /** Which wishlist item this donation is for */
  wishlistItemId: string;
  wishlistItemTitle: string;
  /** ISO date string */
  donationDate: string;
}

interface NeonAccount {
  accountId: string;
  primaryContact: {
    email1: string;
    firstName: string;
    lastName: string;
  };
}

// ─── Find or create constituent ────────────────────────────────────────────────

async function findOrCreateAccount(
  email: string | null,
  name: string | null
): Promise<string | null> {
  if (!email) return null;

  const [firstName = "Anonymous", lastName = "Donor"] = (name ?? "").split(" ");

  // 1. Search for existing account by email
  const searchRes = await fetch(
    `${NEON_BASE()}/accounts/search`,
    {
      method: "POST",
      headers: neonHeaders(),
      body: JSON.stringify({
        searchFields: [
          { field: "Email", operator: "EQUAL", value: email },
        ],
        outputFields: ["Account ID", "First Name", "Last Name", "Email 1"],
        pagination: { currentPage: 0, pageSize: 1 },
      }),
    }
  );

  if (searchRes.ok) {
    const data = (await searchRes.json()) as {
      searchResults?: Array<{ "Account ID": string }>;
    };
    const existing = data.searchResults?.[0];
    if (existing?.["Account ID"]) {
      return existing["Account ID"];
    }
  }

  // 2. Create a new individual account
  const createRes = await fetch(`${NEON_BASE()}/accounts`, {
    method: "POST",
    headers: neonHeaders(),
    body: JSON.stringify({
      individualAccount: {
        primaryContact: {
          firstName,
          lastName,
          email1: email,
        },
        origin: {
          originDetail: "Alveus Wishlist Donation",
        },
      },
    }),
  });

  if (!createRes.ok) {
    console.error("Neon CRM: failed to create account", await createRes.text());
    return null;
  }

  const created = (await createRes.json()) as { accountId: string };
  return created.accountId ?? null;
}

// ─── Create donation record ────────────────────────────────────────────────────

export async function logDonationToNeonCrm(
  opts: NeonDonationOptions
): Promise<{ success: boolean; donationId?: string; error?: string }> {
  try {
    const accountId = await findOrCreateAccount(opts.payerEmail, opts.payerName);

    const donation: Record<string, unknown> = {
      amount: opts.amount,
      date: opts.donationDate,
      source: "ONLINE",
      sendAcknowledgmentEmail: true,
      acknowledgmentEmailReplacementText:
        `Thank you for your donation to Alveus Sanctuary! Your contribution of $${opts.amount.toFixed(2)} goes toward: ${opts.wishlistItemTitle}. The animals appreciate your support!`,
      payments: [
        {
          amount: opts.amount,
          tenderType: "CREDIT_CARD",   // PayPal maps to CREDIT_CARD in Neon
          paymentStatus: "SUCCEEDED",
          note: `PayPal transaction: ${opts.transactionId}`,
        },
      ],
      // Custom fields — set these up in Neon CRM admin first
      customFieldDataList: [
        {
          fieldId: process.env.NEON_CRM_WISHLIST_ITEM_FIELD_ID ?? "wishlist_item",
          fieldValue: opts.wishlistItemTitle,
        },
        {
          fieldId: process.env.NEON_CRM_PAYPAL_TX_FIELD_ID ?? "paypal_transaction_id",
          fieldValue: opts.transactionId,
        },
      ],
    };

    // Link to campaign if configured
    if (process.env.NEON_CRM_CAMPAIGN_ID) {
      donation.campaign = { id: process.env.NEON_CRM_CAMPAIGN_ID };
    }
    if (process.env.NEON_CRM_FUND_ID) {
      donation.fund = { id: process.env.NEON_CRM_FUND_ID };
    }
    if (accountId) {
      donation.accountId = accountId;
    }

    const res = await fetch(`${NEON_BASE()}/donations`, {
      method: "POST",
      headers: neonHeaders(),
      body: JSON.stringify(donation),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Neon CRM donation creation failed:", err);
      return { success: false, error: err };
    }

    const created = (await res.json()) as { id: string };
    return { success: true, donationId: created.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Neon CRM error:", msg);
    return { success: false, error: msg };
  }
}
