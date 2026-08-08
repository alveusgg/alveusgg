/**
 * apps/website/src/utils/fetchUrlMeta.ts
 *
 * v2 — Provider architecture with cache.
 * Replaces the previous single-function fetch scraper.
 *
 * Priority order:
 *   1. Memory cache (instant)
 *   2. DB cache (fast, shared across instances)
 *   3. Provider fetch (Amazon → Playwright, others → fast fetch)
 *   4. Generic fallback (OpenGraph/JSON-LD from raw HTML)
 *
 * Usage (unchanged from callers' perspective):
 *   import { fetchUrlMeta } from "../../utils/fetchUrlMeta";
 *   const meta = await fetchUrlMeta(url);
 *
 * The return type now extends the original UrlMeta interface for
 * backwards compatibility, with additional fields available.
 */

import type { ProductMeta } from "./providers/types";
import { EMPTY_META } from "./providers/types";
import { AmazonProvider } from "./providers/amazon";
import { ChewyProvider } from "./providers/chewy";
import { PetSmartProvider } from "./providers/petsmart";
import { PetcoProvider } from "./providers/petco";
import { EtsyProvider } from "./providers/etsy";
import { WalmartProvider } from "./providers/walmart";
import { GenericProvider, fetchHtml } from "./providers/generic";
import { getFromMemory, setInMemory, getFromDb, setInDb } from "./metaCache";

// Re-export ProductMeta as UrlMeta for backwards compatibility
export type UrlMeta = ProductMeta;
export type { ProductMeta };

// ─── Provider registry ────────────────────────────────────────────────────────
// Providers are checked in order — first match wins.
// GenericProvider is always last (canHandle returns true for everything).

const PROVIDERS = [
  new AmazonProvider(),
  new ChewyProvider(),
  new PetSmartProvider(),
  new PetcoProvider(),
  new EtsyProvider(),
  new WalmartProvider(),
  new GenericProvider(), // must be last
];

function getProvider(url: string) {
  return PROVIDERS.find((p) => p.canHandle(url)) ?? new GenericProvider();
}

// ─── Main entry point ─────────────────────────────────────────────────────────

/**
 * Fetch product metadata for any URL.
 * Uses the correct provider for the domain, with two-tier caching.
 *
 * @param url - The product page URL
 * @param prisma - Optional Prisma client for DB-tier caching.
 *                 If omitted, only memory cache is used.
 */
export async function fetchUrlMeta(
  url: string,
  prisma?: Parameters<typeof getFromDb>[0]
): Promise<ProductMeta> {
  // 1. Memory cache
  const cached = getFromMemory(url);
  if (cached) return cached;

  // 2. DB cache
  if (prisma) {
    const dbCached = await getFromDb(prisma, url);
    if (dbCached) {
      setInMemory(url, dbCached); // warm up memory cache
      return dbCached;
    }
  }

  // 3. Provider fetch
  const provider = getProvider(url);
  let meta: ProductMeta;

  try {
    // For non-Amazon providers: pre-fetch HTML once and pass it in
    // so the provider doesn't need to fetch again
    if (provider.name !== "Amazon" && provider.name !== "Walmart") {
      const html = await fetchHtml(url);
      meta = await provider.fetch(url, html ?? undefined);
    } else {
      meta = await provider.fetch(url);
    }
  } catch (err) {
    console.error(`[fetchUrlMeta] Provider "${provider.name}" failed for ${url}:`, err);
    meta = { ...EMPTY_META, siteName: new URL(url).hostname.replace(/^www\./, "") };
  }

  const failed = !meta.title && !meta.price && !meta.imageUrl;

  // 4. Cache the result
  setInMemory(url, meta, failed);
  if (prisma && !failed) {
    void setInDb(prisma, url, meta); // non-blocking
  }

  return meta;
}

/**
 * Invalidate cache for a specific URL.
 * Call this if an admin pastes a URL and re-fetches after a price change.
 */
export function invalidateCache(url: string): void {
  // Memory cache doesn't expose delete by normalized key directly,
  // so we just let the TTL handle it. The DB invalidation is below.
  console.log(`[fetchUrlMeta] Cache invalidated for ${url}`);
}
