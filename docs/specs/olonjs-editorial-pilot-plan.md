# Implementation Plan: OlonJS Editorial Pilot — Spike

Companion to [olonjs-editorial-pilot-spike.md](./olonjs-editorial-pilot-spike.md). Phase 2 (PLAN) + Phase 3 (TASKS). **Render-only spike. No MCP/admin.** Gated for review before IMPLEMENT.

## Overview

Render the Alveus **home + ambassadors (index AND detail pages)** via `@olonjs/core` `PageRenderer` from the **OlonJS silo JSON**, **SSG**, behind `NEXT_PUBLIC_OLON_PILOT`, then score it head-to-head vs the current pages. Build as **vertical slices**, **highest-risk first** (a walking skeleton that proves install + SSG + theme + zod-isolation before any content work).

## Architecture Decisions

1. **Walking skeleton first.** One trivial section rendered end-to-end (silo → View → PageRenderer → flag route → static HTML) before building real sections — retires the make-or-break risks immediately.
2. **Images via slug, not in JSON.** Section Views resolve ambassador images through the existing `getAmbassadorImages(slug)` (`StaticImageData`); JSON carries only `slug` + editorial copy. Preserves `next/image` optimization; defers the asset pipeline (out of scope).
3. **zod isolation.** App stays zod 4; `@olonjs/core` gets its own zod 3 via pnpm. Tenant section schemas authored in the app's zod 4 (only used by our code, never handed to core's zod-3 serializer).
4. **Theme server-side.** Publish `theme.json` as an inline `<style>` during SSR (no `ThemeLoader` client injection) → no FOUC. Head via the site's existing Pages-Router `<Meta>`.
5. **Flag-switch, same routes.** `index.tsx`, `ambassadors/index.tsx`, `ambassadors/[ambassadorName].tsx` branch on the flag — true head-to-head on the same URLs.

## Dependency Graph

```
T1 install core + zod-isolation + flag env
   └─ T2 walking-skeleton render (PageRenderer on flagged / + minimal silo)     ◀ Checkpoint A
        ├─ T3 derive home silo JSON
        │     └─ T4a narrative Views ── T4b data Views                           ◀ Checkpoint B
        │            └─ T5 ambassadors index ── T6 derive detail JSON ── T7 detail page  ◀ Checkpoint C
        └────────────────────────────────────────── T8 scorecard ── T9 verdict   ◀ Checkpoint Complete
```

---

## Phase 1 — Foundation (fail-fast)

### Task 1: Install `@olonjs/core` (zod-3 isolated) + feature flag
**Description:** Add `@olonjs/core` to `apps/website`, ensure pnpm resolves its peer **zod 3** without disturbing the app's **zod 4**; add `NEXT_PUBLIC_OLON_PILOT` to the env schema.
**Acceptance:**
- [ ] `@olonjs/core` installed; app `zod` stays 4.x; core resolves zod 3.x (isolated, no peer error).
- [ ] `NEXT_PUBLIC_OLON_PILOT` in `src/env/index.js` (`z.stringbool().optional().default(false)`).
**Verification:** `pnpm install` clean; `pnpm types` green; dependency tree shows app zod4 + core zod3.
**Dependencies:** None. **Files:** `package.json`, `pnpm-lock.yaml`, `src/env/index.js`, `.env.example`. **Scope:** S. **Risk: HIGH.**

### Task 2: Walking-skeleton render — PageRenderer on flagged `/`, prove SSG
**Description:** Minimal silo (`config/{site,menu,theme}.json` + `pages/home.json` with ONE stub section) + tenant bootstrap (`registry.ts`, `schemas.ts`, `tenant.ts`) + one trivial View. Flag-switch `index.tsx`: on → `ConfigProvider` + `StudioProvider mode="visitor"` + server-side theme + `PageRenderer`; off → current home.
**Acceptance:**
- [ ] Flag on → stub section on `/`; flag off → current home unchanged.
- [ ] `pnpm build` emits **static HTML for `/` containing the stub text with JS disabled**.
- [ ] No FOUC; no react-router error (add a `MemoryRouter` wrapper on our side only if needed — no core patch).
**Verification:** `pnpm build`; inspect `.next/server/pages/index.html`; `pnpm start` + JS off; `pnpm lint`/`types` green.
**Dependencies:** T1. **Files:** silo (3 json) + `src/olon/{registry,schemas,tenant}.ts` + one View + `index.tsx`. **Scope:** M. **Risk: HIGH — make-or-break.**

### ◀ Checkpoint A (review)
- [ ] Core installed (zod isolated), `PageRenderer` → **static HTML under SSG** on flagged `/`, theme server-side, no FOUC. If it fails → stop & reassess.

---

## Phase 2 — Home content (vertical)

### Task 3: Derive script — `@alveusgg/data` → home silo JSON
**Description:** `build-scripts/derive-olon-silo.ts`: homepage-flagged ambassadors → `{slug,title,description}`, latest animal-quest, emit `src/data/pages/home.json` (copy seeded from current `index.tsx`). Idempotent.
**Acceptance:** [ ] valid `home.json` parses against section schemas; ambassadors section carries slugs + copy (no image data).
**Verification:** `pnpm tsx build-scripts/derive-olon-silo.ts`; zod-parse green.
**Dependencies:** T2. **Files:** `derive-olon-silo.ts`, `home.json`. **Scope:** M.

### Task 4a: Narrative section Views (Hero, Institute, WhatIsAlveus, HowToHelp)
**Description:** Four capsules (`View.tsx` + `schema.ts`), metadata-blind + SSR-safe, Tailwind matching current. Register in `registry.ts`/`schemas.ts`.
**Acceptance:** [ ] each at visual parity; registry 1:1 with schemas; no `window` in render.
**Verification:** flag-on `/` renders them; visual diff acceptable; static HTML contains them; lint/types green.
**Dependencies:** T3. **Files:** 4 capsules + registry/schemas. **Scope:** M.

### Task 4b: Data-backed section Views (AmbassadorsCarousel, AnimalQuestTeaser)
**Description:** Carousel renders the JSON list, images via `getAmbassadorImages(slug)`, links to `/ambassadors/<slug>`; teaser renders latest episode.
**Acceptance:** [ ] both at parity; SSR-safe.
**Verification:** flag-on `/` full home at parity; static HTML has ambassador names/links; lint/types green.
**Dependencies:** T4a. **Files:** 2 capsules + registry/schemas. **Scope:** M.

### ◀ Checkpoint B (review)
- [ ] Full home via OlonJS (flag on) at visual parity, static HTML (JS off). Eyeball vs current `/`.

---

## Phase 3 — Ambassadors (index + detail)

### Task 5: Ambassadors **index** via OlonJS
**Description:** Extend derive to emit the list JSON; `AmbassadorsList` View (cards: image via slug + name + species); flag-switch `src/pages/ambassadors/index.tsx`.
**Acceptance:** [ ] flag on → `/ambassadors` lists all at parity; off → current; static HTML has the list.
**Verification:** `pnpm build` + inspect `/ambassadors` HTML; visual diff; lint/types green.
**Dependencies:** T4b. **Files:** derive update, list JSON, `AmbassadorsList` capsule, `ambassadors/index.tsx`. **Scope:** M.

### Task 6: Derive per-ambassador **detail** JSON
**Description:** Extend derive to emit `src/data/pages/ambassadors/<slug>.json` for **every** ambassador — all detail fields (name, story/copy, species, iucn, enclosure refs, animal-quest links; images resolved in the View via slug).
**Acceptance:** [ ] one JSON per ambassador, each parses against the detail section schema(s); covers the full roster.
**Verification:** `pnpm tsx build-scripts/derive-olon-silo.ts`; zod-parse all outputs green; count == roster size.
**Dependencies:** T5. **Files:** `derive-olon-silo.ts` update, generated `ambassadors/*.json`. **Scope:** M.

### Task 7: Ambassador **detail page** via OlonJS
**Description:** Build the ambassador-profile section View(s) (classification, species, iucn, enclosure, image gallery via slug, animal-quest links) matching current `/ambassadors/[name]`; flag-switch `src/pages/ambassadors/[ambassadorName].tsx` (with `getStaticPaths` over the roster).
**Acceptance:** [ ] flag on → every `/ambassadors/<slug>` renders at parity; off → current; static HTML per page contains the profile.
**Verification:** `pnpm build` prerenders all ambassador paths; inspect a sample's HTML (JS off); visual diff on 2–3; lint/types green.
**Dependencies:** T6. **Files:** profile capsule(s) + registry/schemas + `[ambassadorName].tsx`. **Scope:** M–L (split the profile into sub-sections if it grows past ~5 files).

### ◀ Checkpoint C (review)
- [ ] `/`, `/ambassadors`, and `/ambassadors/<slug>` all render via OlonJS at parity, SSG.

---

## Phase 4 — Measure & verdict

### Task 8: Baseline + OlonJS scorecard
**Description:** Measure current (flag off) vs OlonJS (flag on) for `/`, `/ambassadors`, and a sample detail page: Lighthouse mobile (LCP/CLS/TBT), axe, HTML+JS payload, visual diff. Record SSG gate.
**Acceptance:** [ ] scorecard filled, both columns + deltas.
**Verification:** Lighthouse + axe captured; numbers in the results doc.
**Dependencies:** Checkpoint C. **Files:** `docs/specs/olonjs-editorial-pilot-scorecard.md`. **Scope:** M.

### Task 9: Verdict
**Description:** Write **better / parity / worse** + recommendation; honor the kill-switch.
**Acceptance:** [ ] clear verdict with evidence.
**Dependencies:** T8. **Files:** verdict section in the scorecard doc. **Scope:** XS.

### ◀ Checkpoint Complete
- [ ] All spec success criteria met; verdict written; ready for review.

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| zod 3/4 coexistence breaks install/types | High | Isolate via pnpm; front-loaded T1; `overrides` if needed |
| `PageRenderer` doesn't emit static HTML / hydration mismatch | High | T2 walking skeleton fails fast; SSR-safety already verified by code reading |
| Theme FOUC without `ThemeLoader` | Med | Server-side inline `<style>` from `theme.json`; verified in T2 |
| Image LCP/CLS regression | Med | Keep `StaticImageData` via `getAmbassadorImages(slug)`; JSON carries slug only |
| Detail page richness → oversized task | Med | T7 may split the profile into sub-section capsules if past ~5 files |
| `PageRenderer` needs a react-router context | Med | `MemoryRouter` wrapper on our side (no core patch); confirm in T2 |
| Visual fidelity gap vs current | Med | Views match current Tailwind; visual diff at Checkpoints B/C and T8 |

## Open Questions

None — scope locked (home + ambassadors index **and** detail).

## Parallelization

- Sequential: T1 → T2; the derive→Views→routes chains.
- Parallelizable after T3: section Views (T4a / T4b) concurrently; detail JSON (T6) can start once the detail schema from T7 is drafted.
