import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { createId } from "@paralleldrive/cuid2";

import { prisma } from "@alveusgg/database";

import type { TwitchDonation } from "@alveusgg/donations-core";

import { getUserByName } from "@/server/apis/twitch";

import { channels, isChannel } from "@/data/twitch";

// CLI Arguments
const dryRun = process.argv.includes("--dry-run");
const verbose = process.argv.includes("--verbose");
const help = process.argv.includes("--help");

function printUsageHint() {
  console.error(
    "Usage: pnpm run murals:import-twitch-charity-donations [--help] [--channel=CHANNEL] [--dry-run] [--verbose] <file> <campaignId>",
  );
}

if (help) {
  printUsageHint();
  process.exit(1);
}

const channelName =
  process.argv.find((arg) => arg.startsWith("--channel="))?.split("=")[1] ||
  "alveus";

if (!isChannel(channelName)) {
  console.error(
    `Invalid channel specified: ${channelName}. Available options: ${Object.keys(
      channels,
    ).join(", ")}`,
  );
  process.exit(1);
}
const channelId = channels[channelName].id;

const tupleLength = 3;

const isCsvTuple = (arr: string[]): arr is [string, string, string] =>
  arr.length === tupleLength;

async function parseCsvLine(line: string) {
  const parts = line.split(",");
  if (!isCsvTuple(parts)) {
    console.warn(
      `Ignoring malformed line (expected ${tupleLength} comma-separated values):`,
      line,
    );
    return null;
  }

  const [dateStr, name, amountStr] = parts;

  const user = await getUserByName(name.trim());
  if (!user) {
    console.error("User not found for name:", name);
    return null;
  }

  return {
    date: new Date(dateStr.trim()),
    userId: user.id,
    name: user.login,
    displayName: user.display_name,
    amount: parseFloat(amountStr.trim()),
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

  const campaignId = fixedArgs[1]?.trim();
  if (!campaignId) {
    console.error("Error: campaignId is required.");
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
        amount: amountCents,
        provider: "twitch",
        receivedAt: {
          gte: windowStart,
          lte: windowEnd,
        },
        providerMetadata: {
          path: "$.twitchDonatorId",
          equals: row.userId,
        },
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

    const donation: TwitchDonation = {
      id: createId(),
      provider: "twitch",
      providerUniqueId: `${campaignId}-${row.userId}-${row.date.toISOString()}`,
      amount: amountCents,
      donatedAt: row.date,
      receivedAt: row.date,
      note: "",
      donatedBy: {
        primary: "displayName",
        displayName: row.displayName,
        username: row.name,
      },
      tags: {
        twitchBroadcasterId: channelId,
        twitchCharityCampaignId: campaignId,
      },
      providerMetadata: {
        twitchDonatorId: row.userId,
        twitchBroadcasterId: channelId,
        twitchCharityCampaignId: campaignId,
        twitchDonatorDisplayName: row.displayName,
      },
    };

    if (dryRun) {
      console.log("Inserting donation", donation);
    } else {
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
