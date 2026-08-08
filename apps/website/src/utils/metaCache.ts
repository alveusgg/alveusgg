/**
 * apps/website/src/utils/metaCache.ts
 *
 * Simple in-memory + database cache for fetched product metadata.
 * Phase 2: Cache layer.
 *
 * Two tiers:
 *   1. In-memory LRU (hot cache, survives within one server process)
 *   2. Database (persists across deploys, shared across server instances)
 *
 * TTL: 24 hours for successful fetches, 5 minutes for failures.
 */

import type { ProductMeta } from "./providers/types";

// ─── In-memory tier ───────────────────────────────────────────────────────────

const MAX_MEMORY_ENTRIES = 500;
const MEMORY_TTL_MS = 30 * 60 * 1000; // 30 minutes

interface CacheEntry {
  meta: ProductMeta;
  fetchedAt: number;
  failed: boolean;
}

const memoryCache = new Map<string, CacheEntry>();

function cacheKey(url: string): string {
  try {
    const u = new URL(url);
    // Normalize: remove tracking params, lowercase hostname
    ["utm_source", "utm_medium", "utm_campaign", "ref", "tag", "linkCode"].forEach((p) =>
      u.searchParams.delete(p)
    );
    return `${u.hostname.toLowerCase()}${u.pathname}${u.search}`;
  } catch {
    return url;
  }
}

function pruneMemoryCache(): void {
  if (memoryCache.size <= MAX_MEMORY_ENTRIES) return;
  // Delete oldest entry
  const oldest = [...memoryCache.entries()].sort((a, b) => a[1].fetchedAt - b[1].fetchedAt)[0];
  if (oldest) memoryCache.delete(oldest[0]);
}

export function getFromMemory(url: string): ProductMeta | null {
  const key = cacheKey(url);
  const entry = memoryCache.get(key);
  if (!entry) return null;

  const age = Date.now() - entry.fetchedAt;
  const ttl = entry.failed ? 5 * 60 * 1000 : MEMORY_TTL_MS;
  if (age > ttl) {
    memoryCache.delete(key);
    return null;
  }
  return entry.meta;
}

export function setInMemory(url: string, meta: ProductMeta, failed = false): void {
  pruneMemoryCache();
  memoryCache.set(cacheKey(url), { meta, fetchedAt: Date.now(), failed });
}

// ─── Database tier ────────────────────────────────────────────────────────────
// Uses the existing Prisma client. Add the WishlistMetaCache model to your schema.
// See the prisma schema addition at the bottom of this file.

const DB_TTL_HOURS = 24;

export async function getFromDb(
  prisma: { wishlistMetaCache: { findUnique: (args: unknown) => Promise<{ meta: string; fetchedAt: Date } | null> } },
  url: string
): Promise<ProductMeta | null> {
  try {
    const key = cacheKey(url);
    const row = await prisma.wishlistMetaCache.findUnique({ where: { urlKey: key } });
    if (!row) return null;

    const ageHours = (Date.now() - row.fetchedAt.getTime()) / 3_600_000;
    if (ageHours > DB_TTL_HOURS) return null;

    return JSON.parse(row.meta) as ProductMeta;
  } catch {
    return null;
  }
}

export async function setInDb(
  prisma: { wishlistMetaCache: { upsert: (args: unknown) => Promise<unknown> } },
  url: string,
  meta: ProductMeta
): Promise<void> {
  try {
    const key = cacheKey(url);
    await prisma.wishlistMetaCache.upsert({
      where: { urlKey: key },
      update: { meta: JSON.stringify(meta), fetchedAt: new Date() },
      create: { urlKey: key, originalUrl: url, meta: JSON.stringify(meta), fetchedAt: new Date() },
    });
  } catch (err) {
    console.error("Meta cache DB write failed (non-fatal):", err);
  }
}

/*
 * ─── ADD TO PRISMA SCHEMA ────────────────────────────────────────────────────
 *
 * model WishlistMetaCache {
 *   id          String   @id @default(cuid())
 *   urlKey      String   @unique   // normalized URL (tracking params stripped)
 *   originalUrl String   @db.Text  // the original URL as pasted by admin
 *   meta        String   @db.Text  // JSON-serialized ProductMeta
 *   fetchedAt   DateTime @default(now())
 *   updatedAt   DateTime @updatedAt
 *
 *   @@index([fetchedAt])
 *   @@map("wishlist_meta_cache")
 * }
 */
