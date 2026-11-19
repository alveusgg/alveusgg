import type { ParsedUrlQuery } from "node:querystring";

import { z } from "zod";

// Chip-in donations toward items that allow partial donations
export const PARTIAL_DONATION_MIN_CENTS = 500;
export const PARTIAL_DONATION_QUICK_PICKS = [10, 25, 50];

// Partial-donation items stay in these statuses until their target is reached
const DONATABLE_STATUSES = ["NEEDED", "PARTIALLY_FULFILLED"] as const;

export const DONATION_ORDER_STATUSES = [
  "PENDING",
  "CAPTURED",
  "FAILED",
  "REFUNDED",
  "DENIED",
  "REVERSED",
] as const;

export type DonationOrderStatus = (typeof DONATION_ORDER_STATUSES)[number];

export const PAYMENT_ISSUE_STATUSES = [
  "REFUNDED",
  "DENIED",
  "REVERSED",
] as const satisfies DonationOrderStatus[];

// The minimum drops to the remaining balance when less than the minimum is
// left, so the last few dollars can still be funded
export const partialDonationAmount = (remainingCents: number) => {
  const minCents = Math.min(PARTIAL_DONATION_MIN_CENTS, remainingCents);
  return z
    .number()
    .multipleOf(0.01, "Enter an amount in dollars and cents")
    .min(minCents / 100, `The minimum is $${(minCents / 100).toFixed(2)}`)
    .max(
      remainingCents / 100,
      `Only $${(remainingCents / 100).toFixed(2)} is left to raise`,
    );
};

// PayPal sends the donor back with the order ID as `token`. `itemId` is ours.
export function getPayPalReturnParams(query: ParsedUrlQuery) {
  const first = (value: string | string[] | undefined) =>
    (Array.isArray(value) ? value[0] : value) || undefined;
  return { orderId: first(query.token), itemId: first(query.itemId) };
}

export const canAcceptDonations = (status: string) =>
  (DONATABLE_STATUSES as readonly string[]).includes(status);

export function getWishlistArchiveConfirmation(raisedAmountCents: number) {
  if (raisedAmountCents === 0) {
    return "Archive this item? It will be hidden from the public wishlist.";
  }

  return `This item has received $${(raisedAmountCents / 100).toFixed(2)}. Archiving it closes the funding goal to new donations. Funds are assumed to go towards General Operations. Archive this item?`;
}

const PRICE_PATTERN = /^\$?(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{1,2}))?$/;

/** Parses a price like "24.99", "$24.99", "1,547" or "1,547.50" into cents, or null */
export function parsePriceCents(
  price: string | null | undefined,
): number | null {
  const match = price?.trim().match(PRICE_PATTERN);
  if (!match) return null;
  const [, whole = "", fraction = ""] = match;
  const cents =
    Number(whole.replaceAll(",", "")) * 100 + Number(fraction.padEnd(2, "0"));
  return cents > 0 && Number.isSafeInteger(cents) ? cents : null;
}

/** The form a parsed price is stored in, e.g. "1547.00" */
export const normalizePrice = (cents: number) => (cents / 100).toFixed(2);

const usd = (cents: number, fractionDigits: number) =>
  (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

/** "$1,547" for whole dollars, otherwise "$24.99" */
export const formatPrice = (cents: number) =>
  usd(cents, cents % 100 === 0 ? 0 : 2);

/** Always two decimals, e.g. "$1,547.00" */
export const formatPriceExact = (cents: number) => usd(cents, 2);

/** Target for items that allow partial donations, defaulting to the full price */
export function getPartialTargetCents(item: {
  goalAmountCents: number | null;
  price: string | null;
  quantity: number;
}) {
  if (item.goalAmountCents != null) return item.goalAmountCents;
  const priceCents = parsePriceCents(item.price);
  return priceCents ? priceCents * item.quantity : null;
}
