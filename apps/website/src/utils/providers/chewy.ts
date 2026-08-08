/**
 * apps/website/src/utils/providers/chewy.ts
 *
 * Chewy-specific provider.
 * Chewy exposes good JSON-LD Product data and OG tags — no JS rendering needed.
 * We just layer on top of the generic parser with Chewy-specific cleanup.
 */

import type { ProductProvider, ProductMeta } from "./types";
import { EMPTY_META } from "./types";
import { parseHtml } from "./openGraph";
import { fetchHtml } from "./generic";

export class ChewyProvider implements ProductProvider {
  name = "Chewy";

  canHandle(url: string): boolean {
    return /chewy\.com/i.test(url);
  }

  async fetch(url: string, html?: string): Promise<ProductMeta> {
    try {
      const pageHtml = html ?? (await fetchHtml(url));
      if (!pageHtml) return { ...EMPTY_META, siteName: "chewy.com" };

      const meta = parseHtml(pageHtml, url);

      // Chewy's OG image URLs sometimes have low-res query params — strip them
      const imageUrl = meta.imageUrl?.replace(/\?.*$/, "") ?? null;

      // Chewy's og:title often includes " | Chewy" suffix — strip it
      const title = meta.title?.replace(/\s*\|\s*Chewy\s*$/i, "").trim() ?? null;

      return { ...meta, title, imageUrl, siteName: "Chewy" };
    } catch {
      return { ...EMPTY_META, siteName: "Chewy" };
    }
  }
}
