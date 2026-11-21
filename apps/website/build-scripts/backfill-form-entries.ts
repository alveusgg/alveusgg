/**
 * Migrate legacy fields or rotate FormEntry.givenName/familyName/email and
 * MailingAddress.addressLine1/addressLine2/postalCode/city/state/country.
 * Run from apps/website with the target database's environment and keys:
 *   pnpm exec tsx build-scripts/backfill-form-entries.ts
 *   pnpm exec tsx build-scripts/backfill-form-entries.ts --verify
 * Deploy the schema and all v2 writers first. Retain DATA_ENCRYPTION_PASSPHRASE
 * while legacy salted fields remain. Blank/anonymized values are preserved;
 * a normal run clears legacy salts and redacts eligible outgoing webhooks.
 * For rotation, follow docs/field-encryption.md: deploy the new key to all readers
 * before activating it for writes, then wait for every writer to use it.
 * Verification authenticates every nonempty encrypted field with the active key
 * and checks legacy salts are gone; it never writes or redacts webhooks. Resolve
 * failures and rerun both commands before retiring keys or removing legacy readers.
 */
import "./env";

import { createPrismaClient } from "@alveusgg/database";

import {
  mailingAddressFields,
  reencryptFormEntry,
  reencryptMailingAddress,
} from "../src/server/db/form-entry-encryption";
import { redactOutgoingWebhooks } from "../src/server/outgoing-webhooks";
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
const entrySelect = {
  id: true,
  givenName: true,
  familyName: true,
  email: true,
  salt: true,
} as const;
const addressSelect = {
  id: true,
  salt: true,
  addressLine1: true,
  addressLine2: true,
  postalCode: true,
  city: true,
  state: true,
  country: true,
} as const;

async function main() {
  const verify = verificationOnly();
  let scanned = 0;
  let updated = 0;
  let failed = 0;
  let cursor: string | undefined;
  for (;;) {
    const rows = await prisma.formEntry.findMany({
      select: entrySelect,
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
          for (const field of ["givenName", "familyName", "email"] as const) {
            await verifyEncryptedValue(
              fieldEncryption,
              row[field],
              { model: "FormEntry", field },
              { allowEmpty: true },
            );
          }
          if (row.salt !== null) throw new Error("Legacy salt remains");
        } else if (
          await retryChangedRow(
            row,
            () =>
              prisma.formEntry.findUnique({
                where: { id: row.id },
                select: entrySelect,
              }),
            async (current) => {
              const data = await reencryptFormEntry(current);
              return data
                ? updateBackfillRow(prisma, "FormEntry", current, data)
                : null;
            },
          )
        )
          updated++;
      } catch (error) {
        failed++;
        logBackfillFailure(`FormEntry ${row.id}`, error);
      }
    }
  }
  let addressCursor: string | undefined;
  for (;;) {
    const rows = await prisma.mailingAddress.findMany({
      select: addressSelect,
      where: addressCursor ? { id: { gt: addressCursor } } : undefined,
      orderBy: { id: "asc" },
      take: BATCH_SIZE,
    });
    if (!rows.length) break;
    addressCursor = rows[rows.length - 1]!.id;
    for (const row of rows) {
      scanned++;
      try {
        if (verify) {
          for (const field of mailingAddressFields) {
            await verifyEncryptedValue(
              fieldEncryption,
              row[field],
              { model: "MailingAddress", field },
              { allowEmpty: true },
            );
          }
          if (row.salt !== null) throw new Error("Legacy salt remains");
        } else if (
          await retryChangedRow(
            row,
            () =>
              prisma.mailingAddress.findUnique({
                where: { id: row.id },
                select: addressSelect,
              }),
            async (current) => {
              const data = await reencryptMailingAddress(current);
              return data
                ? updateBackfillRow(prisma, "MailingAddress", current, data)
                : null;
            },
          )
        )
          updated++;
      } catch (error) {
        failed++;
        logBackfillFailure(`MailingAddress ${row.id}`, error);
      }
    }
  }
  if (!verify) {
    const count = await redactOutgoingWebhooks(new Date(), prisma);
    console.log(`Form entry webhooks: ${count} redacted`);
  }
  console.log(
    `Form fields: scanned ${scanned}, updated ${updated}, failed ${failed}, verify ${verify}`,
  );
}

await runBackfill(main, () => prisma.$disconnect());
