export const PIXEL_PRICE = 100; // Each pixel costs $100 USD
export const DONATION_TOLERANCE = 5; // $5 USD wiggle room

export function determineNumberOfPixels(donationAmountDollars: number) {
  return Math.floor((donationAmountDollars + DONATION_TOLERANCE) / PIXEL_PRICE);
}

export async function hashPixelIdentifier(identifier: string) {
  return await crypto.subtle
    .digest("SHA-256", new TextEncoder().encode(identifier.toLowerCase()))
    .then((hash) =>
      Array.from(new Uint8Array(hash))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(""),
    );
}
