/**
 * apps/website/src/utils/providers/walmart.ts
 * Walmart provider — uses OpenGraph, sometimes needs Playwright for price.
 * We try the fast path first and only fall back to Playwright if price is missing.
 */

import type { ProductProvider, ProductMeta } from "./types";
import { EMPTY_META } from "./types";
import { parseHtml } from "./openGraph";
import { fetchHtml } from "./generic";
import { playwrightFetch } from "./amazon"; // re-use the same Playwright helper

export class WalmartProvider implements ProductProvider {
  name = "Walmart";

  canHandle(url: string): boolean {
    return /walmart\.com/i.test(url);
  }

  async fetch(url: string, html?: string): Promise<ProductMeta> {
    try {
      // Try fast path first
      const fastHtml = html ?? (await fetchHtml(url));
      if (fastHtml) {
        const meta = parseHtml(fastHtml, url);
        if (meta.price) {
          return { ...meta, siteName: "Walmart" };
        }
      }

      // Price missing — try Playwright
      const fullHtml = await playwrightFetch(url);
      if (!fullHtml) return { ...EMPTY_META, siteName: "Walmart" };

      const meta = parseHtml(fullHtml, url);
      return { ...meta, siteName: "Walmart" };
    } catch {
      return { ...EMPTY_META, siteName: "Walmart" };
    }
  }
}
