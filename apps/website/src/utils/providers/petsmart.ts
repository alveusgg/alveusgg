/**
 * apps/website/src/utils/providers/petsmart.ts
 *
 * PetSmart-specific provider.
 * PetSmart serves good OG tags. JSON-LD is present but inconsistently formatted.
 */

import type { ProductProvider, ProductMeta } from "./types";
import { EMPTY_META } from "./types";
import { parseHtml, extractOgMeta } from "./openGraph";
import { fetchHtml } from "./generic";

export class PetSmartProvider implements ProductProvider {
  name = "PetSmart";

  canHandle(url: string): boolean {
    return /petsmart\.com/i.test(url);
  }

  async fetch(url: string, html?: string): Promise<ProductMeta> {
    try {
      const pageHtml = html ?? (await fetchHtml(url));
      if (!pageHtml) return { ...EMPTY_META, siteName: "PetSmart" };

      const meta = parseHtml(pageHtml, url);

      // PetSmart often puts price in a specific meta tag
      const explicitPrice =
        extractOgMeta(pageHtml, "product:price:amount") ??
        pageHtml.match(/itemprop="price"[^>]+content="([\d.]+)"/)?.[1];

      return {
        ...meta,
        price: explicitPrice ? `$${parseFloat(explicitPrice).toFixed(2)}` : meta.price,
        siteName: "PetSmart",
        title: meta.title?.replace(/\s*[-|]\s*PetSmart\s*$/i, "").trim() ?? null,
      };
    } catch {
      return { ...EMPTY_META, siteName: "PetSmart" };
    }
  }
}
