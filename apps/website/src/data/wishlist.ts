// Chip-in donations toward items that allow partial donations
export const PARTIAL_DONATION_MIN_CENTS = 500;
export const PARTIAL_DONATION_QUICK_PICKS = [10, 25, 50];

export const WISHLIST_FUNDS_NOTE =
  "Alveus will do its best to purchase the item shown. If it’s unavailable or no longer needed, your donation will support the sanctuary’s general operations. Any amount raised above the item’s funding goal also supports general operations.";

// Partial-donation items stay in these statuses until their target is reached
export const DONATABLE_STATUSES = ["NEEDED", "PARTIALLY_FULFILLED"] as const;

export const DONATION_ORDER_STATUS_LABELS = {
  PENDING: "Pending",
  CAPTURED: "Captured",
  FAILED: "Failed",
  REFUNDED: "Refunded",
  DENIED: "Denied",
  REVERSED: "Reversed",
} as const;

export type DonationOrderStatus = keyof typeof DONATION_ORDER_STATUS_LABELS;

export const DONATION_ORDER_STATUSES = Object.keys(
  DONATION_ORDER_STATUS_LABELS,
) as [DonationOrderStatus, ...DonationOrderStatus[]];

export const PAYMENT_ISSUE_STATUSES = [
  "REFUNDED",
  "DENIED",
  "REVERSED",
] as const satisfies DonationOrderStatus[];
