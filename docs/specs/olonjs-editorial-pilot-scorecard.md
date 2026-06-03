# OlonJS Editorial Pilot — Scorecard & Verdict

Phase 4 (T8 + T9) of the spike. Companion to [the spec](./olonjs-editorial-pilot-spike.md) and [the plan](./olonjs-editorial-pilot-plan.md). Measures the OlonJS render (flag on) **head-to-head** vs the current pages (flag off) on the same routes, then gives the go/no-go verdict.

## Method

- Same routes, two flag states: `NEXT_PUBLIC_OLON_PILOT` **off** = current Alveus pages (baseline), **on** = OlonJS render. Both via `pnpm build` (SSG), Pages Router.
- Scope under test: `/` (home), `/ambassadors` (index), `/ambassadors/<slug>` (52 detail pages).
- Tenant is **spec-conformant** (TBP capsules + MTRP augmentation, verified `tsc` green).

## Scorecard

| Dimension | Baseline (flag off) | OlonJS (flag on) | Verdict |
|---|---|---|---|
| **SSG gate** (content in static HTML, JS off) | ✅ | ✅ (home + index + 52 details prerendered) | **parity** |
| **Build** | `pnpm build` exit 0 | exit 0; `pnpm types` green; MTRP augmentation proven | parity |
| **`/` HTML payload** | 93,035 B | 76,196 B (−18%) | on smaller* |
| **`/ambassadors` HTML** | 148,867 B | 145,955 B (−2%) | ~parity* |
| **`/ambassadors/<slug>` HTML** | 61,549 B | 57,872 B (−6%) | ~parity* |
| **Prerender time `/`** | 640 ms | 607 ms | parity |
| **Visual fidelity** | — | reuses the *same* Alveus content components | parity (by construction) |
| **a11y** | — | same components → same semantics | parity (qualitative) |
| **Per-route First Load JS** | not captured | not captured | ⚠️ deferred |
| **Lighthouse LCP/CLS/TBT (lab)** | not run | not run | ⚠️ deferred (needs Chrome) |

\* The OlonJS pages are *smaller partly because they do less* — see functional deltas. Not a pure like-for-like.

**Deferred metrics (honest):** per-route First Load JS (Next 16 `--webpack` build output didn't surface Size/First-Load columns in this run) and Lighthouse lab metrics + axe (need a headless browser, unavailable in this WSL setup). Note: OlonJS **adds client JS** (`PageRenderer` + `ConfigProvider`/`StudioProvider` + `@olonjs/core` + `react-router-dom`) that the current pages don't ship — a real cost not quantified here.

## Cost added (to ship the OlonJS render)

- Deps: **`@olonjs/core` + `react-router-dom`** (+ a zod-4 peer override; zod 3/4 coexistence).
- **~1,204 LOC** tenant code across **34 files** + **54 silo JSON** pages (home, ambassadors index, 52 profiles) + 3 config.
- Capsule/MTRP boilerplate per section type (View/schema/types/index).
- A genuine fix it forced (net positive): MySQL `allowPublicKeyRetrieval` so `next build` prerenders DB pages.

## Functional deltas (OlonJS-as-built is *less* than the current pages)

- **Home** omits **Merch** + **Recent Videos** (dynamic, out of scope) → shorter page.
- **`/ambassadors`** omits the **sort/group** controls (`Select`/`SubNav`) — interactive app functionality, out of editorial scope.
- **Per-page `<Meta>`** (title/description/OG, retired `noindex`) **not wired** in the OlonJS path → SEO-meta regression (would need Next `metadata`/head).

## Findings

1. **Render & SSG reach parity.** OlonJS `PageRenderer` emits the editorial content to static HTML with no SSG regression, theme published server-side. The make-or-break held.
2. **The detail page is ~90% data-template, not editorial copy.** Only `name/alternate/story/mission/fact` are editorial JSON; species/IUCN/dates/enclosure/images/clips/Animal-Quest are resolved from the key. OlonJS-ifying it added structure for little "content-as-JSON" payoff → **weak fit** for data-driven catalog pages.
3. **Narrative pages are a good fit** (hero/what-is/how-to-help): clean mapping of editorial copy → JSON sections, components reused → parity for free.
4. **The main OlonJS benefit was out of scope.** Studio / agent (MCP) editing — the schema-driven, type-safe editing that justifies the capsule/MTRP overhead — was explicitly excluded. In a render-only, no-admin spike, what's realized is "editorial copy in JSON + a section model," which for dev-edited SSG content is **marginal over the existing typed-TS + React components**.

## Verdict — **parity-at-best, do not adopt *as scoped*** (kill-switch honored)

For the **render-only, no-admin** scope, OlonJS delivers roughly **equal output (slightly less functional)** at a **net higher cost** (deps, ~1.2k LOC + 54 JSON, capsule/MTRP boilerplate, added client JS, zod 3/4 coexistence) — **without** unlocking its headline value (Studio/agent editing), which was out of scope. The kill-switch ("not better ⇒ don't adopt") therefore says **no** for this scope.

**Recommendation**
- **Do not migrate** the editorial layer to OlonJS on the strength of *rendering* alone.
- **Re-evaluate only if** non-developer / agent (MCP) editing of editorial content becomes a real goal — that's where OlonJS concentrates its value, and it was excluded here. Re-run the spike *with* the editing layer before deciding.
- If/when adopted, apply OlonJS to **narrative pages** (good fit) and **keep the ambassador catalog data-driven** from `@alveusgg/data` (poor fit as JSON sections).

## Reproduce

```
cd apps/website
pnpm tsx build-scripts/derive-olon-silo.ts        # regenerate silo JSON from @alveusgg/data
NEXT_PUBLIC_OLON_PILOT=true  pnpm build           # OlonJS render
NEXT_PUBLIC_OLON_PILOT=false pnpm build           # baseline
# compare .next/server/pages/{index,ambassadors,ambassadors/<slug>}.html
```
