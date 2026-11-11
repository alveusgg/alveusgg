/**
 * Migrate plaintext or rotate User.email, filling missing User.emailHash indexes.
 * Run from apps/website with the target database's environment and keys:
 *   pnpm exec tsx build-scripts/backfill-user-emails.ts
 *   pnpm exec tsx build-scripts/backfill-user-emails.ts --verify
 * Deploy the schema and all encrypted user-email writers first. Missing/empty
 * emails are preserved. Resolve normalization collisions before completion.
 * For rotation, follow docs/field-encryption.md: deploy the new key to all readers
 * before activating it for writes, then wait for every writer to use it. Keep
 * DATA_BLIND_INDEX_KEY unchanged; existing lookup indexes are not recomputed.
 * Verification is read-only: authenticate emails with the active key and validate
 * their normalized indexes. Resolve failures and rerun both commands before retiring
 * keys or removing plaintext readers. See the feature PR for initial rollout steps.
 */
import "./env";

import { Prisma, createPrismaClient } from "@alveusgg/database";

import { getUserEmailBackfill } from "../src/server/db/user-email";
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
const select = { id: true, email: true, emailHash: true } as const;

async function main() {
  const verify = verificationOnly();
  let scanned = 0;
  let updated = 0;
  let failed = 0;
  let duplicates = 0;
  let cursor: string | undefined;
  for (;;) {
    const rows = await prisma.user.findMany({
      select,
      where: cursor ? { id: { gt: cursor } } : undefined,
      orderBy: { id: "asc" },
      take: BATCH_SIZE,
    });
    if (!rows.length) break;
    cursor = rows[rows.length - 1]!.id;
    for (const row of rows) {
      scanned++;
      try {
        if (verify) {
          const email = await verifyEncryptedValue(
            fieldEncryption,
            row.email,
            { model: "User", field: "email" },
            { allowEmpty: true },
          );
          const expected = email
            ? await fieldEncryption.blindIndexEmail(email)
            : null;
          if (row.emailHash !== expected)
            throw new Error("User email index mismatch");
        } else if (
          await retryChangedRow(
            row,
            () => prisma.user.findUnique({ where: { id: row.id }, select }),
            async (current) => {
              const data = await getUserEmailBackfill(current);
              return data
                ? updateBackfillRow(prisma, "User", current, data)
                : null;
            },
          )
        )
          updated++;
      } catch (error) {
        const cause =
          error instanceof Prisma.PrismaClientKnownRequestError
            ? (
                error.meta?.driverAdapterError as
                  { cause?: { kind?: string } } | undefined
              )?.cause
            : undefined;
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          (error.code === "P2002" ||
            (error.code === "P2010" &&
              cause?.kind === "UniqueConstraintViolation"))
        )
          duplicates++;
        else failed++;
        logBackfillFailure(`User ${row.id}`, error);
      }
    }
  }
  console.log(
    `User emails: scanned ${scanned}, updated ${updated}, duplicates ${duplicates}, failed ${failed}, verify ${verify}`,
  );
}

await runBackfill(main, () => prisma.$disconnect());
