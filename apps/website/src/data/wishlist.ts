import { z } from "zod";

// Chip-in donations toward items that allow partial donations
export const PARTIAL_DONATION_MIN_CENTS = 500;
export const PARTIAL_DONATION_QUICK_PICKS = [10, 25, 50];

export const WISHLIST_FUNDS_NOTE =
  "Donations support Alveus's wishlist. If an item is no longer needed, funds go to other needs.";

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

/** Parses a display price like "$29.99" into whole cents. Returns null if unparseable. */
export function parsePriceCents(price: string | null): number | null {
  if (!price) return null;
  const n = parseFloat(price.replace(/[^0-9.]/g, ""));
  return isNaN(n) || n <= 0 ? null : Math.round(n * 100);
}

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
