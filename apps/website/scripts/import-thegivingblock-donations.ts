import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { createId } from "@paralleldrive/cuid2";

import { prisma } from "@alveusgg/database";

import {
  type TheGivingBlockDonation,
  TheGivingBlockDonationMetadataSchema,
} from "@alveusgg/donations-core";

// CLI Arguments
const dryRun = process.argv.includes("--dry-run");
const verbose = process.argv.includes("--verbose");
const help = process.argv.includes("--help");

function printUsageHint() {
  console.error(
    "Usage: pnpm run murals:import-thegivingblock-donations [--help] [--dry-run] [--verbose] <file> [campaign]",
  );
}

if (help) {
  printUsageHint();
  process.exit(1);
}

const expectedColumns = [
  "Transaction ID",
  "Transaction Date",
  "Transaction Time",
  "Organization Name",
  "Donation Amount",
  "Donation Method",
  "Gross Amount USD",
  "Fixed Fee",
  "Net Amount USD",
  "Donor Name",
  "Donor Email",
  "Transaction Note",
  "Campaign ID",
  "Donor Country",
  "Donation Notes",
  "Anonymous Donation",
  "Gross Amount in Payout Currency",
  "Transaction Fee Covered",
  "Honoree Name",
  "Processor Transaction ID",
  "Crypto Payout Amount",
  "Crypto Payout Date",
  "Converted To USD",
  "Value At Donation Time",
  "Percentage Fee",
  "UUID",
] as const;

function safeAccess(
  tupel: string[],
  column: (typeof expectedColumns)[number],
): string {
  return tupel[expectedColumns.indexOf(column)]!.trim();
}

const tupleLength = expectedColumns.length;

const isCsvTuple = (arr: string[]) => arr.length === tupleLength;

async function parseCsvLine(line: string) {
  const parts = line.split(",");
  if (!isCsvTuple(parts)) {
    console.warn(
      `Ignoring malformed line (expected ${tupleLength} comma-separated values):`,
      line,
    );
    return null;
  }

  const date = new Date(
    `${safeAccess(parts, "Transaction Date")} ${safeAccess(parts, "Transaction Time")}`,
  );
  if (!date) {
    console.error("Failed to parse date");
  }

  const isAnonymous =
    safeAccess(parts, "Anonymous Donation").toLowerCase() === "yes";

  const res = TheGivingBlockDonationMetadataSchema.safeParse({
    donationMethod: safeAccess(parts, "Donation Method").toLowerCase(),
    processorTransactionId: "",
  });
  if (!res.success) {
    console.error(res.error);
    return null;
  }

  return {
    anonymous: isAnonymous,
    id: safeAccess(parts, "Transaction ID"),
    uuid: safeAccess(parts, "UUID"),
    date,
    name: isAnonymous ? "Anonymous" : safeAccess(parts, "Donor Name"),
    email: safeAccess(parts, "Donor Email"),
    campaignId: safeAccess(parts, "Campaign ID"),
    amount: parseFloat(safeAccess(parts, "Donation Amount")),
    note: safeAccess(parts, "Donation Notes"),
    donationMethod: res.data.donationMethod,
    processorTransactionId: safeAccess(parts, "Processor Transaction ID"),
  } as const;
}

async function main() {
  const fixedArgs = process.argv
    .slice(2)
    .filter((arg) => !arg.startsWith("--") && !arg.startsWith("-"));

  const filePath = fixedArgs[0]?.trim();
  if (!filePath) {
    console.error("Error: filePath is required.");
    printUsageHint();
    process.exit(1);
  }

  const fileContent = readFileSync(resolve(filePath), "utf-8");
  const lines = fileContent.split("\n").filter((l) => l.trim().length > 0);

  console.log(`Found ${lines.length} lines in the CSV file.`);

  let imported = 0;
  let skipped = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (i === 0 || !line) continue;

    const row = await parseCsvLine(line);
    if (!row) continue;

    const amountCents = Math.round(row.amount * 100);
    const txTime = row.date.getTime();

    // Check for duplicates
    // We filter by Amount + Time Window + Specific JSON path for userId
    const windowStart = new Date(txTime - 5 * 60 * 1000);
    const windowEnd = new Date(txTime + 5 * 60 * 1000);
    const duplicate = await prisma.donation.findFirst({
      where: {
        provider: "thegivingblock",
        OR: [
          {
            providerUniqueId: row.id,
          },
          {
            providerUniqueId: row.uuid,
          },
          {
            amount: amountCents,
            receivedAt: {
              gte: windowStart,
              lte: windowEnd,
            },
            donatedBy: {
              path: "$.email",
              equals: row.email,
            },
          },
        ],
      },
    });

    if (duplicate?.receivedAt) {
      const dbDate = duplicate.receivedAt;
      const diffSeconds = Math.abs((dbDate.getTime() - txTime) / 1000);

      if (diffSeconds > 20) {
        console.warn(
          `[FUZZY MATCH] ${row.name} ($${row.amount}) found. ` +
            `Diff: ${diffSeconds.toFixed(1)}s. (CSV: ${row.date.toISOString()} vs DB: ${dbDate.toISOString()})`,
        );
      }

      if (verbose) {
        console.info(
          `Skipping duplicate ${row.name} ($${row.amount}) at ${row.date.toISOString()}`,
        );
      }

      skipped++;
      continue;
    }

    const nameParts = row.name.split(" ");
    const firstName = nameParts
      .slice(0, nameParts.length - 1)
      .join(" ")
      .trim();
    const lastName =
      nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

    const donation: TheGivingBlockDonation = {
      id: createId(),
      provider: "thegivingblock",
      providerUniqueId: row.id, // nonsense
      amount: amountCents,
      donatedAt: row.date,
      receivedAt: row.date,
      note: row.note,
      donatedBy: {
        primary: "firstName",
        firstName,
        lastName,
        email: row.email,
      },
      tags: {},
      providerMetadata: {
        donationMethod: row.donationMethod,
        processorTransactionId: row.processorTransactionId,
      },
    };

    if (verbose) {
      console.log("Inserting donation", donation);
    }

    if (!dryRun) {
      await prisma.donation.create({ data: donation });
    }

    console.log(`Imported: ${row.name} ($${row.amount})`);
    imported++;
  }

  console.log(`\nDone! Imported: ${imported}, Skipped: ${skipped}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
