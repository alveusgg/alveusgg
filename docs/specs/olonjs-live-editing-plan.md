# Implementation Plan: OlonJS Live Editing on Alveus (tenant side)

Phase 2 **PLAN** of [the spec](./olonjs-live-editing-spec.md). Gated: human reviews before
IMPLEMENT. Scope = the **Alveus repo only** (render/read + discovery); editing is Olon's.

## Overview

Make the OlonJS pages **read the silo from git at runtime** (not `import`) and **advertise
their agentic contracts**, behind the existing `NEXT_PUBLIC_OLON_PILOT` flag, so an edit to
a silo JSON in git is reflected by the deployed page in ~10 s **with no rebuild and no DB**.
Primary deliverable = the **local** wow (in `next dev`, editing a silo JSON updates the page
on refresh, no restart); the deployed proof is Vercel-only and out of this repo's scope.

## Architecture Decisions (from the approved spec)

- **One flag** (`NEXT_PUBLIC_OLON_PILOT`): off = classic pages; on = silo render + runtime
  read + agentic + editable. Read **source** is env (FS local / **public** git on deploy) —
  not a flag.
- **No write logic here.** Olon's MCP endpoint commits content + regenerates manifests via
  its GitHub App. This repo only **renders, reads, and advertises**.
- **Artifacts are PUBLIC and seeded by `prebuild`.** No auth to read them; the Alveus repo
  is public. Head `<link>`s point at the public artifacts; reads pin to the commit **SHA**.
- **Content-only:** zod stays code; editing never touches a schema/contract.

## Dependency graph

```
Task 0 (verify webmcp API, read-only)         Task 1 (env config)
                                                   │
                                                   ▼
                                          Task 2 (loadSilo runtime read)
                                                   │
                                   ┌───────────────┼───────────────┐
                                   ▼               ▼               ▼
                            Task 3a (home)   Task 3b (ambassadors)  Task 4 (/api/revalidate)
                                   └───────────────┬───────────────┘
                                                   ▼
                                      Task 5 (agentic artifacts, prebuild)  ← needs Task 0
                                                   ▼
                                      Task 6 (head <link> discovery)
```

---

## Phase 0 — De-risk (read-only, fail fast)

### Task 0: Confirm the `@olonjs/core` webmcp builder API
**Description:** Read the `@olonjs/core` `webmcp` types/dist to confirm the exact signatures
and inputs of `buildPageContract` / `buildSiteManifest` / `buildLlmsTxt` for a Next tenant
(in the Vite bake they were fed a `webMcpBuildState` from the SSR render — confirm what they
need: pageConfig, schemas as JSON-Schema vs zod, siteConfig).
**Acceptance:**
- [ ] Documented: each builder's input shape + how schemas are passed (and whether zod→JSON
      Schema conversion is needed on our side).
**Verification:** notes added to this plan / Task 5; no code.
**Dependencies:** None. **Files:** none (read-only). **Scope:** XS. **Risk:** de-risks Task 5.

#### Task 0 — Findings (recorded, `@olonjs/core@1.1.7`)

Source: `node_modules/@olonjs/core/dist/index.d.ts` + the reference `bake.mjs`
(`/home/dev/npm-jpcore/apps/tenant-alpha/scripts/bake.mjs`).

**Import (build script, like the bake):** `import { webmcp } from "@olonjs/core";` then
destructure `{ buildPageContract, buildPageManifest, buildPageManifestHref,
buildPageContractHref, buildSiteManifest, buildLlmsTxt }`. (The full builders live on the
`@olonjs/core` main entry, namespaces `webmcp`/`contract`; `@olonjs/core/runtime` only
re-exports the `*Href` helpers + `syncWebMcpJsonLd`.)

**Builder signatures + input shapes:**
- `buildPageContract({ slug, pageConfig, schemas, submissionSchemas?, siteConfig }) → OlonJsPageContract`
- `buildPageManifest(BuildPageContractInput) → OlonJsPageManifest`  *(same input as the contract)*
- `buildSiteManifest({ pages, schemas, submissionSchemas?, siteConfig }) → OlonJsSiteManifestIndex`
- `buildLlmsTxt(BuildSiteManifestInput) → string`  *(same input as the site manifest)*
- `buildPageManifestHref(slug) → string`, `buildPageContractHref(slug) → string`

  where `BuildPageContractInput = { slug: string; pageConfig: PageConfig; schemas:
  JsonPagesConfig["schemas"]; submissionSchemas?; siteConfig: SiteConfig }` and
  `BuildSiteManifestInput = { pages: Record<string, PageConfig>; schemas; submissionSchemas?;
  siteConfig: SiteConfig }`.

**KEY ANSWER — how `schemas` is passed (de-risks Task 5):** `JsonPagesConfig["schemas"]` is
`Record<string, { parse: (v: unknown) => unknown; shape?: Record<string, unknown> }>` — i.e.
the **duck-typed zod registry**. The `.d.ts` is explicit: *"tenants pass `z.object(...)`
instances; the JSON Schema serializer casts to `z.ZodTypeAny` at its own boundary."* →
**We pass our existing `SECTION_SCHEMAS` zod registry directly; core converts zod→JSON Schema
internally. No `z.toJSONSchema` on our side.** (The earlier zod-4 lossiness worry is moot —
conversion is core's, against the zod we already feed `ConfigProvider`.)

**No SSR `webMcpBuildState` in our Next tenant:** the Vite bake got `{ pages, schemas,
submissionSchemas, siteConfig }` from `getWebMcpBuildState()` during SSR. We have no SSR
render step — Task 5 assembles the same struct directly: `pages` = all silo page JSON keyed
by slug, `schemas` = `SECTION_SCHEMAS`, `siteConfig` = `site.json`. `submissionSchemas` =
none (omit; optional).

**Outputs (for Task 5/6):** `OlonJsPageContract` = `{ version:"1.0.0", kind, slug, title,
description, manifestHref, systemPrompt, sectionTypes:string[], sectionInstances,
sectionSchemas: Record<string,Record<string,unknown>> (JSON Schema), sectionSubmissionSchemas? }`;
`OlonJsSiteManifestIndex` = `{ version, kind:"olonjs-mcp-manifest-index", generatedAt, pages:
[{slug,title,description,manifestHref,contractHref,sectionTypes}] }`; `buildLlmsTxt` → a
string. **Note:** manifests carry `generatedAt` (a timestamp) → output is not byte-stable
across runs; fine for a `prebuild` artifact, but don't snapshot-test that field verbatim.

---

## Phase 1 — Runtime silo read (keystone = the local wow)

### Task 1: Env config for the Olon read mode
**Description:** Add the read/config env to `@/env` (t3-env): `OLON_GIT_OWNER`, `OLON_GIT_REPO`,
`OLON_GIT_REF` (default to the demo branch), `OLON_REVALIDATE_SECRET`, `OLON_LICENSE_KEY`
(optional). All optional with safe defaults so the app boots with them unset.
**Acceptance:**
- [ ] Vars defined + validated in `@/env`; unset → no crash; `NEXT_PUBLIC_OLON_PILOT` unchanged.
**Verification:** `pnpm types` + `pnpm lint` green; `pnpm dev` boots with vars unset.
**Dependencies:** None. **Files:** `src/env/index.js` (+ schema), `.env.example`. **Scope:** XS.

### Task 2: `loadSilo` runtime read abstraction
**Description:** New `src/olon/lib/silo-source.ts`: `loadSiloPage(slug)` / `loadSiloConfig(name)`.
On deploy (`OLON_GIT_REPO` set) → fetch from **public** GitHub raw/API `@ ref/SHA` (no token);
locally → `fs.readFile` at runtime (NOT `import`). Returns typed silo JSON. Pure, mockable.
**Acceptance:**
- [ ] `loadSiloPage("home")` returns the same shape as today's `import`; source picked by env; no token.
**Verification:** vitest unit (FS path returns file content; git path builds the right raw URL @ ref; fetch mocked). `pnpm types`.
**Dependencies:** Task 1. **Files:** `src/olon/lib/silo-source.ts`, `tests/olon/silo-source.test.ts`. **Scope:** S.

### Task 3a: Home reads the silo at runtime
**Description:** Move the home silo from the top-level `import` to **`getStaticProps`** via
`loadSiloPage("home")`, passed as a prop to `OlonHome`/`OlonPage`. Flag-off path untouched.
**Acceptance:**
- [ ] Flag-on home renders identically to today (content from runtime read).
- [ ] In `next dev`, editing `home.json` → refresh → updated **without restart/rebuild**.
- [ ] Flag-off = classic home, byte-identical.
**Verification:** `NEXT_PUBLIC_OLON_PILOT=true pnpm dev` → edit home.json → refresh shows it; `pnpm build/types/lint` green.
**Dependencies:** Task 2. **Files:** `src/olon/home.tsx`, `src/pages/index.tsx`. **Scope:** S.

### Task 3b: Ambassadors index + profiles read the silo at runtime
**Description:** Same move for `/ambassadors` (`ambassadors.json`) and the profile route
(`ambassadors/<slug>.json`): `getStaticProps` (+ existing `getStaticPaths`) read via `loadSilo`.
Editing existing pages' content only (new slugs → `fallback: 'blocking'` is a later concern).
**Acceptance:**
- [ ] Flag-on `/ambassadors` + a profile render identically; editing their silo JSON reflects on refresh, no restart.
- [ ] Flag-off identical.
**Verification:** dev edit test on `/ambassadors` + one profile; `pnpm build/types/lint` green.
**Dependencies:** Task 2. **Files:** `src/pages/ambassadors/index.tsx`, `src/pages/ambassadors/[ambassadorName].tsx`. **Scope:** M.

> **Implementation note (2026-06-03) — both index and profile converted (DONE).** The **profile
> route** inline `readFileSync` → `loadSiloPage`; it already had `getStaticProps`, so flag-off is
> unchanged. The **`/ambassadors` index** had **no `getStaticProps`** (auto-static `○ Static`);
> a Pages-Router runtime read requires one, which flips it to `●` SSG and adds an inert
> `"gsp":true` to the flag-off `__NEXT_DATA__`. **Decision (user, explicit): convert it** — the
> whole point is no-rebuild on deploy; that capability outranks an inert marker in the embedded
> JSON. The `gsp:true` is the accepted, functionally-inert flag-off delta (the rendered page /
> behavior is unchanged: same `AmbassadorsPage`, same data). Both pages now read via `getStaticProps`
> + `loadSiloPage`, gated so flag-off props stay minimal (`/ambassadors` → `{}`).

### Checkpoint A — Runtime read (the local wow)
- [x] Flag-on: editing any silo page JSON updates the page on refresh, **no restart/rebuild**.
      *Verified 2026-06-03 in `next dev`: edited `home.json` heading AND `ambassadors.json` heading
      → re-fetched the same server (no restart) → both changes served, then restored. All three
      routes (home, index, profile) read via `getStaticProps` + `loadSiloPage`.*
- [x] Flag-off: classic pages — no rendered/behavioral regression.
      *Flag-off build `__NEXT_DATA__`: `/` pageProps `["videos"]` (no `page` key); profile is the
      classic data-driven page; `/ambassadors` body unchanged (same `AmbassadorsPage`, `pageProps:{}`).
      The only flag-off delta is the **inert** `gsp:true` on `/ambassadors` (now `●` SSG) from adding
      `getStaticProps` — accepted (see Task 3b note); `/` 93,032 B & profile 62,365 B match baselines.*
      *Also: OlonJS render is loaded via `next/dynamic`, so the flag-off pages load **0** OlonJS
      chunks (build-manifest verified: `/`, `/ambassadors`, profile → `olonChunksLoaded: []`). The
      `@olonjs/core` code + its static config-JSON imports are no longer in the flag-off load path.*
- [x] `pnpm build` + `pnpm types` + `pnpm lint` green. **Review with human.**
      *Both `NEXT_PUBLIC_OLON_PILOT=false` and `=true` builds exit 0 (139/139 pages). types+lint
      green. vitest: 8/8 for `silo-source`. Flag-on prerender confirms runtime read at build:
      `/` pageProps `["videos","page"]`, `/ambassadors` `["olonPage"]`, profile `["olonPage"]`.*

**Decision resolved (user, 2026-06-03):** `/ambassadors` index **converted** to runtime read
(`getStaticProps` + `loadSiloPage`) — no-rebuild on deploy is the core goal and outranks the inert
flag-off `gsp:true` marker. All three pages (home, index, profiles) now read the silo at runtime.

---

## Phase 2 — Revalidation (the deploy trigger)

### Task 4: `/api/revalidate` endpoint
**Description:** `src/pages/api/revalidate.ts`: POST; verify `OLON_REVALIDATE_SECRET`; accept
`path` (+ optional SHA); call `res.revalidate(path)`. (No-op effect in dev — dev re-runs
anyway — but the handler + auth are real and unit-tested; this is the Vercel no-rebuild trigger.)
**Acceptance:**
- [x] Correct secret + valid path → 200 + revalidate called; bad/missing secret → 401; bad path → 400.
**Verification:** vitest unit (auth + path validation, `res.revalidate` mocked); `curl` locally returns 200/401 as expected.
**Dependencies:** Task 1. **Files:** `src/pages/api/revalidate.ts`, `tests/api/revalidate.test.ts`. **Scope:** S.

> **Done (2026-06-03).** POST-only; `OLON_REVALIDATE_SECRET` via `Bearer` + `timingSafeCompareString`
> (same as `/api/cron`); unset secret ⇒ disabled (401). Accepts `path` or `paths[]`, rejecting
> anything not starting with a single `/` (no URLs / protocol-relative) so the secret can't drive
> arbitrary revalidation. Calls `res.revalidate(p)`. 8 vitest cases (405/401/400/200/multi) green.
> **Known follow-up (not Task 4 scope):** the spec wants the runtime read *pinned to the commit SHA*;
> `res.revalidate()` re-runs `getStaticProps` against `OLON_GIT_REF` and can't receive the SHA, so
> `sha` is accepted but not yet threaded into the read. Options for later: read via the GitHub
> Contents API `@ sha`, or read raw `@ sha` — needs a channel from the revalidate call to the read.

### Checkpoint B — Revalidation
- [x] Endpoint secret-gated and unit-green. `pnpm types/lint` green. *(8/8 vitest; types+lint green.)*

---

## Phase 3 — Agentic discovery (contracts + manifests)

### Task 5: Agentic artifacts via `prebuild` *(highest risk)*
**Description:** `build-scripts/bake-agentic.ts` runs the `@olonjs/core` webmcp builders
(per Task 0) over the silo (pages + config + schemas) → writes the **public** artifacts into
the repo (`public/.olon/schemas/*.schema.json`, `public/.olon/mcp-manifest.json`,
`public/llms.txt`, `public/.olon/pages/*.json`). Hooked as a `prebuild` script. Schemas are
sourced from the zod registry (`SECTION_SCHEMAS`), converting via `z.toJSONSchema` if the
builders expect JSON Schema.
**Acceptance:**
- [x] emits a valid `mcp-manifest.json` + per-page `schema.json` + `llms.txt` (54 pages).
- [x] A sample page's contract reflects its section types; all artifacts parse as JSON.
**Verification:** ran the script → artifacts exist + parse; 6 vitest cases on the builders; `pnpm types`/`lint` green.
**Dependencies:** Task 0 (API), the silo. **Files:** `build-scripts/bake-agentic.ts`, `src/olon/lib/agentic.ts`, `package.json`. **Scope:** M. **Risk: HIGH** (webmcp API + zod→JSON-Schema fidelity).

> **Done (2026-06-03) — the HIGH risk materialized and was resolved.** `@olonjs/core@1.1.7`'s
> webmcp serializer walks zod-**3** internals (`._def.innerType`); this tenant has only zod **4**
> (pnpm override) → core's builders **crash** on our schemas. Resolution (user-approved): mirror
> the Olon platform's own zod-4-safe builders (`jsonpages-platform/src/lib/webmcpBuilders.ts`)
> into `src/olon/lib/agentic.ts` as **pure functions that take JSON Schema** (no zod, no
> `@olonjs/core`), and convert our zod-4 registry → JSON Schema in the bake via zod 4's native
> **`z.toJSONSchema()`**. 1:1 parity with what Olon serves. Deviations from the original task text:
> (a) wired as a **`build:agentic`** step in the build sequence (NOT a `prebuild` hook —
> `enable-pre-post-scripts` is unset, so the hook is unreliable); (b) **flag-gated** — skips on the
> classic (flag-off) build so it emits no spurious agentic files; (c) artifacts live at the
> builder's href paths under `public/` (`public/schemas/…`, `public/mcp-manifests/…`,
> `public/mcp-manifest.json`, `public/pages/…`, `public/llms.txt`) — **not** `/.olon/…` — so the
> hrefs embedded in the manifests/contracts resolve. Generated only by a flag-on build/bake; a
> fresh flag-off build has none. Local demo: `NEXT_PUBLIC_OLON_PILOT=true pnpm build:agentic`.

### Task 6: Head `<link>` discovery
**Description:** Inject `<link rel="mcp-manifest" href=...>` + `<link rel="olon-contract" href=...>`
into the flag-on pages' `<head>` (via `Meta`/`next/head`), pointing at the **public** artifacts.
Base URL is env-aware: local → `/.olon/...` (served from `public/`); deploy → the public
`raw.githubusercontent.com/<owner>/<repo>/<ref>/...` URL (always fresh @ ref, no rebuild).
**Acceptance:**
- [x] Each flag-on page `<head>` carries both `<link>`s with resolvable hrefs.
- [x] An agent (or `curl`) can chain **manifest → contract → page instance** — discoverable + readable.
**Verification:** prerendered `<head>` carries both links; head hrefs resolve to real `public/` files; contract embeds `sectionInstances`. `pnpm types/lint` green.
**Dependencies:** Task 5. **Files:** `src/olon/OlonPage.tsx`. **Scope:** S.

> **Done (2026-06-03).** Links injected via `next/head` inside the **dynamic** `OlonPage` (so they
> appear only flag-on and `@olonjs/core` stays out of the flag-off bundle). `rel="mcp-manifest"` →
> `/mcp-manifests/<slug>.json`, `rel="olon-contract"` → `/schemas/<slug>.schema.json` (the builder
> scheme, served from `public/`; same `rel`s as the reference `bake.mjs`). Verified in the
> prerendered HTML (`data-next-head` confirms `next/head` is collected even from a dynamically
> imported SSR component); flag-off heads carry neither link. Env-aware raw-GitHub base for the
> deploy is deferred (local serves from `public/`; same artifacts, same paths).

### Checkpoint C — Complete (local wow end-to-end)
- [x] All acceptance criteria met; flag-off zero-regression; `pnpm build/types/lint` green.
      *Both builds exit 0 (139/139). types+lint green. vitest 132/132 (incl. 8 silo-source, 8
      revalidate, 6 agentic). Flag-off: pages byte-identical, 0 OlonJS chunks loaded, no head
      links, no artifacts. Flag-on: silo read at runtime, head links present, artifacts + chain OK.*
- [x] Local demo: edit a silo JSON → page updates on refresh (no rebuild); the page advertises
      its manifest + contract; an agent can discover→read it.
      *Verified: `home.json` + `ambassadors.json` live-edits reflected in `next dev` with no
      restart. Artifacts (`NEXT_PUBLIC_OLON_PILOT=true pnpm build:agentic`) chain head → manifest
      → contract → section instances.* **Awaiting human review.**

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| `@olonjs/core` webmcp builder API differs from the Vite bake usage | High | **Task 0** confirms it read-only before Task 5 commits. |
| `z.toJSONSchema` (zod 4) lossy for some schemas | Med | Builders may handle zod directly; else convert + snapshot-test the contract. |
| Threading silo from `import` → `getStaticProps` prop across pages | Med | The recent-videos `videos` prop already flows via getStaticProps — same pattern. |
| Local artifact base-URL vs deployed raw-github | Low | Env-aware base in Task 6. |
| New pages (new slugs) at runtime | Low (out of demo scope) | Demo edits existing content; `fallback: 'blocking'` deferred. |

## Open Questions
None blocking — spec decisions are resolved. Task 0 will record the one factual unknown (the
webmcp builder inputs) before Task 5.

## Parallelization
- Sequential: Task 1 → 2 → 3a/3b. 
- Parallelizable after Task 2: **Task 4** (revalidate) is independent of 3a/3b. **Task 0** runs anytime.
- Task 5 → 6 sequential, and after Phase 1.
