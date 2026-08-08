/**
 * apps/website/src/utils/providers/amazon.ts
 *
 * Amazon provider — uses Playwright (headless Chromium) to fully render
 * the page before extracting data. This bypasses Amazon's bot detection
 * which blocks simple fetch() calls.
 *
 * Phase 2: Playwright service + Amazon provider.
 *
 * SETUP:
 *   npm install playwright
 *   npx playwright install chromium
 *
 * The playwrightFetch() function is also exported so other providers can
 * use it if they encounter JS-heavy pages.
 *
 * NOTE: Playwright adds ~170MB to your deployment. On Vercel/Netlify this
 * means you need either:
 *   a) A dedicated microservice (recommended for production)
 *   b) @sparticuz/chromium for serverless (works on Vercel, see below)
 *
 * For the alveusgg monorepo (self-hosted or Docker), standard Playwright works fine.
 */

import type { ProductProvider, ProductMeta } from "./types";
import { EMPTY_META } from "./types";
import { parseHtml, extractOgMeta } from "./openGraph";
import { extractAsin } from "../amazonCart";

// ─── Playwright fetch ─────────────────────────────────────────────────────────

let _browser: import("playwright").Browser | null = null;

async function getBrowser(): Promise<import("playwright").Browser> {
  if (_browser) return _browser;

  // Dynamic import so the module doesn't crash if playwright isn't installed
  const { chromium } = await import("playwright");

  _browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });

  return _browser;
}

export async function playwrightFetch(url: string, timeoutMs = 15_000): Promise<string | null> {
  try {
    const browser = await getBrowser();
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      locale: "en-US",
      extraHTTPHeaders: {
        "Accept-Language": "en-US,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    const page = await context.newPage();

    // Block images, fonts, and tracking scripts to speed up load
    await page.route("**/*", (route) => {
      const type = route.request().resourceType();
      if (["image", "font", "media"].includes(type)) {
        void route.abort();
      } else {
        void route.continue();
      }
    });

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: timeoutMs,
    });

    // Wait for Amazon's price element to appear (if it loads async)
    await page
      .waitForSelector(".a-price, #priceblock_ourprice, #priceblock_dealprice", {
        timeout: 5000,
      })
      .catch(() => {}); // It's OK if it doesn't appear — we'll try other methods

    const html = await page.content();
    await context.close();
    return html;
  } catch (err) {
    console.error("Playwright fetch failed:", err);
    return null;
  }
}

// ─── Amazon-specific extractors ───────────────────────────────────────────────

function extractAmazonPrice(html: string): string | null {
  const patterns = [
    // JSON-LD (most reliable)
    /"price"\s*:\s*"?([\d.]+)"?/,
    // Structured price span
    /class="a-offscreen"[^>]*>\s*\$([\d,.]+)/,
    // Deal price
    /id="priceblock_dealprice"[^>]*>\s*\$([\d,.]+)/,
    // Regular price
    /id="priceblock_ourprice"[^>]*>\s*\$([\d,.]+)/,
    // Price whole + fraction
    /class="a-price-whole"[^>]*>([\d,]+)<\/span><span[^>]+class="a-price-fraction"[^>]*>(\d+)/,
  ];

  for (const re of patterns) {
    const m = html.match(re);
    if (m) {
      if (m[2]) {
        // whole + fraction match
        return `$${m[1]!.replace(/,/g, "")}.${m[2]}`;
      }
      const num = parseFloat(m[1]!.replace(/,/g, ""));
      if (!isNaN(num)) return `$${num.toFixed(2)}`;
    }
  }
  return null;
}

function cleanAmazonTitle(title: string | null): string | null {
  if (!title) return null;
  return title
    .replace(/\s*:\s*Amazon\.com\s*:.*$/i, "")
    .replace(/\s*-\s*Amazon\.com\s*$/i, "")
    .replace(/Amazon\.com\s*:/i, "")
    .trim();
}

function extractAmazonImage(html: string): string | null {
  // Amazon stores image data in a JS variable
  const landingMatch = html.match(/"hiRes"\s*:\s*"(https:[^"]+)"/);
  if (landingMatch?.[1]) return landingMatch[1];

  const mainMatch = html.match(/"large"\s*:\s*"(https:[^"]+)"/);
  if (mainMatch?.[1]) return mainMatch[1];

  // Fall back to OG image
  return extractOgMeta(html, "og:image");
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export class AmazonProvider implements ProductProvider {
  name = "Amazon";

  canHandle(url: string): boolean {
    return /amazon\.(com|co\.uk|ca|com\.au|de|fr|co\.jp)/i.test(url);
  }

  async fetch(url: string): Promise<ProductMeta> {
    // Always use Playwright for Amazon — simple fetch() is reliably blocked
    const html = await playwrightFetch(url);
    if (!html) return { ...EMPTY_META, siteName: "Amazon" };

    // Start with the generic OG/JSON-LD parse as a base
    const base = parseHtml(html, url);

    // Then override with Amazon-specific extractors which are more accurate
    const price = extractAmazonPrice(html) ?? base.price;
    const imageUrl = extractAmazonImage(html) ?? base.imageUrl;
    const title = cleanAmazonTitle(base.title);

    // Build a clean canonical URL from the ASIN if we can extract it
    const asin = extractAsin(url);
    const canonicalUrl = asin
      ? `https://www.amazon.com/dp/${asin}`
      : base.canonicalUrl ?? url;

    return {
      ...base,
      title,
      price,
      imageUrl,
      canonicalUrl,
      siteName: "Amazon",
    };
  }
}
