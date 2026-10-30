/**
 * Migrate plaintext or rotate Account/ClientAccessToken access_token/refresh_token;
 * clear unused Account.id_token values and preserve missing/empty token markers.
 * Run from apps/website with the target database's environment and keys:
 *   pnpm exec tsx build-scripts/backfill-oauth-tokens.ts
 *   pnpm exec tsx build-scripts/backfill-oauth-tokens.ts --verify
 * Initial rollout: deploy the schema and matching keys, deploy every chatbot with
 * OAUTH_TOKEN_ENCRYPTION_ENABLED=false to read encrypted tokens, deploy website
 * encryption, then enable the flag and redeploy every chatbot. Wait for all token
 * writers to use encryption. Keep the flag enabled for rollbacks and rotations.
 * For rotation, follow docs/field-encryption.md: deploy the new key to all readers
 * before activating it for writes, then wait for every writer to use it.
 * Verification is read-only: authenticate tokens with their context and active key
 * and confirm ID tokens are gone. Resolve failures and rerun both commands before
 * retiring keys or removing plaintext readers. See the feature PR for rollout steps.
 */
import "./env";

import { createPrismaClient } from "@alveusgg/database";

import {
  getAccountBackfill,
  getClientAccessTokenBackfill,
} from "../src/server/db/account-tokens";
import { fieldEncryption } from "../src/server/utils/field-encryption";
import {
  logBackfillFailure,
  retryChangedRow,
  runBackfill,
  updateBackfillRow,
  verificationOnly,
  verifyEncryptedValue,
} from "./backfill-utils";

const prisma = createPrismaClient({ log: [] });
const BATCH_SIZE = 500;
const accountSelect = {
  id: true,
  access_token: true,
  refresh_token: true,
  id_token: true,
} as const;

async function main() {
  const verify = verificationOnly();
  let scanned = 0;
  let updated = 0;
  let failed = 0;
  let cursor: string | undefined;
  for (;;) {
    const rows = await prisma.account.findMany({
      select: accountSelect,
      orderBy: { id: "asc" },
      take: BATCH_SIZE,
      where: cursor ? { id: { gt: cursor } } : undefined,
    });
    if (!rows.length) break;
    cursor = rows[rows.length - 1]!.id;
    for (const row of rows) {
      scanned++;
      try {
        if (verify) {
          for (const field of ["access_token", "refresh_token"] as const) {
            await verifyEncryptedValue(
              fieldEncryption,
              row[field],
              { model: "Account", field },
              { allowEmpty: true },
            );
          }
          if (row.id_token !== null) throw new Error("ID token remains");
        } else if (
          await retryChangedRow(
            row,
            () =>
              prisma.account.findUnique({
                where: { id: row.id },
                select: accountSelect,
              }),
            async (current) => {
              const data = await getAccountBackfill(current);
              return data
                ? updateBackfillRow(prisma, "Account", current, data)
                : null;
            },
          )
        )
          updated++;
      } catch (error) {
        failed++;
        logBackfillFailure(`Account ${row.id}`, error);
      }
    }
  }
  // App tokens have a composite key; paginate it without keeping the whole table in memory.
  let after: { service: string; client_id: string } | undefined;
  for (;;) {
    const rows = await prisma.clientAccessToken.findMany({
      orderBy: [{ service: "asc" }, { client_id: "asc" }],
      take: BATCH_SIZE,
      where: after
        ? {
            OR: [
              { service: { gt: after.service } },
              { service: after.service, client_id: { gt: after.client_id } },
            ],
          }
        : undefined,
    });
    if (!rows.length) break;
    after = rows[rows.length - 1]!;
    for (const row of rows) {
      scanned++;
      const key = { service: row.service, client_id: row.client_id };
      try {
        if (verify) {
          for (const field of ["access_token", "refresh_token"] as const) {
            await verifyEncryptedValue(
              fieldEncryption,
              row[field],
              { model: "ClientAccessToken", field },
              { allowEmpty: true },
            );
          }
        } else if (
          await retryChangedRow(
            row,
            () =>
              prisma.clientAccessToken.findUnique({
                where: { service_client_id: key },
              }),
            async (current) => {
              const data = await getClientAccessTokenBackfill(current);
              return data
                ? updateBackfillRow(
                    prisma,
                    "ClientAccessToken",
                    {
                      ...key,
                      access_token: current.access_token,
                      refresh_token: current.refresh_token,
                    },
                    data,
                  )
                : null;
            },
          )
        )
          updated++;
      } catch (error) {
        failed++;
        // client_id can be a credential identifier; report only the service and counts.
        logBackfillFailure(`ClientAccessToken ${row.service}`, error);
      }
    }
  }
  console.log(
    `OAuth tokens: scanned ${scanned}, updated ${updated}, failed ${failed}, verify ${verify}`,
  );
}

await runBackfill(main, () => prisma.$disconnect());
