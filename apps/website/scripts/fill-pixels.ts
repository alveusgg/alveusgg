import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { default as env } from "@next/env";
import { createId } from "@paralleldrive/cuid2";

import { prisma } from "@alveusgg/database";

import { DonatorSchema } from "@alveusgg/donations-core";

import type { MuralId } from "@/data/murals";

const basePath = resolve(fileURLToPath(import.meta.url), "../../");
env.loadEnvConfig(basePath, false);

// --- Configuration ---
const MURAL_ID = "two" satisfies MuralId; // TODO: Make it a cli argument?
const START_DATE_STR = "2025-10-22 22:03:00.000"; // TODO: Use mural data
const MIN_AMOUNT = 9500; // TODO: Use donations-core
const MAX_RETRIES = 5; // Number of attempts to resolve collisions

// --- Helpers ---
async function hash(identifier: string) {
  return await crypto.subtle
    .digest("SHA-256", new TextEncoder().encode(identifier.toLowerCase()))
    .then((hash) =>
      Array.from(new Uint8Array(hash))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(""),
    );
}

type NeededCount = {
  id: string;
  pixelsNeeded: number | bigint;
};

async function main() {
  console.log("Starting backfill…");

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    console.log(`\n--- Attempt ${attempt}/${MAX_RETRIES} ---`);

    const neededCounts = await prisma.$queryRawUnsafe<NeededCount[]>(`
      SELECT d.id,
             FLOOR((d.amount + 500) / 10000) - (SELECT COUNT(*)
                                                FROM Pixel p
                                                WHERE p.donationId = d.id) AS pixelsNeeded
      FROM Donation d
      WHERE d.receivedAt >= '${START_DATE_STR}'
        AND d.amount > ${MIN_AMOUNT}
        AND MOD(d.amount, 10000) < 5
      HAVING pixelsNeeded > 0
    `);

    if (neededCounts.length === 0) {
      console.log("All donations are fully populated!");
      break;
    }

    console.log(`> Found ${neededCounts.length} donations needing pixels.`);

    // 2. PRISMA: Fetch full objects type-safely
    const donationIds = neededCounts.map((n) => n.id);
    const donations = await prisma.donation.findMany({
      where: { id: { in: donationIds } },
    });

    // Create a lookup map for speed: ID -> Count
    const countMap = new Map<string, number>();
    neededCounts.forEach((n) => countMap.set(n.id, Number(n.pixelsNeeded)));

    // 3. Generate pixels
    const pixelsToInsert = [];

    for (const donation of donations) {
      const needed = countMap.get(donation.id) || 0;
      if (needed <= 0) continue;

      const donator = DonatorSchema.parse(donation.donatedBy);
      let identifier = "Anonymous";
      if (donator.primary === "username" && donator.username) {
        identifier = `@${donator.username}`;
      } else if (donator?.firstName) {
        identifier = donator.firstName;
      }

      for (let i = 0; i < needed; i++) {
        pixelsToInsert.push({
          id: createId(),
          receivedAt: donation.receivedAt, // Fully typed Date object
          donationId: donation.id,
          identifier: identifier,
          email: donator.email && (await hash(donator.email)),
          muralId: MURAL_ID,
          column: Math.floor(Math.random() * 200),
          row: Math.floor(Math.random() * 50),
        });
      }
    }

    console.log(`> Generated ${pixelsToInsert.length} pixels.`);

    // 4. INSERT
    const result = await prisma.pixel.createMany({
      data: pixelsToInsert,
      skipDuplicates: true,
    });

    const collisions = pixelsToInsert.length - result.count;
    console.log(`> Inserted: ${result.count}`);

    if (collisions > 0) {
      console.log(`⚠️  Collisions: ${collisions}. Retrying next pass...`);
    } else {
      break;
    }
  }

  console.log("Done. Backfill complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
