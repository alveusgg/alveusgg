import { describe, expect, it } from "vitest";

import {
  buildLlmsTxt,
  buildPageContract,
  buildPageContractHref,
  buildPageManifest,
  buildPageManifestHref,
  buildSiteManifest,
  type PageConfig,
  type SiteConfig,
} from "@/olon/lib/agentic";

const siteConfig: SiteConfig = { identity: { title: "Test Site" }, footer: null };

const page: PageConfig = {
  id: "home",
  slug: "home",
  meta: { title: "Home", description: "Home description" },
  sections: [
    { id: "hero", type: "hero", data: { heading: "Hi" } },
    { id: "h2h", type: "howToHelp", data: {} },
  ],
};

// hero has a (JSON Schema) schema; howToHelp deliberately does not → it must be excluded.
const schemas = {
  hero: { type: "object", properties: { heading: { type: "string" } } },
};

describe("agentic builders (mirrored from the Olon platform)", () => {
  it("emits the documented href scheme", () => {
    expect(buildPageContractHref("home")).toBe("/schemas/home.schema.json");
    expect(buildPageManifestHref("ambassadors/noodle")).toBe(
      "/mcp-manifests/ambassadors/noodle.json",
    );
  });

  it("buildPageContract emits only schema-bearing section types, with mutation tools", () => {
    const c = buildPageContract({ slug: "home", pageConfig: page, siteConfig, schemas });
    expect(c.kind).toBe("olonjs-page-contract");
    expect(c.slug).toBe("home");
    expect(c.title).toBe("Home");
    expect(c.sectionTypes).toEqual(["hero", "howToHelp"]);
    expect(Object.keys(c.sectionSchemas)).toEqual(["hero"]); // howToHelp has no schema
    expect(c.sectionInstances).toHaveLength(2);
    expect(c.tools.map((t) => t.name)).toEqual(["update-section", "save"]);
    expect(c.manifestHref).toBe("/mcp-manifests/home.json");
  });

  it("advertises no mutation surface when no section has a schema", () => {
    const c = buildPageContract({
      slug: "x",
      pageConfig: { ...page, sections: [{ id: "a", type: "unknownType", data: {} }] },
      siteConfig,
      schemas,
    });
    expect(c.tools).toEqual([]);
    expect(c.sectionSchemas).toEqual({});
  });

  it("buildPageManifest points back at the contract + exposes resources", () => {
    const m = buildPageManifest({ slug: "home", pageConfig: page, siteConfig, schemas });
    expect(m.kind).toBe("olonjs-page-mcp-manifest");
    expect(m.contractHref).toBe("/schemas/home.schema.json");
    expect(m.transport.kind).toBe("window-message");
    expect(m.capabilities.resources.length).toBeGreaterThan(0);
  });

  it("buildSiteManifest indexes pages sorted by slug", () => {
    const idx = buildSiteManifest({
      pages: {
        home: page,
        about: { ...page, slug: "about", meta: { title: "About", description: "" } },
      },
      siteConfig,
      schemas,
    });
    expect(idx.kind).toBe("olonjs-mcp-manifest-index");
    expect(idx.pages.map((p) => p.slug)).toEqual(["about", "home"]);
  });

  it("buildLlmsTxt lists pages with their contract + manifest hrefs", () => {
    const txt = buildLlmsTxt({ pages: { home: page }, siteConfig, schemas });
    expect(txt).toContain("# Test Site");
    expect(txt).toContain("/schemas/home.schema.json");
    expect(txt).toContain("/mcp-manifests/home.json");
  });
});
