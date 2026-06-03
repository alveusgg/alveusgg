# OlonJS as an MCP Content Layer — Foundational Note

> **First brick of the idea.** Working notes (not a pitch) on using an MCP server as
> the *editing runtime* for schema-driven editorial content: the write-back problem,
> the dependency inversion that solves it, and what it takes to sell the MCP layer to
> third parties. Honest about the gaps.

## Thesis

OlonJS treats editorial / presentational content as **schema-defined contracts +
validated JSON instances**. The **contract (schema)** is the stable surface; the
**instance (JSON)** is the content. Editing happens through an **LLM connected to an
MCP server**, operating *within* the schema — not through a classic form-based CMS UI.
The schema is the guardrail: the model cannot write outside the contract, and
validation rejects anything that doesn't conform.

In one line: **the MCP server is the agentic editing runtime that stands in for a CMS;
the schema is the contract that makes agentic editing safe.**

## Two separable concerns (do not conflate them)

1. **(A) The contract layer** — schemas that are *referenceable* (`$ref`, possibly
   remote / versioned) and *certifiable* (conformance-checkable). A **standards /
   ecosystem play**: heavy, long, optional.
2. **(B) The MCP-as-CMS runtime** — the agentic editing loop. A **shippable product**.

They're related (B consumes A's schemas) but independent. **B only needs the schemas
*exposed*, not a full certified standard.** This note focuses on **(B)**.

## How editing actually flows (MCP roles)

- **MCP server** — exposes *tools* (operations) over the content: `getSection`,
  `updateSectionData`, `addSection`, `removeSection`, `reorderSections`, `validate`,
  `preview`, `publish`. The tenant's schemas are the contract for each tool's `data`
  payload.
- **Client = the host**, not something you build. Any MCP-capable host (Claude Desktop,
  Claude Code, Cursor, VS Code, ChatGPT connectors) connects to the server and drives
  the LLM.
  - **Dev-first buyer** → *bring-your-own-host*. You ship **no client**. The editor is
    their Claude / Cursor.
  - **Non-dev / content-team buyer** → you must build a **thin host** (embedded LLM +
    MCP client + preview + publish). A different, heavier product that competes with
    real CMSs (Sanity, Payload, …).

> The data schema is only ~20–30% of the contract surface. The **operation contracts**,
> the **page-composition contract**, and the **write-back / governance** are the rest —
> and the real work.

## The write-back problem

Content lives in the **tenant's** deployment (their files / DB / git). A central server
*you* host cannot reach into someone else's system to persist edits. This is the
blocker for selling beyond tenants you deploy yourself.

## The solution: invert the dependency

You do **not** wire write-back into their server. You **define an interface**; the
tenant **implements** it; your MCP server — **mounted inside the tenant's deployment** —
calls it.

```ts
// What YOU define (the SDK / contract):
interface ContentStore {
  load(pageId: string): Promise<PageConfig>;
  persist(pageId: string, page: PageConfig, ctx: EditContext): Promise<void>;
  // optional: preview(), publish(), history()
}

// Your MCP server, generic, parameterized by the tenant:
createOlonMcp({
  schemas, // the tenant's zod schemas (the registry)
  store,   // the tenant's ContentStore implementation  ← the only per-tenant part
  auth,    // who may edit what
});

// The updateSection tool ALWAYS does:
//   validate(data, schemas[type])  ->  store.persist(pageId, page, ctx)
```

The tenant writes only this (10–20 lines), or uses a reference adapter:

```ts
const store: ContentStore = {
  load: (id) => readSilo(id),
  persist: (id, page, ctx) => commitAndOpenPR(`silo/${id}.json`, page, ctx),
};
```

**The write-back IS `persist`.** It is implemented by the tenant against your contract,
not integrated by you per tenant. Validation against the tenant's real schema happens
*before* `persist` is called, so `persist` can assume valid data.

## Where edits land — the `persist` menu (the options are NOT equivalent)

| Target | Mechanism | Honest trade-off |
|---|---|---|
| **Git (file + commit/PR)** | write JSON to the repo → CI/host rebuild | **Cleanest.** Audit trail, review (PR), rollback, **SSG preserved**. Cost: not instant (deploy latency). Maps 1:1 onto a repo-based silo. |
| **DB (upsert row)** | app reads silo from DB via ISR/SSR | Instant, but **loses pure SSG** and **reintroduces full CMS governance** (preview/publish/rollback you must build). |
| **KV / object storage** | write JSON blob + revalidate | Middle ground. |
| **Runtime file write** | `fs.writeFile` at runtime | **Trap** on serverless (ephemeral FS). Stateful servers only. |

The target is the **tenant's choice**, surfaced as `persist`. Ship reference adapters
(git-PR, DB) so most tenants don't write it themselves.

## How this unblocks selling

- **Topology shift**: from *"I deploy the tenant"* (server co-located with storage you
  own → write-back trivial) to *"they mount the server"* (a package they install + a
  `ContentStore` they implement).
- **Zero per-tenant integration.** The write-back becomes their `persist`, or your
  ready-made git-PR adapter.
- **Product surface** = mountable MCP server package + the `ContentStore` contract +
  reference adapters (git-PR, DB) + connection docs. That's it.

## Business model

With bring-your-own-host, the **customer pays for their own LLM** (their Claude /
ChatGPT). You monetize the **server + adapter** (per-tenant / per-seat). This is cleaner
than hosting inference and eating token cost — avoid sliding into a hosted client unless
you deliberately target non-devs.

## Schema mechanics (why zod-first fits a dev-first buyer)

- Tenant schemas are zod (in their codebase). Zod 4 exposes JSON Schema natively via
  `z.toJSONSchema()` — **no extra dependency**. That's the bridge from "schemas in code"
  to "contracts an MCP/LLM can read".
- **`z.toJSONSchema()` is lossy**: `.refine()` / transforms / custom types don't
  round-trip. So the JSON Schema is **LLM *guidance***; the **zod stays the
  authoritative *gate***. Validate model output against the zod, not the derived JSON
  Schema.
- `.describe("ui:...")` leaks UI hints into `description` (which the LLM reads as an
  instruction). Move UI hints to a custom keyword (`x-ui`).
- **Source-of-truth fork**: *zod-first* (TS is SoT, JSON Schema generated) is app-first
  and fits dev customers; *contract-first* (JSON Schema is SoT, zod generated) tells the
  stronger "contracts as the product" story but is a different posture. Decide
  deliberately — it shapes the pitch.

## Honest risks / open questions

- **Multi-tenant for third parties is a re-architecture, not packaging**: OAuth, tenant
  isolation, per-tenant schema loading, rate limiting, and **safe write-back on
  untrusted tenants** (an LLM writing into a customer's repo/DB is attack surface).
- **Runtime compatibility matrix**: a mountable server must support the tenant's runtime
  (Next.js API route / Node / edge) and their write mechanism.
- **DB-mode pulls CMS governance back onto you**: the moment a customer wants *instant*
  editing, you owe them preview/publish/rollback — the very thing the agentic model was
  meant to sidestep.
- Only the **git-PR adapter** is clean and SSG-safe today; it is also the case the
  OlonJS editorial pilot already matches (silo JSON in a repo).

## Next bricks

1. Pin down the `ContentStore` interface precisely + ship the **git-PR reference
   adapter** (covers the dev-first / repo-silo case).
2. Define the **MCP tool set** (the operations contract): verbs, addressing,
   validate / preview / publish.
3. Design **multi-tenant + auth** (OAuth, isolation, write-back safety).
4. Decide the **source-of-truth direction** (zod-first vs contract-first).
