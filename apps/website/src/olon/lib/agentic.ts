/**
 * Agentic-web contract builders — mirrored 1:1 from the Olon platform's
 * `jsonpages-platform/src/lib/webmcpBuilders.ts` (itself a port of
 * `@olonjs/core/src/contract/webmcp-contracts.ts`).
 *
 * WHY a local copy instead of `@olonjs/core`'s `webmcp.*`: core@1.1.7's JSON-Schema serializer
 * walks zod-**3** internals (`._def.innerType`), but this tenant is on zod **4** (the pnpm
 * override resolves only zod 4), so core's builders crash on our schemas. The platform solved
 * the same problem by taking schemas **already as JSON Schema** (pass-through, no zod
 * introspection) — the tenant converts zod→JSON Schema (here, via zod 4's `z.toJSONSchema`).
 * This module is therefore PURE (no zod, no `@olonjs/core`) and emits the exact same contract
 * shapes agents expect whether they read the tenant-baked file or Olon's served blob.
 *
 * Pure data → safe to unit-test and to import from the bake. Not imported by any page.
 */

const WEBMCP_TOOL_REQUEST_TYPE = "olonjs:webmcp:tool-call";
const WEBMCP_TOOL_RESULT_TYPE = "olonjs:webmcp:tool-result";

interface FallbackSection {
  id: string;
  type: string;
  data: Record<string, unknown>;
  settings?: Record<string, unknown>;
}

type Section = FallbackSection;

interface PageMeta {
  title: string;
  description: string;
}

export interface PageConfig {
  id: string;
  slug: string;
  meta: PageMeta;
  sections: Section[];
  "global-header"?: boolean;
}

interface SiteIdentity {
  title: string;
  logoUrl?: string;
}

export interface SiteConfig {
  identity: SiteIdentity;
  header?: Section;
  footer?: Section | null;
}

/** JSON Schema maps keyed by section type (already converted from zod). Passed through verbatim. */
type SectionSchemaMap = Record<string, Record<string, unknown>>;

export interface WebMcpToolContract {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface WebMcpSectionInstance {
  id: string;
  type: string;
  scope: "global" | "local";
  label: string;
}

export interface OlonJsPageContract {
  version: "1.0.0";
  kind: "olonjs-page-contract";
  slug: string;
  title: string;
  description: string;
  manifestHref: string;
  systemPrompt: string;
  sectionTypes: string[];
  sectionInstances: WebMcpSectionInstance[];
  sectionSchemas: Record<string, Record<string, unknown>>;
  sectionSubmissionSchemas?: Record<string, Record<string, unknown>>;
  tools: WebMcpToolContract[];
}

export interface OlonJsPageManifest {
  version: "1.0.0";
  kind: "olonjs-page-mcp-manifest";
  generatedAt: string;
  slug: string;
  title: string;
  description: string;
  contractHref: string;
  transport: {
    kind: "window-message";
    requestType: string;
    resultType: string;
    target: "window";
  };
  capabilities: {
    resources: Array<{
      uri: string;
      name: string;
      mimeType: string;
      description: string;
    }>;
  };
  sectionTypes: string[];
  sectionInstances: WebMcpSectionInstance[];
  tools: Array<Pick<WebMcpToolContract, "name" | "description">>;
}

export interface OlonJsSiteManifestIndex {
  version: "1.0.0";
  kind: "olonjs-mcp-manifest-index";
  generatedAt: string;
  pages: Array<{
    slug: string;
    title: string;
    description: string;
    manifestHref: string;
    contractHref: string;
    sectionTypes: string[];
  }>;
}

export interface BuildPageContractInput {
  slug: string;
  pageConfig: PageConfig;
  siteConfig: SiteConfig;
  /** Section editable schemas (JSON Schema), keyed by section type. */
  schemas?: SectionSchemaMap;
  /** Form-capable section submission schemas (JSON Schema), keyed by section type. */
  submissionSchemas?: SectionSchemaMap;
}

export interface BuildSiteManifestInput {
  pages: Record<string, PageConfig>;
  siteConfig: SiteConfig;
  schemas?: SectionSchemaMap;
  submissionSchemas?: SectionSchemaMap;
}

function inferSectionLabel(section: { type?: string; data?: unknown }): string {
  const data =
    section.data && typeof section.data === "object"
      ? (section.data as Record<string, unknown>)
      : {};
  if (typeof data.title === "string" && data.title.trim()) return data.title.trim();
  if (typeof data.sectionTitle === "string" && data.sectionTitle.trim())
    return data.sectionTitle.trim();
  if (typeof data.label === "string" && data.label.trim()) return data.label.trim();
  return section.type ?? "section";
}

function getPageSections(pageConfig: PageConfig, siteConfig: SiteConfig) {
  const pageSections = Array.isArray(pageConfig?.sections) ? pageConfig.sections : [];
  const globalSections: Array<Section & { scope: "global" }> = [];
  if (siteConfig.header && pageConfig["global-header"] !== false) {
    globalSections.push({ ...siteConfig.header, scope: "global" });
  }
  if (siteConfig.footer) {
    globalSections.push({ ...siteConfig.footer, scope: "global" });
  }
  return [
    ...globalSections,
    ...pageSections.map((s) => ({ ...s, scope: "local" as const })),
  ];
}

/** Input schema for the `update-section` mutation tool. */
function buildMutationInputSchema(): Record<string, unknown> {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      slug: {
        type: "string",
        description: "Canonical page slug currently open in Studio.",
      },
      sectionId: {
        type: "string",
        description: "Concrete section instance id inside the current draft.",
      },
      sectionType: {
        type: "string",
        description:
          'Section type being updated (for example "hero" or "header"). Used to select the correct validation schema.',
      },
      scope: {
        type: "string",
        enum: ["local", "global"],
        default: "local",
      },
      data: {
        type: "object",
        description:
          "Full replacement payload validated against the schema declared for sectionType.",
      },
      itemPath: {
        type: "array",
        description: "Optional root-to-leaf selection path for targeted field mutation.",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            fieldKey: { type: "string" },
            itemId: { type: "string" },
          },
          required: ["fieldKey"],
        },
      },
      value: {
        description: "Value written to the final field targeted by itemPath.",
      },
      fieldKey: {
        type: "string",
        description: "Shorthand for a top-level scalar field update when itemPath is omitted.",
      },
    },
    required: ["sectionId"],
    oneOf: [
      { required: ["data"] },
      { required: ["itemPath", "value"] },
      { required: ["fieldKey", "value"] },
    ],
  };
}

/** update-section + save tools, emitted only when at least one section has a declared schema. */
function buildSectionTools(): WebMcpToolContract[] {
  return [
    {
      name: "update-section",
      description:
        "Update a section field in the Studio draft. Does not persist — call save when all updates are complete. Use sectionType to select the matching schema from sectionSchemas.",
      inputSchema: buildMutationInputSchema(),
    },
    {
      name: "save",
      description:
        "Persist all pending draft changes using the active save mode (local file, hot save, or save2repo). Call once after all update-section calls are complete.",
      inputSchema: { type: "object", additionalProperties: false, properties: {} },
    },
  ];
}

export function buildPageContractHref(slug: string): string {
  return `/schemas/${slug}.schema.json`;
}

export function buildPageManifestHref(slug: string): string {
  return `/mcp-manifests/${slug}.json`;
}

export function buildPageContract({
  slug,
  pageConfig,
  siteConfig,
  schemas,
  submissionSchemas,
}: BuildPageContractInput): OlonJsPageContract {
  const title = typeof pageConfig.meta?.title === "string" ? pageConfig.meta.title : slug;
  const description =
    typeof pageConfig.meta?.description === "string" ? pageConfig.meta.description : "";
  const pageSections = getPageSections(pageConfig, siteConfig);
  const sectionTypes = Array.from(
    new Set(pageSections.map((s) => String(s.type)).filter(Boolean)),
  );

  const sectionSchemas: Record<string, Record<string, unknown>> = {};
  for (const sectionType of sectionTypes) {
    const schema = schemas?.[sectionType];
    if (schema != null) sectionSchemas[sectionType] = schema;
  }

  const submissionSchemasEmitted: Record<string, Record<string, unknown>> = {};
  for (const sectionType of sectionTypes) {
    const schema = submissionSchemas?.[sectionType];
    if (schema != null) submissionSchemasEmitted[sectionType] = schema;
  }

  const sectionInstances: WebMcpSectionInstance[] = pageSections.map((s) => ({
    id: s.id,
    type: String(s.type),
    scope: s.scope === "global" ? "global" : "local",
    label: inferSectionLabel(s),
  }));

  const tools: WebMcpToolContract[] =
    sectionTypes.filter((sectionType) => sectionSchemas[sectionType] != null).length > 0
      ? buildSectionTools()
      : [];

  const contract: OlonJsPageContract = {
    version: "1.0.0",
    kind: "olonjs-page-contract",
    slug,
    title,
    description,
    manifestHref: buildPageManifestHref(slug),
    systemPrompt: `You are operating the "${title}" page in OlonJS Studio. Use only the declared tools and keep mutations valid against the section schema.`,
    sectionTypes,
    sectionInstances,
    sectionSchemas,
    tools,
  };

  if (Object.keys(submissionSchemasEmitted).length > 0) {
    contract.sectionSubmissionSchemas = submissionSchemasEmitted;
  }

  return contract;
}

export function buildPageManifest(input: BuildPageContractInput): OlonJsPageManifest {
  const contract = buildPageContract(input);
  return {
    version: "1.0.0",
    kind: "olonjs-page-mcp-manifest",
    generatedAt: new Date().toISOString(),
    slug: input.slug,
    title: contract.title,
    description: contract.description,
    contractHref: buildPageContractHref(input.slug),
    transport: {
      kind: "window-message",
      requestType: WEBMCP_TOOL_REQUEST_TYPE,
      resultType: WEBMCP_TOOL_RESULT_TYPE,
      target: "window",
    },
    capabilities: {
      resources: [
        {
          uri: `olon://pages/${input.slug}`,
          name: `${contract.title} Data`,
          mimeType: "application/json",
          description: `Structured content for the ${input.slug} page.`,
        },
        {
          uri: "olon://pages",
          name: "Site Map",
          mimeType: "application/json",
          description: "Structured content for the map of this site",
        },
      ],
    },
    sectionTypes: contract.sectionTypes,
    sectionInstances: contract.sectionInstances,
    tools: contract.tools.map(({ name, description }) => ({ name, description })),
  };
}

export function buildSiteManifest({
  pages,
  siteConfig,
  schemas,
  submissionSchemas,
}: BuildSiteManifestInput): OlonJsSiteManifestIndex {
  const pageEntries = Object.entries(pages ?? {}).sort(([a], [b]) => a.localeCompare(b));
  return {
    version: "1.0.0",
    kind: "olonjs-mcp-manifest-index",
    generatedAt: new Date().toISOString(),
    pages: pageEntries.map(([slug, pageConfig]) => {
      const manifest = buildPageManifest({
        slug,
        pageConfig,
        siteConfig,
        schemas,
        submissionSchemas,
      });
      return {
        slug,
        title: manifest.title,
        description: manifest.description,
        manifestHref: buildPageManifestHref(slug),
        contractHref: buildPageContractHref(slug),
        sectionTypes: manifest.sectionTypes,
      };
    }),
  };
}

export function buildLlmsTxt({
  pages,
  siteConfig,
  schemas,
  submissionSchemas,
}: BuildSiteManifestInput): string {
  const siteTitle = siteConfig.identity?.title || "OlonJS Site";
  const manifestIndex = buildSiteManifest({ pages, siteConfig, schemas, submissionSchemas });

  let markdown = `# ${siteTitle}\n\n`;

  const homePage = manifestIndex.pages.find((p) => p.slug === "home");
  if (homePage?.description) {
    markdown += `${homePage.description}\n\n`;
  }

  markdown +=
    "> **AI Agents:** This site is built with OlonJS. It exposes a native Model Context Protocol (MCP) manifest for direct structural interaction. \n";
  markdown +=
    "> To read the site map or access structured content, use the URI `olon://pages` or `olon://pages/[slug]`.\n";
  markdown += "> Endpoint: `/mcp-manifest.json`\n\n";
  markdown += "## Pages\n\n";

  for (const page of manifestIndex.pages) {
    const urlPath = page.slug === "home" ? "/" : `/${page.slug}`;
    markdown += `- **[${page.title}](${urlPath})** (\`${page.slug}\`)\n`;
    if (page.description) {
      markdown += `  ${page.description}\n`;
    }
    markdown += `  *Contract:* \`${page.contractHref}\` | *Manifest:* \`${page.manifestHref}\`\n\n`;
  }

  return markdown.trim();
}
