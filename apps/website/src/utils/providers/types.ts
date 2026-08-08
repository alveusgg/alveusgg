/**
 * apps/website/src/utils/providers/types.ts
 *
 * Shared types for the provider architecture.
 * Each provider implements the ProductProvider interface.
 */

export interface ProductMeta {
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  price: string | null;
  currency: string | null;
  siteName: string | null;
  brand: string | null;
  availability: "in_stock" | "out_of_stock" | "unknown";
  /** Original URL, possibly cleaned of tracking params */
  canonicalUrl: string | null;
}

export interface ProductProvider {
  /** Human-readable name e.g. "Amazon", "Chewy" */
  name: string;
  /** Returns true if this provider handles the given URL */
  canHandle(url: string): boolean;
  /**
   * Fetch product metadata for the given URL.
   * Receives the raw HTML if already fetched (saves a round-trip for
   * providers that only need OpenGraph tags). Providers that need
   * JavaScript rendering (e.g. Amazon) will ignore html and use Playwright.
   */
  fetch(url: string, html?: string): Promise<ProductMeta>;
}

export const EMPTY_META: ProductMeta = {
  title: null,
  description: null,
  imageUrl: null,
  price: null,
  currency: null,
  siteName: null,
  brand: null,
  availability: "unknown",
  canonicalUrl: null,
};
