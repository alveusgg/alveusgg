// No imports, so the website env schema can load this file in next.config

// The website logs wishlist donations under this campaign, and the donations
// worker skips them
export const WISHLIST_CAMPAIGN_ID = "24";

const CAMPAIGN_ID_PATTERN = /^[0-9]+$/;
// Matches the slug rule of the wishlist category create input
const CATEGORY_SLUG_PATTERN = /^[a-z0-9-]+$/;
const CATEGORY_SLUG_MAX_LENGTH = 100;

/**
 * Parses comma separated "campaignId:slug" pairs (e.g. "25:arri-wishlist")
 * into a map from category slug to Neon campaign ID.
 */
export function parseWishlistCampaignCategories(
  value: string | null | undefined,
): Map<string, string> {
  const campaigns = new Map<string, string>();

  for (const rawEntry of (value ?? "").split(",")) {
    const entry = rawEntry.trim();
    if (entry === "") continue;

    const separator = entry.indexOf(":");
    if (separator === -1) {
      throw new Error(
        `Invalid wishlist campaign entry "${entry}": expected "campaignId:slug"`,
      );
    }

    const campaignId = entry.slice(0, separator).trim();
    const slug = entry.slice(separator + 1).trim();

    if (!CAMPAIGN_ID_PATTERN.test(campaignId)) {
      throw new Error(
        `Invalid wishlist campaign entry "${entry}": campaign ID must be digits only`,
      );
    }
    if (
      !CATEGORY_SLUG_PATTERN.test(slug) ||
      slug.length > CATEGORY_SLUG_MAX_LENGTH
    ) {
      throw new Error(
        `Invalid wishlist campaign entry "${entry}": slug must be 1 to ${CATEGORY_SLUG_MAX_LENGTH} lowercase letters, digits or hyphens`,
      );
    }
    if (campaigns.has(slug)) {
      throw new Error(
        `Invalid wishlist campaign entry "${entry}": slug "${slug}" is mapped more than once`,
      );
    }

    campaigns.set(slug, campaignId);
  }

  return campaigns;
}

export function getWishlistCampaignId(
  categorySlug: string | null | undefined,
  campaigns: ReadonlyMap<string, string>,
): string {
  return (
    (categorySlug ? campaigns.get(categorySlug) : undefined) ??
    WISHLIST_CAMPAIGN_ID
  );
}
