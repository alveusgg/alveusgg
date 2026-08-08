/**
 * apps/website/src/utils/providers/generic.ts
 *
 * Fallback provider for any site not covered by a specific provider.
 * Uses only OpenGraph + JSON-LD — no JavaScript rendering.
 */

import type { ProductProvider, ProductMeta } from "./types";
import { EMPTY_META } from "./types";
import { parseHtml } from "./openGraph";

export class GenericProvider implements ProductProvider {
  name = "Generic";

  canHandle(_url: string): boolean {
    return true; // always the last fallback
  }

  async fetch(url: string, html?: string): Promise<ProductMeta> {
    try {
      const pageHtml = html ?? (await fetchHtml(url));
      if (!pageHtml) return { ...EMPTY_META, siteName: new URL(url).hostname.replace(/^www\./, "") };
      return parseHtml(pageHtml, url);
    } catch {
      return EMPTY_META;
    }
  }
}

export async function fetchHtml(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
      },
      redirect: "follow",
    });

    clearTimeout(timeout);
    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) return null;

    // Stream only the first 300 KB — enough to cover <head> on any page
    const reader = res.body?.getReader();
    if (!reader) return null;

    let html = "";
    let bytesRead = 0;

    while (bytesRead < 300_000) {
      const { done, value } = await reader.read();
      if (done) break;
      html += new TextDecoder().decode(value);
      bytesRead += value.byteLength;
      if (html.includes("</head>")) break;
    }
    reader.cancel();
    return html;
  } catch {
    return null;
  }
}
