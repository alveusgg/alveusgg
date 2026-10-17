# Donation imports and mural backfills

Run these commands from `apps/website` using PNPM. They use `DATABASE_URL` from
`.env`; start with a local database or a production reader connection. They are
administrative tools, not part of request handling.

All commands default to a dry run. The reconciliation command is **always
read-only**. CSV importers require `--apply` to insert records. Pixel allocation
requires a separately generated and reviewed plan, its SHA-256, and confirmation
of the database host/name. No script sends chat messages or donation alerts.

## Private input and review artifacts

Keep exports, manifests, ID lists, generated reports and plans outside the
repository (or inside the ignored `scripts/private/` directory). They contain
donor data. New JSON reports/plans are created with mode `0600`, refuse to replace
existing files, and print only aggregate counts and hashes. Restrict the parent
directory as well. The example CSV files contain synthetic data only. Legacy CSV
importers can print donor information; run them in a private terminal and treat
`--verbose` output as private.

Do not commit real exports, credentials, database snapshots, account identifiers,
worker identifiers, or review artifacts. Do not pass secrets in command arguments.

## Archive an active Twitch charity campaign (read-only)

```sh
pnpm murals:export-twitch-charity-donations --token-file=/private/twitch-user-token --broadcaster-id=BROADCASTER_ID --out=/private/campaign.json
```

Supply an existing user token in a private regular file with mode `0600`; the
command validates the broadcaster and `channel:read:charity` scope and derives
the matching client ID. It performs GET requests only. All pages, source IDs and
checksums are saved privately; no token is written to the archive. Repeated
cursors, duplicate IDs, unexpected currency and a campaign switch fail the export.

Archive before a campaign ends: this endpoint exposes the active campaign only.
It provides no donation timestamps, and pagination is not a point-in-time snapshot.
The output is a source archive, not an automatically approved import manifest.

## Reconcile a verified donation manifest (read-only)

Prepare a versioned JSON manifest using independently verified provider records.
Each donation has the database fields `id`, `provider`, `providerUniqueId`,
`amount` (positive integer USD cents), `donatedAt`, `receivedAt`, `note`,
`donatedBy`, `tags` and `providerMetadata`. Dates are ISO timestamps with timezone;
`donatedAt` and `note` may be `null`. Preserve an unknown donation date as `null`.
Use the provider's actual unique ID format, including its namespace, rather than
inventing a date or an ID. Input is limited to 1,000 unique records per manifest.

```sh
pnpm murals:reconcile-donations --manifest=/private/verified-donations.json --out=/private/reconciliation.json
```

The report separates missing records, matching records and conflicts. It checks
both database IDs and provider IDs, compares source facts including donor data
and metadata, and tolerates a different database ID/receipt time for an otherwise
matching live delivery. It never modifies existing rows. Conflicts produce a
nonzero exit status. A match by source ID alone is not sufficient.

The report also contains a **parameterized SQLite reservation statement for
review**, not execution. The donations worker keeps its own deduplication ledger;
database imports alone do not update that ledger. Before a live-system restore,
coordinate ingestion, check pending donation/pixel queues and dead-letter queues,
verify reservations in the correct worker object (including provider conflicts),
and establish an independently reviewed write procedure. The generated statement
is not evidence that reservations exist. This command has no restore/apply mode,
worker credentials, or queue access.

A reconciliation report establishes the difference for its input records, not
completeness of a provider's history. Archived/ended campaigns, refunds, failed or
pending transactions, origin classifications, source export omissions and manual
imports under other IDs need separate review. Search results can differ from an
individual provider record; inspect final transaction status and provenance.
Do not treat an unverified event payload as proof of a settled donation.

## Allocate pixels quietly from an exact selection

Create a JSON array of `providerUniqueId` strings for the reviewed, eligible
records. The selection is mandatory: there is no implicit date-range scan and no
automatic campaign/fund eligibility inference. Apply the intended campaign rule
when preparing the list. Allocation uses the shared $100 price/$5 tolerance and
subtracts pixels already assigned to the donation **in the selected mural**.

```sh
pnpm murals:fill-pixels --provider-unique-ids=/private/eligible-ids.json --mural=two --plan-out=/private/pixel-plan.json
```

This only reads the database and writes a private plan. It preserves donation
receipt times, follows the normal display-name/username/name fallback, hashes
emails, and picks vacant coordinates deterministically. Review the exact IDs,
counts, identifiers, coordinates, mural and database target in the plan. A full
mural fails instead of silently dropping allocations.

After review, use the reported hash and the target printed inside that plan:

```sh
pnpm murals:fill-pixels --apply --plan=/private/pixel-plan.json --confirm-sha=REVIEWED_SHA256 --confirm-target=HOST/DATABASE
```

Apply rechecks donation contents, existing/manual pixels, reviewed coordinates,
identifiers and entitlements. It inserts only missing reviewed pixels in a single
transaction, without `skipDuplicates`, updates or deletes. Existing matching
pixels are skipped on repeat runs; changed rows or occupied coordinates stop the
run. Keep live allocation coordinated while applying: the worker's in-memory
grid does not see direct database writes until refreshed. If a write response is
lost, inspect the database or rerun the **same** reviewed plan; do not create a new
allocation blindly.

Direct inserts bypass chat, donation alerts and worker queues. They also bypass
the worker cache. After verifying the database, separately refresh the pixel
worker through its authenticated `/pixels/resync` endpoint using the established
operator workflow. This is a mutation and is intentionally not automatic here.
Do not declare the live mural refreshed until that step succeeds; connected
clients may need to reconnect/reload.

## Historical CSV importers

```sh
pnpm murals:import-neon-donations --dry-run /private/neon-export.csv
pnpm murals:import-paypal-donations --dry-run /private/paypal-export.csv
pnpm murals:import-thegivingblock-donations --dry-run /private/giving-block-export.csv
pnpm murals:import-twitch-charity-donations --dry-run /private/twitch-export.csv CAMPAIGN_ID
```

Use `--help` on each importer for its format and options. `--apply` replaces
`--dry-run` only after reviewing the input and target. These commands create
Donation records only; pixel allocation is a separate review step. They do not
forward donations to another CRM.

The Neon importer matches CSV rows against account donation history and skips
ambiguous matches, excluded origins and existing provider IDs. Its output ID file
is a candidate list, not an eligibility decision. Check the provider's final
status and the intended campaign before allocating pixels.

The PayPal and Twitch CSV formats lack native transaction IDs. Their legacy
historical matching uses donor/amount/time windows and synthetic IDs; they are
**not substitutes for exact-ID reconciliation of live provider deliveries**.
Different source IDs may also hide manual backfills, so inspect donor/amount/time
matches separately before importing. Preserve source transaction IDs whenever
available. Imports can be partial if a later row fails; reconcile before retrying.
