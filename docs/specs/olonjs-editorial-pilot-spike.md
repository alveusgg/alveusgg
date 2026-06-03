# Spec: OlonJS Editorial Pilot — Evaluation Spike

**Status:** Draft — Phase 1 SPECIFY. Time-boxed **SPIKE**, not a production migration. Deliverable = a **go/no-go verdict on a scorecard**.

---

## Objective

Determine whether serving Alveus's **editorial** content (home + ambassadors) through **OlonJS** (`@olonjs/core` `PageRenderer`) from **JSON content contracts** (the OlonJS silo) produces a site **at least at parity with — ideally better than — the current** Next.js implementation, with **no SSG/SEO/perf regression**.

OlonJS is a **means, not the end**. Kill-switch: if it regresses, or adds cost without upside, **do not adopt**.

- **User:** Alveus dev/content team.
- **Out of scope for this spike:** editing / admin / **MCP server** / Studio. Render-only.
- **Success:** a defensible **better / parity / worse** verdict on the scorecard, with content-as-JSON-silo proven end-to-end under SSG.

## Assumptions (correct me, or I proceed)

1. Renders on the real **`/` and `/ambassadors`** behind a **feature-flag env var** (`NEXT_PUBLIC_OLON_PILOT`): off → current pages (unchanged); on → OlonJS render. **Off in production**; baseline = flag-off, OlonJS = flag-on, same URL.
2. **JSON lives in the OlonJS silo contract** (JSP §2.1 / Appendix A.4): `apps/website/src/data/config/{site,menu,theme}.json` + `apps/website/src/data/pages/**/*.json` (home + per-ambassador). **Generated once** from `@alveusgg/data` (derived snapshot — not hand-authored, not yet the source of truth).
3. `@alveusgg/data` **package and `@olonjs/core` left unmodified**.
4. Scope = editorial home sections (hero, institute, "what is Alveus", ambassadors carousel, animal-quest teaser, how-to-help) + ambassadors pages. **Dynamic parts (Twitch embed, Merch carousel, YouTube "Recent Videos") out of scope**, kept as-is.
5. **zod 4** across Alveus; `@olonjs/core` consumed as published package with its own **zod 3** (pnpm isolation).
6. Baseline (flag-off) is measured first.

## Tech Stack

- **Next.js 16** (**Pages Router**), **React 19**, **TypeScript**, **Tailwind 4**, **zod 4**; pnpm monorepo, Node 24, WSL.
- `@olonjs/core` ^1.1.x runtime, **unmodified**: `PageRenderer` + `ConfigProvider` + `StudioProvider mode="visitor"`; theme published **server-side** (no `ThemeLoader` client injection). Peer **zod 3 isolated**.
- Source: `@alveusgg/data` (read-only) to derive the silo JSON once.
- Reference: `jp-tailark-agent` (working Next + `@olonjs/core` PageRenderer visitor pattern).

## Commands (in `apps/website`)

```
Dev:        pnpm dev
Build:      pnpm build              # next build --webpack (SSG)
Lint:       pnpm lint              # next typegen && eslint --max-warnings 0
Types:      pnpm types             # tsc --noEmit
Test:       pnpm test              # vitest
SSG proof:  pnpm build  &&  inspect built HTML of / (flag on) for section text (JS disabled)
Derive JSON: pnpm tsx build-scripts/derive-olon-silo.ts   # one-time projection from @alveusgg/data
```

## Project Structure (new artifacts)

```
apps/website/
  src/data/config/{site,menu,theme}.json       → OlonJS silo config (contract)
  src/data/pages/home.json                      → home composition (sections)
  src/data/pages/ambassadors/<slug>.json        → per-ambassador content
  src/olon/
    sections/<Type>/{View.tsx,schema.ts}        → tenant View capsules (SSR-safe, zod4)
    registry.ts, schemas.ts, tenant.ts          → PageRenderer bootstrap config
  src/pages/index.tsx, src/pages/ambassadors/*  → flag-switched (Pages Router): OlonJS render
                                                  when NEXT_PUBLIC_OLON_PILOT on, current when off
  build-scripts/derive-olon-silo.ts             → one-time JSON projection from @alveusgg/data
docs/specs/olonjs-editorial-pilot-spike.md      → this spec
```

## Code Style

Match the existing website: functional React + TS, Tailwind via the `classes()` helper, conventions from `src/components/content`. Tenant Views are **metadata-blind** (`data`/`settings` → JSX) and **SSR-safe** (no `window`/`document` in render).

```tsx
// src/olon/sections/AmbassadorsCarousel/View.tsx
export const AmbassadorsCarousel: FC<{ data: AmbassadorsData }> = ({ data }) => (
  <section className={classes("py-12")}>
    {data.featured.map((a) => (
      <Link key={a.slug} href={`/ambassadors/${a.slug}`}>{a.title}</Link>
    ))}
  </section>
);
```

Theme published **server-side** (inline `<style>` derived from `theme.json`) → no client FOUC. Page `<title>`/description via the site's existing **Pages-Router head** (`<Meta>` / `next/head`).

## Evaluation Strategy (the spike's "tests")

1. **SSG gate (pass/fail):** with the flag **on**, `pnpm build` → the static HTML of `/` **contains** the editorial section text + ambassador names/links **with JS disabled**. Content in HTML ⇒ SSG/SEO preserved.
2. **Parity scorecard**, same route both states — **baseline = `/` flag-off**, **OlonJS = `/` flag-on** (measure baseline first):
   - Lighthouse mobile: **LCP, CLS, TBT within ±10%** of baseline.
   - HTML + JS payload delta (report, no hard gate).
   - **axe**: no new a11y violations.
   - Visual diff: acceptable.
3. **Output:** a filled scorecard + a written verdict.

## Boundaries

- **Always:** keep the feature flag **off in production** (live `/` unchanged); enable it only in preview/non-prod; `pnpm build` + `pnpm lint` + `pnpm types` green.
- **Ask first:** adding dependencies (esp. `@olonjs/core`, `react-router-dom`); anything touching `@alveusgg/data` or the ~7 collateral ambassador consumers.
- **Never:** patch `@olonjs/core`; make ambassador JSON the *live* source of truth during the spike; break the package contract or the Twitch extension; commit secrets; merge the spike to `main`/production without the verdict + approval.

## Success Criteria

- [ ] **SSG gate passes** — editorial content present in static HTML with JS off (flag on).
- [ ] **Scorecard filled** vs flag-off baseline — perf within ±10%, no new a11y violations, visual parity.
- [ ] **Written verdict: better / parity / worse**, kill-switch honored (regression-or-no-upside ⇒ recommend *not* adopting).

## Open Questions

None — scope locked.

*Resolved:* `/` + `/ambassadors` behind a feature-flag env var; JSON in the **OlonJS silo contract** (`src/data/config` + `src/data/pages`); scope = editorial subset + ambassadors (dynamic Twitch/Merch/YouTube excluded); **MCP / admin out of scope**; Pages Router, like the rest of the site.

---

*Next phases (gated, after you approve this spec):* **PLAN** → **TASKS** → **IMPLEMENT**.
