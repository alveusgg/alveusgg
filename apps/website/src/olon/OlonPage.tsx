import Head from "next/head";

import {
  ConfigProvider,
  PageRenderer,
  StudioProvider,
  buildThemeVariableMap,
} from "@olonjs/core/runtime";
import type {
  JsonPagesConfig,
  MenuConfig,
  PageConfig,
  SiteConfig,
  ThemeConfig,
} from "@olonjs/core/runtime";

import menu from "@/data/config/menu.json";
import site from "@/data/config/site.json";
import theme from "@/data/config/theme.json";

import { ComponentRegistry } from "./lib/ComponentRegistry";
import { SECTION_SCHEMAS } from "./lib/schemas";

// Renders one OlonJS page (sections from the silo) inside the Alveus app shell.
// Theme published server-side (inline <style>); no engine/router, visitor mode.
// The tenant's typed ComponentRegistry/SECTION_SCHEMAS are cast to the engine's
// open contract at this single bootstrap boundary (JEB).
export function OlonPage({ page }: { page: PageConfig }) {
  const vars = buildThemeVariableMap(theme as unknown as ThemeConfig);
  const css = `:root{${Object.entries(vars)
    .map(([k, v]) => `${k}:${v}`)
    .join(";")}}`;

  return (
    <>
      <Head>
        {/* Agentic-web discovery: per-page MCP manifest + contract (seeded into public/ by
            build:agentic) so an agent can chain manifest → contract → section instances. */}
        <link rel="mcp-manifest" href={`/mcp-manifests/${page.slug}.json`} />
        <link rel="olon-contract" href={`/schemas/${page.slug}.schema.json`} />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <ConfigProvider
        config={{
          registry: ComponentRegistry as unknown as JsonPagesConfig["registry"],
          schemas: SECTION_SCHEMAS as unknown as JsonPagesConfig["schemas"],
          tenantId: "alveus",
        }}
      >
        <StudioProvider mode="visitor">
          <PageRenderer
            pageConfig={page}
            siteConfig={site as unknown as SiteConfig}
            menuConfig={menu as unknown as MenuConfig}
          />
        </StudioProvider>
      </ConfigProvider>
    </>
  );
}
