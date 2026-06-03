# Spec: OlonJS Live Editing on Alveus — Tenant Side

**Status:** Draft — Phase 1 **SPECIFY** (gated; awaiting human review before PLAN). A
time-boxed **demo/spike**. Deliverable = the **Alveus (tenant)** side of agent-driven,
**no-rebuild, no-DB** editing of OlonJS editorial content.

## Objective

Prove the OlonJS "agentic web" content layer on a **Next.js tenant** (Alveus): with the
**single Olon flag on**, an external agent — driving **Olon's** platform MCP endpoint —
updates editorial content in the Alveus git repo, and the **deployed** Alveus page reflects
it **within ~10 seconds, with no Vercel rebuild and no database.**

**Scope = the tenant (Alveus) render/read side only.** The editing/write logic lives on
**Olon (jsonpages-platform)**, outside this repo. *Alveus renders; Olon edits from the
outside.*

- **Users:** the Alveus content team (via an agent) + Olon as the editing platform.
- **Success:** editing a page's content JSON in git (via Olon's `updateSection`, or
  simulated locally) updates the live page in ~10 s without a rebuild; each page advertises
  its MCP manifest + contract so an agent can **discover, read, and edit** it.

## One flag, not two

There is **one** switch: the **existing `NEXT_PUBLIC_OLON_PILOT`** is THE Olon on/off flag.

- **Off** → classic Next pages, untouched (today's behavior).
- **On** → the **full** Olon mode: OlonJS silo render + **runtime** silo read + agentic
  artifacts + agent-editable.

The read **source** (FS for local dev / GitHub API on deploy) is **env config** (presence
of `OLON_GIT_TOKEN`), **not** a second flag. "Render-only / baked" is not a product mode —
it was only a spike step and disappears here. (The flag may later be renamed to drop
"PILOT"; cosmetic.)

## Architecture (the contract between Alveus and Olon)

```
Agent ──MCP──▶ OLON platform endpoint                 (NOT in this repo)
                 │  reads manifests from Alveus git
                 │  updateSection → commits NEW CONTENT + regenerated
                 │  content-derived MANIFESTS to the Alveus repo (via GitHub App)
                 │  NEVER touches the schema (contract)
                 ▼
           Alveus git repo  (silo = content + manifests + schemas)
                 │  on commit → on-demand revalidation
                 ▼
           Alveus Next site ── reads silo from git AT RUNTIME ──▶ renders
                 (no rebuild, no DB)  ── <head> advertises mcp-manifest + contract
```

**This repo (Alveus) OWNS:** runtime silo read; the revalidation endpoint; agentic-web
discovery (`<head>` links + runtime serving of manifest/contract); the *initial* generation
of manifests/contracts; env config.

**This repo does NOT own:** the save / `updateSection` / write logic; the GitHub App; the
MCP endpoint; credential issuance — all on **Olon**.

## Assumptions (correct me, or I proceed)

1. The Alveus repo is the **silo source of truth at runtime**: content in
   `src/data/pages/**.json` + `src/data/config/*.json`; on the Olon path the site
   **fetches** these from git at runtime (GitHub Contents API @ ref), **not** via `import`.
2. **Content-only editing** for this spike: zod schemas stay in TS (code). The agent edits
   **content**; the **schema/contract is never changed by editing** (only by a code change
   → a normal deploy). `ajv` / schemas-as-data is **out of scope**.
3. **The `prebuild` (Alveus build) seeds the artifacts** — contracts, first manifests,
   `llms.txt`. Olon does **not** provision these. On each edit Olon regenerates the
   content-derived **manifests**; the **schema/contract is never touched** (changes only via
   a code change → a new build).
4. **Auth is the Olon GitHub App** — the tenant logs into Olon with GitHub and **installs
   the App** (this is how the repo is linked), and the same App performs the **writes**
   (Olon-side, `getInstallationOctokit(github_installation_id)`). The tenant's **runtime
   READ needs no auth: the Alveus repo is PUBLIC** (open-source) → public GitHub raw/API
   @ SHA. Alveus holds **no git credential** — only the Olon-issued **license** in env.
5. The deployed end-to-end demo runs on **Vercel** reading the silo from a **real GitHub
   repo**; locally we demonstrate the same loop with a runtime FS read (`next dev` re-runs
   `getStaticProps`).
6. Commits target a **demo branch** (not `main`); no PR-mode, no production merge.
7. **One flag** (`NEXT_PUBLIC_OLON_PILOT`), off in prod; source-by-env, no second flag.

## Tech Stack

Next.js 16 (Pages Router), React 19, TypeScript, Tailwind 4, **zod 4** (tenant) / zod 3
(`@olonjs/core` peer, isolated). `@olonjs/core` ^1.1.x (`PageRenderer` + `webmcp`
builders). Vercel deploy; GitHub silo source. Node 24, pnpm.

## Commands (in `apps/website`)

```
Dev:        pnpm dev
Build:      pnpm build
Lint:       pnpm lint
Types:      pnpm types
Test:       pnpm test
Local demo: NEXT_PUBLIC_OLON_PILOT=true pnpm dev   # edit a silo JSON → refresh → updated, no rebuild
```

## Project Structure (new / changed)

```
apps/website/
  src/olon/lib/silo-source.ts     → loadSilo*(): on the Olon (flag-on) path, reads content +
                                     manifests + config from git (GitHub API) at runtime; FS for
                                     local dev. Replaces today's `import`. Flag-off = classic pages.
  src/olon/lib/agentic.ts         → thin wrapper over @olonjs/core webmcp builders
                                     (buildPageContract / buildSiteManifest / buildLlmsTxt).
  src/pages/api/revalidate.ts     → POST, secret-protected: revalidate given path(s) after a commit.
  src/pages/api/olon/[...].ts     → RUNTIME read routes serving mcp-manifest / page-manifest /
                                     contract / llms.txt from the git silo (so <head> links resolve
                                     with no rebuild). READ ONLY — no writes.
  src/pages/index.tsx,            → flag-on path: silo via `await loadSilo()` (not import); inject
    ambassadors/*                   <link rel="mcp-manifest"> + <link rel="olon-contract"> in <head>.
  build-scripts/bake-agentic.ts   → one-time generation of contracts/manifests/llms.txt into the repo.
  src/env/index.js                → OLON_GIT_{OWNER,REPO,REF} (locate the silo; PUBLIC repo →
                                     no token), OLON_REVALIDATE_SECRET, OLON_LICENSE_KEY (Olon-issued).
                                     On/off = the existing NEXT_PUBLIC_OLON_PILOT.
docs/specs/olonjs-live-editing-spec.md → this spec
```

## Code Style

Match the pilot: functional React + TS, Tailwind via `classes()`, capsules under
`src/olon`. The runtime read is the only seam — the **flag-off** path (classic pages) stays
byte-identical to today.

```ts
// src/olon/lib/silo-source.ts — runtime read on the Olon (flag-on) path; ONE switch, no second flag
export async function loadSiloPage(slug: string): Promise<PageConfig> {
  return env.OLON_GIT_REPO
    ? fetchPublicGit(`src/data/pages/${slug}.json`) // deploy: PUBLIC GitHub raw/API @ SHA, no token
    : readFromFsRuntime(`src/data/pages/${slug}.json`); // local dev: runtime fs read
}
// Pages call `await loadSiloPage(...)` instead of `import` when NEXT_PUBLIC_OLON_PILOT is on.
```

## Testing Strategy

- **vitest (unit):** `loadSilo` source selection (FS vs git by `OLON_GIT_TOKEN`); the
  revalidate handler (secret + path validation); the agentic builders' output (valid
  manifest/contract for a sample page).
- **Local e2e (manual):** `NEXT_PUBLIC_OLON_PILOT=true pnpm dev` → write a page JSON
  (simulating Olon's `updateSection`) → refresh → content updated **without restart/rebuild**;
  `GET /mcp-manifest.json` + `/schemas/<slug>.schema.json` + `/llms.txt` resolve; each page
  `<head>` carries both `<link>`s.
- **Deployed e2e (when infra exists):** commit content to the demo branch → live page
  updates ≤ 10 s, **no new build** in the Vercel dashboard.

## Boundaries

- **Always:** keep the **Olon flag** (`NEXT_PUBLIC_OLON_PILOT`) **off in production**; keep
  the flag-off path identical to today; `pnpm build / lint / types` green; **secret-protect**
  the revalidate endpoint; commit only to the **demo branch**.
- **Ask first:** adding dependencies; touching `@alveusgg/data` or the classic pages; any
  change that would let editing modify a **schema/contract**; anything that writes to `main`.
- **Never:** put save / `updateSection` / write logic in this repo (it's Olon's); hold a git
  **write** credential in Alveus env; let an edit touch a schema; merge the spike to `main` /
  prod; commit the Olon token or revalidate secret.

## Success Criteria

- [ ] Olon flag **off** → site byte-identical to today (no flag-off regression).
- [ ] Olon flag **on** (local) → editing a page's silo JSON reflects on next request
      **without restart or rebuild**.
- [ ] `GET /mcp-manifest.json`, `/schemas/<slug>.schema.json`, `/llms.txt` resolve &
      validate; each page `<head>` carries `<link rel="mcp-manifest">` +
      `<link rel="olon-contract">`.
- [ ] The revalidation endpoint, given the secret + a path, re-reads the silo from git and
      updates that path **without a rebuild**.
- [ ] An agent (or `curl`) can chain **manifest → contract → page instance** — i.e., the
      page is **discoverable and readable** for editing. (The WRITE is Olon's; not tested here.)
- [ ] `pnpm types` + `pnpm lint` green.

## Decisions (resolved)

- **Artifacts seeded by `prebuild`** (Alveus build): contracts, first manifests, `llms.txt`.
  Olon does **not** provision these.
- **Artifacts/contracts are PUBLIC** — files in the public repo / public site. **No auth** to
  read or serve them: read at runtime from public git (same mechanism as the page content),
  head `<link>`s point at the public artifacts. There is no "how to serve" problem.
- **Read pinned to the commit SHA** passed by the revalidate call (avoids CDN-stale raw).
- **Infra is NOT in scope** — repo / Vercel / Olon endpoint are Olon-side, not Alveus's. This
  spec touches **only the Alveus repo**.
- **Local demo** = runtime FS read in `next dev` (proxy); the true no-rebuild proof is Vercel.

---

*Next phases (gated, after you approve this spec):* **PLAN → TASKS → IMPLEMENT.**
