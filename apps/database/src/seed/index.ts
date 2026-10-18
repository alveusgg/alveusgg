import "dotenv/config";

import { seedForms } from "./forms";
import { seedShowAndTell } from "./show-and-tell";
import { seedUsers } from "./users";
import { seedNotifications } from "./notifications";
import { seedShortLinks } from "./short-links";
import { seedCalendarEvents } from "./calendar-events";
import { prisma } from "../index";

// Seeds the local development database with example content.
// Idempotent: every seeder upserts on a stable unique key (ids, emails or
// slugs containing "seed"), so it is safe to run repeatedly.
//
// Run with `pnpm seed` (or `pnpm prisma db seed`) from within apps/database,
// after the schema has been pushed with `pnpm prisma db push`.
//
// To add a new seed domain, create a module in this directory that upserts on
// a stable unique key and call it below.

// Only seed local databases, so example users with every admin role can't end
// up in production by accident. Set SEED_ALLOW_REMOTE=1 to seed another host.
const localHosts = ["localhost", "127.0.0.1", "[::1]", "db"];

function assertLocalDatabase() {
  const url = process.env.DATABASE_URL;
  const host = url ? URL.parse(url)?.hostname : undefined;
  if (process.env.SEED_ALLOW_REMOTE === "1") return;
  if (host && localHosts.includes(host)) return;
  throw new Error(
    `Refusing to seed ${host ?? "an unknown database"}, only local databases are seeded. Set SEED_ALLOW_REMOTE=1 to seed it anyway.`,
  );
}

async function main() {
  assertLocalDatabase();
  const usersByEmail = await seedUsers();
  await seedForms();
  await seedShowAndTell(usersByEmail);
  await seedCalendarEvents();
  await seedShortLinks();
  await seedNotifications();
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
