import { parseArgs } from "node:util";

import { Prisma, type PrismaClient } from "@alveusgg/database";
import type {
  EncryptionContext,
  createFieldEncryption,
} from "@alveusgg/database/encryption";

type Value = string | null | { json: Prisma.JsonValue };
const identifier = (name: string) =>
  Prisma.raw(`\`${name.replaceAll("`", "``")}\``);
const parameter = (value: Value) =>
  typeof value === "object" && value !== null
    ? Prisma.sql`CAST(${JSON.stringify(value.json)} AS JSON)`
    : Prisma.sql`${value}`;

/** Match text byte for byte, including case and trailing spaces, under MySQL's default collation. */
export async function updateBackfillRow(
  prisma: Pick<PrismaClient, "$executeRaw">,
  table: string,
  snapshot: Record<string, Value>,
  data: Record<string, Value>,
) {
  const assignments = Object.entries(data).map(
    ([field, value]) => Prisma.sql`${identifier(field)} = ${parameter(value)}`,
  );
  const conditions = Object.entries(snapshot).map(([field, value]) =>
    typeof value === "object" && value !== null
      ? Prisma.sql`${identifier(field)} <=> ${parameter(value)}`
      : Prisma.sql`BINARY ${identifier(field)} <=> BINARY ${parameter(value)}`,
  );
  // Retain indexed key predicates as well: BINARY on an indexed column alone can force a scan.
  const keys = Object.entries(snapshot)
    .filter(([field]) => ["id", "service", "client_id"].includes(field))
    .map(
      ([field, value]) =>
        Prisma.sql`${identifier(field)} = ${parameter(value)}`,
    );
  return prisma.$executeRaw(
    Prisma.sql`UPDATE ${identifier(table)} SET ${Prisma.join(assignments)} WHERE ${Prisma.join([...keys, ...conditions], " AND ")}`,
  );
}

/** Re-read after a lost conditional write instead of overwriting a newer value. */
export async function retryChangedRow<Row>(
  initial: Row,
  reload: () => Promise<Row | null>,
  update: (row: Row) => Promise<number | null>,
) {
  let row: Row | null = initial;
  for (let attempt = 0; attempt < 3; attempt++) {
    if (row === null) return false;
    const count = await update(row);
    if (count === null) return false;
    if (count > 0) return true;
    row = await reload();
  }
  throw Object.assign(new Error("Row kept changing during backfill"), {
    code: "CONCURRENT_UPDATE",
  });
}

/** A current key id alone doesn't establish that a value decrypts. */
export async function verifyEncryptedValue(
  encryption: ReturnType<typeof createFieldEncryption>,
  value: string | null,
  context: EncryptionContext,
  { allowEmpty = false } = {},
) {
  if (value === null || (allowEmpty && value === "")) return value;
  const plaintext = await encryption.decrypt(value, context);
  if (encryption.needsReencryption(value)) {
    throw new Error("Value still uses a retired key");
  }
  return plaintext;
}

export function verificationOnly() {
  return parseArgs({ options: { verify: { type: "boolean", default: false } } })
    .values.verify;
}

export function logBackfillFailure(row: string, error: unknown) {
  const code =
    error &&
    typeof error === "object" &&
    "code" in error &&
    typeof error.code === "string" &&
    /^(P[0-9]{4}|CONCURRENT_UPDATE)$/.test(error.code)
      ? error.code
      : "ERROR";
  console.error(`${row}: ${code}`);
  process.exitCode = 1;
}

export async function runBackfill(
  main: () => Promise<void>,
  disconnect: () => Promise<void>,
) {
  try {
    await main();
  } catch (error) {
    logBackfillFailure("Backfill", error);
  } finally {
    await disconnect().catch((error: unknown) =>
      logBackfillFailure("Disconnect", error),
    );
  }
}
