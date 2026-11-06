import {
  PAYPAL_TENDER_TYPE,
  createDonation,
  findOrCreateAccount,
  formatDateInTimezone,
} from "@alveusgg/neon-crm-api";

import { env } from "@/env";

import { DATETIME_ALVEUS_ZONE } from "@/utils/timezone";

// Neon CRM API access for logging donations, using the same variables as the
// donations worker. Local dev and CI run without them, so Neon is skipped.
export function getNeonCrmOptions() {
  if (!env.NEON_CRM_API_KEY) return null;

  return {
    baseUrl: env.NEON_CRM_BASE_URL,
    apiKey: env.NEON_CRM_API_KEY,
    organizationId: env.NEON_CRM_ORG_ID,
    localTimezone: DATETIME_ALVEUS_ZONE,
  };
}

const describeError = (result: { errorType: string; error: unknown }) =>
  `${result.errorType}: ${result.error instanceof Error ? result.error.message : String(result.error)}`;

export type WishlistNeonDonation = {
  captureId: string;
  amount: number;
  email: string | null;
  name: string | null;
  itemTitle: string;
};

/**
 * Logs a captured wishlist donation in Neon and returns the Neon donation id,
 * or null when Neon is skipped. Throws when Neon rejects the request.
 */
export async function logWishlistDonationToNeon(
  donation: WishlistNeonDonation,
) {
  const options = getNeonCrmOptions();
  if (!options) {
    console.warn(
      "Neon CRM is not configured (NEON_CRM_API_KEY), skipping wishlist donation log",
    );
    return null;
  }

  if (!donation.email) {
    console.warn(
      `No donor email for PayPal capture ${donation.captureId}, skipping Neon CRM log`,
    );
    return null;
  }

  const account = await findOrCreateAccount(options, {
    email: donation.email,
    name: donation.name,
  });
  if (!account.ok) {
    throw new Error(`Neon account lookup failed (${describeError(account)})`);
  }

  const created = await createDonation(options, {
    accountId: account.data.id,
    amount: donation.amount,
    date: formatDateInTimezone(new Date(), options.localTimezone),
    payments: [
      {
        amount: donation.amount,
        tenderType: PAYPAL_TENDER_TYPE,
        paymentStatus: "Succeeded",
        // The monthly PayPal import skips transactions with this capture ID
        note: `PayPal capture ID: ${donation.captureId} (Wishlist: ${donation.itemTitle})`,
      },
    ],
  });
  if (!created.ok) {
    throw new Error(
      `Neon donation creation failed (${describeError(created)})`,
    );
  }

  return created.data.id;
}
