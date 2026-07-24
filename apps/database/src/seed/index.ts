import "dotenv/config";

import { seedForms } from "./forms";
import { seedShowAndTell } from "./show-and-tell";
import { seedUsers } from "./users";
import { prisma } from "../index";

// Seeds the local development database with example content.
// Idempotent: every seeder upserts on a stable unique key ("seed-" prefixed
// ids, emails or slugs), so it is safe to run repeatedly.
//
// Run with `pnpm seed` (or `pnpm prisma db seed`) from within apps/database,
// after the schema has been pushed with `pnpm prisma db push`.
//
// To add a new seed domain, create a module in this directory that upserts on
// a stable unique key and call it below.
async function main() {
  const usersByEmail = await seedUsers();
  await seedForms();
  await seedShowAndTell(usersByEmail);
}

try {
  await main();
  console.log("Database seeded successfully");
} catch (error) {
  console.error("Seeding failed:", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
