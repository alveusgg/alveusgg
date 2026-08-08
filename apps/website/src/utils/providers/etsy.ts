/**
 * apps/website/src/utils/providers/etsy.ts
 * Etsy provider — good OG tags, no JS rendering needed.
 */

import type { ProductProvider, ProductMeta } from "./types";
import { EMPTY_META } from "./types";
import { parseHtml } from "./openGraph";
import { fetchHtml } from "./generic";

export class EtsyProvider implements ProductProvider {
  name = "Etsy";

  canHandle(url: string): boolean {
    return /etsy\.com/i.test(url);
  }

  async fetch(url: string, html?: string): Promise<ProductMeta> {
    try {
      const pageHtml = html ?? (await fetchHtml(url));
      if (!pageHtml) return { ...EMPTY_META, siteName: "Etsy" };

      const meta = parseHtml(pageHtml, url);
      return {
        ...meta,
        siteName: "Etsy",
        title: meta.title?.replace(/\s*[-|]\s*Etsy\s*$/i, "").trim() ?? null,
      };
    } catch {
      return { ...EMPTY_META, siteName: "Etsy" };
    }
  }
}
