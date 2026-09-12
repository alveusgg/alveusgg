/**
 * apps/website/src/utils/amazonCart.ts
 *
 * Builds a single Amazon "Add to Cart" URL containing every fully-funded Amazon item at once, so staff can click one link instead of buying each item individually.
 *
 * Format (Amazon's own documented cart-add endpoint):
 *   https://www.amazon.com/gp/aws/cart/add.html?ASIN.1=XXXX&Quantity.1=1&ASIN.2=YYYY&Quantity.2=2
 */

interface CartableItem {
  url: string | null;
  quantity: number;
  quantityFulfilled: number;
}

export function extractAsin(url: string): string | null {
  const patterns = [
    /\/dp\/([A-Z0-9]{10})/,
    /\/gp\/product\/([A-Z0-9]{10})/,
    /\/product\/([A-Z0-9]{10})/,
  ];
  for (const re of patterns) {
    const match = url.match(re);
    if (match?.[1]) return match[1];
  }
  return null;
}

export function buildAmazonCartUrl(items: CartableItem[]): string | null {
  const params: string[] = [];
  let index = 1;

  for (const item of items) {
    if (!item.url) continue;
    const asin = extractAsin(item.url);
    if (!asin) continue;

    const remaining = Math.max(1, item.quantity - item.quantityFulfilled);

    params.push(`ASIN.${index}=${asin}`);
    params.push(`Quantity.${index}=${remaining}`);
    index++;
  }

  if (params.length === 0) return null;

  return `https://www.amazon.com/gp/aws/cart/add.html?${params.join("&")}`;
}