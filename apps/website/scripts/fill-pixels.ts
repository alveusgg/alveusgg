import { createId } from "@paralleldrive/cuid2";

import { prisma } from "@alveusgg/database";

import { DonatorSchema } from "@alveusgg/donations-core";
import {
  DONATION_TOLERANCE,
  PIXEL_PRICE,
  hashPixelIdentifier,
} from "@alveusgg/donations-core/pixels";

import murals from "@/data/murals";

import { typeSafeObjectEntries } from "@/utils/helpers";

// CLI Arguments
const dryRun = process.argv.includes("--dry-run");
const verbose = process.argv.includes("--verbose");
const help = process.argv.includes("--help");
const strictPixelAmounts = process.argv.includes("--strict-amount");

function printUsageHint() {
  console.error(
    "Usage: pnpm run murals:fill-pixels [--help] [--dry-run] [--verbose] [--strict-amount] [--provider=x] [startDateTime] [endDateTime]",
  );
}

if (help) {
  printUsageHint();
  process.exit(1);
}

const provider = process.argv
  .find((arg) => arg.startsWith("--provider="))
  ?.split("=")[1];

const fixedArgs = process.argv
  .slice(2)
  .filter((arg) => !arg.startsWith("--") && !arg.startsWith("-"));

const startDateTimeStr = fixedArgs[0]?.trim();
const endDateTimeStr = fixedArgs[1]?.trim();

// Configuration
const MIN_AMOUNT_CENTS = (PIXEL_PRICE - DONATION_TOLERANCE) * 100;
const MAX_RETRIES = 5; // Number of attempts to resolve collisions

// Mural data
const [muralId, mural] =
  typeSafeObjectEntries(murals).find(([, { type }]) => type === "live") ??
  (["two", murals.two] as const);

const startDateTime = startDateTimeStr
  ? new Date(startDateTimeStr)
  : new Date(mural.startedAt);
const endDateTime = endDateTimeStr
  ? new Date(endDateTimeStr)
  : "endedAt" in mural
    ? new Date(mural.endedAt)
    : new Date();

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
      WHERE d.receivedAt >= '${startDateTime.toISOString()}'
        AND d.receivedAt <= '${endDateTime.toISOString()}'
        AND d.amount > ${MIN_AMOUNT_CENTS}
        ${provider ? `AND provider = '${provider}'` : ""}
        ${strictPixelAmounts ? `AND MOD(d.amount, ${PIXEL_PRICE * 100}) < ${DONATION_TOLERANCE * 100})` : ""}
      HAVING pixelsNeeded > 0
      ORDER BY d.receivedAt
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
      if (donator.primary === "displayName" && donator.displayName) {
        identifier = `@${donator.displayName}`;
      } else if (donator.primary === "username" && donator.username) {
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
          email: donator.email && (await hashPixelIdentifier(donator.email)),
          muralId,
          column: Math.floor(Math.random() * 200),
          row: Math.floor(Math.random() * 50),
        });
      }
    }

    console.log(`> Generated ${pixelsToInsert.length} pixels.`);

    // 4. INSERT
    if (!dryRun) {
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
    } else {
      console.info(
        `Dry run mode - skipping database insert of ${pixelsToInsert.length} pixels.`,
      );

      if (verbose) {
        console.info(pixelsToInsert);
      }

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
