/**
 * apps/website/src/utils/providers/petco.ts
 * Petco-specific provider — good OG + JSON-LD, no JS rendering needed.
 */

import type { ProductProvider, ProductMeta } from "./types";
import { EMPTY_META } from "./types";
import { parseHtml } from "./openGraph";
import { fetchHtml } from "./generic";

export class PetcoProvider implements ProductProvider {
  name = "Petco";

  canHandle(url: string): boolean {
    return /petco\.com/i.test(url);
  }

  async fetch(url: string, html?: string): Promise<ProductMeta> {
    try {
      const pageHtml = html ?? (await fetchHtml(url));
      if (!pageHtml) return { ...EMPTY_META, siteName: "Petco" };

      const meta = parseHtml(pageHtml, url);
      return {
        ...meta,
        siteName: "Petco",
        title: meta.title?.replace(/\s*[-|]\s*Petco\s*$/i, "").trim() ?? null,
      };
    } catch {
      return { ...EMPTY_META, siteName: "Petco" };
    }
  }
}
