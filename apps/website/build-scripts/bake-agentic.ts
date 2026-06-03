/**
 * Seed the PUBLIC agentic-web artifacts from the silo (runs in `pnpm build` as `build:agentic`).
 *
 * Pipeline: tenant zod 4 section schemas → `z.toJSONSchema()` → JSON Schema map → the pure
 * builders in `src/olon/lib/agentic.ts` (mirrored 1:1 from the Olon platform) → artifacts.
 * (We convert zod→JSON Schema here because core@1.1.7's builder is zod-3-only; see agentic.ts.)
 *
 * Emits, under `public/`, at the paths the builders embed as hrefs (so an agent can chain
 * manifest → contract → instance):
 *   - public/schemas/<slug>.schema.json   (page contract; contractHref `/schemas/...`)
 *   - public/mcp-manifests/<slug>.json      (page manifest; manifestHref `/mcp-manifests/...`)
 *   - public/pages/<slug>.json              (raw page instance, for readResource)
 *   - public/mcp-manifest.json              (site discovery index)
 *   - public/llms.txt
 *
 * Content-only: schemas are the tenant zod registry; this never changes a schema.
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { z } from "zod";

// Section schemas imported from each capsule's `schema.ts` DIRECTLY (zod only) — NOT the barrel
// index, which re-exports the View → @alveusgg/data images that Node/tsx can't load.
import { ambassadorProfileSchema } from "../src/olon/components/ambassadorProfile/schema";
import { ambassadorsCarouselSchema } from "../src/olon/components/ambassadorsCarousel/schema";
import { ambassadorsIndexSchema } from "../src/olon/components/ambassadorsIndex/schema";
import { animalQuestTeaserSchema } from "../src/olon/components/animalQuestTeaser/schema";
import { heroSchema } from "../src/olon/components/hero/schema";
import { howToHelpSchema } from "../src/olon/components/howToHelp/schema";
import { merchSchema } from "../src/olon/components/merch/schema";
import { recentVideosSchema } from "../src/olon/components/recentVideos/schema";
import { whatIsAlveusSchema } from "../src/olon/components/whatIsAlveus/schema";

import {
  buildLlmsTxt,
  buildPageContract,
  buildPageContractHref,
  buildPageManifest,
  buildPageManifestHref,
  buildSiteManifest,
  type PageConfig,
  type SiteConfig,
} from "../src/olon/lib/agentic";

const PAGES_DIR = "src/data/pages";
const CONFIG_DIR = "src/data/config";
const PUBLIC_DIR = "public";

// Olon mode only. The artifacts describe the OlonJS section structure, which is the live render
// ONLY when NEXT_PUBLIC_OLON_PILOT is on. Skip on the classic (flag-off) build so it stays clean
// (no spurious agentic files advertising a structure the classic pages don't expose).
if (process.env.NEXT_PUBLIC_OLON_PILOT !== "true") {
  console.log("[bake-agentic] NEXT_PUBLIC_OLON_PILOT is not 'true' — skipping (classic build).");
  process.exit(0);
}

// zod registry → JSON Schema map (the section editable contracts the builders pass through).
const SECTION_SCHEMAS: Record<string, z.ZodType> = {
  hero: heroSchema,
  whatIsAlveus: whatIsAlveusSchema,
  ambassadorsCarousel: ambassadorsCarouselSchema,
  animalQuestTeaser: animalQuestTeaserSchema,
  merch: merchSchema,
  recentVideos: recentVideosSchema,
  howToHelp: howToHelpSchema,
  ambassadorsIndex: ambassadorsIndexSchema,
  ambassadorProfile: ambassadorProfileSchema,
};

const schemas: Record<string, Record<string, unknown>> = {};
for (const [type, schema] of Object.entries(SECTION_SCHEMAS)) {
  schemas[type] = z.toJSONSchema(schema) as Record<string, unknown>;
}

const readJson = (p: string): unknown => JSON.parse(readFileSync(p, "utf8"));

function writeJson(relUnderPublic: string, value: unknown): void {
  const target = path.join(PUBLIC_DIR, relUnderPublic);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function discoverSlugs(): string[] {
  const slugs: string[] = [];
  for (const f of readdirSync(PAGES_DIR, { withFileTypes: true })) {
    if (f.isFile() && f.name.endsWith(".json")) slugs.push(f.name.replace(/\.json$/, ""));
  }
  for (const f of readdirSync(path.join(PAGES_DIR, "ambassadors"), { withFileTypes: true })) {
    if (f.isFile() && f.name.endsWith(".json")) {
      slugs.push(`ambassadors/${f.name.replace(/\.json$/, "")}`);
    }
  }
  return [...new Set(slugs)].sort();
}

const slugs = discoverSlugs();
const pages: Record<string, PageConfig> = {};
for (const slug of slugs) {
  pages[slug] = readJson(path.join(PAGES_DIR, `${slug}.json`)) as PageConfig;
}
const siteConfig = readJson(path.join(CONFIG_DIR, "site.json")) as SiteConfig;

for (const [slug, pageConfig] of Object.entries(pages)) {
  writeJson(
    buildPageContractHref(slug).replace(/^\//, ""),
    buildPageContract({ slug, pageConfig, siteConfig, schemas }),
  );
  writeJson(
    buildPageManifestHref(slug).replace(/^\//, ""),
    buildPageManifest({ slug, pageConfig, siteConfig, schemas }),
  );
  writeJson(`pages/${slug}.json`, pageConfig);
}

writeJson("mcp-manifest.json", buildSiteManifest({ pages, siteConfig, schemas }));

mkdirSync(PUBLIC_DIR, { recursive: true });
writeFileSync(
  path.join(PUBLIC_DIR, "llms.txt"),
  `${buildLlmsTxt({ pages, siteConfig, schemas })}\n`,
  "utf8",
);

console.log(
  `[bake-agentic] ${slugs.length} pages → public/{schemas,mcp-manifests,pages}/*, mcp-manifest.json, llms.txt`,
);
