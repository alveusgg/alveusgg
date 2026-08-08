/**
 * apps/website/src/utils/providers/openGraph.ts
 *
 * Generic OpenGraph + JSON-LD parser.
 * Used directly by the GenericProvider and as a helper by all other providers.
 * Phase 1: Generic OpenGraph/JSON-LD parser.
 */

import type { ProductMeta } from "./types";
import { EMPTY_META } from "./types";

// ─── OpenGraph ────────────────────────────────────────────────────────────────

export function extractOgMeta(html: string, property: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, "i"),
    new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["']`, "i"),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return m[1].trim();
  }
  return null;
}

export function extractTitle(html: string): string | null {
  return (
    extractOgMeta(html, "og:title") ??
    html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ??
    null
  );
}

export function resolveUrl(raw: string | null, baseUrl: string): string | null {
  if (!raw) return null;
  try { return new URL(raw, baseUrl).toString(); } catch { return null; }
}

// ─── JSON-LD ──────────────────────────────────────────────────────────────────

interface JsonLdProduct {
  "@type"?: string;
  name?: string;
  description?: string;
  image?: string | string[] | { url?: string };
  offers?: JsonLdOffer | JsonLdOffer[];
  brand?: { name?: string } | string;
}

interface JsonLdOffer {
  "@type"?: string;
  price?: string | number;
  priceCurrency?: string;
  availability?: string;
}

export function extractJsonLd(html: string): JsonLdProduct | null {
  const scriptRe = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;

  while ((match = scriptRe.exec(html)) !== null) {
    try {
      const raw = JSON.parse(match[1]!);
      const items: JsonLdProduct[] = Array.isArray(raw)
        ? raw
        : raw["@graph"]
        ? raw["@graph"]
        : [raw];

      const product = items.find(
        (i) => i["@type"] === "Product" || i["@type"] === "IndividualProduct"
      );
      if (product) return product;
    } catch {
      // malformed JSON-LD — skip
    }
  }
  return null;
}

export function jsonLdToPrice(ld: JsonLdProduct): { price: string | null; currency: string | null } {
  const offer = Array.isArray(ld.offers) ? ld.offers[0] : ld.offers;
  if (!offer) return { price: null, currency: null };

  const raw = offer.price;
  if (raw == null) return { price: null, currency: null };

  const num = typeof raw === "number" ? raw : parseFloat(String(raw).replace(/[^0-9.]/g, ""));
  const currency = offer.priceCurrency ?? "USD";

  return {
    price: isNaN(num) ? null : `$${num.toFixed(2)}`,
    currency,
  };
}

export function jsonLdToAvailability(ld: JsonLdProduct): ProductMeta["availability"] {
  const offer = Array.isArray(ld.offers) ? ld.offers[0] : ld.offers;
  const avail = offer?.availability ?? "";
  if (/InStock|in_stock/i.test(avail)) return "in_stock";
  if (/OutOfStock|out_of_stock/i.test(avail)) return "out_of_stock";
  return "unknown";
}

export function jsonLdToImage(ld: JsonLdProduct, baseUrl: string): string | null {
  const img = ld.image;
  if (!img) return null;
  if (typeof img === "string") return resolveUrl(img, baseUrl);
  if (Array.isArray(img)) return resolveUrl(img[0] ?? null, baseUrl);
  if (typeof img === "object" && "url" in img) return resolveUrl(img.url ?? null, baseUrl);
  return null;
}

// ─── Generic full parse ───────────────────────────────────────────────────────

/** Parse all the OpenGraph + JSON-LD data we can from an HTML string. */
export function parseHtml(html: string, url: string): ProductMeta {
  const ld = extractJsonLd(html);
  const { price: ldPrice, currency } = ld ? jsonLdToPrice(ld) : { price: null, currency: null };

  const imageRaw =
    extractOgMeta(html, "og:image") ??
    extractOgMeta(html, "twitter:image") ??
    extractOgMeta(html, "og:image:secure_url");

  const brand = ld?.brand
    ? typeof ld.brand === "string"
      ? ld.brand
      : (ld.brand.name ?? null)
    : null;

  return {
    title:
      (ld?.name ?? extractTitle(html))?.trim() ?? null,
    description:
      extractOgMeta(html, "og:description") ??
      extractOgMeta(html, "description") ??
      (typeof ld?.description === "string" ? ld.description : null),
    imageUrl:
      (ld ? jsonLdToImage(ld, url) : null) ??
      resolveUrl(imageRaw, url),
    price:
      ldPrice ??
      extractOgMeta(html, "product:price:amount")?.replace(/^/, "$"),
    currency: currency ?? extractOgMeta(html, "product:price:currency"),
    siteName:
      extractOgMeta(html, "og:site_name") ??
      new URL(url).hostname.replace(/^www\./, ""),
    brand,
    availability: ld ? jsonLdToAvailability(ld) : "unknown",
    canonicalUrl:
      extractOgMeta(html, "og:url") ??
      html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1] ??
      null,
  };
}
