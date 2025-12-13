import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { default as env } from "@next/env";
import { createId } from "@paralleldrive/cuid2";

import { prisma } from "@alveusgg/database";

import { channels } from "@/data/twitch";

const basePath = resolve(fileURLToPath(import.meta.url), "../../");
env.loadEnvConfig(basePath, false);

const BROADCASTER_ID = channels.alveus.id;

const isCsvTuple = (
  arr: string[],
): arr is [string, string, string, string, string] => arr.length >= 5;

function parseCsvLine(line: string) {
  const parts = line.split(",");
  if (!isCsvTuple(parts)) return null;

  const [dateStr, campaignId, userId, name, amountStr] = parts;

  return {
    date: new Date(dateStr.trim()),
    campaignId: campaignId.trim(),
    userId: userId.trim(),
    name: name.trim(),
    amount: parseFloat(amountStr.trim()),
  } as const;
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error(
      "Usage: pnpm run murals:import-twitch-charity-donations <file>",
    );
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

    const row = parseCsvLine(line);
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

    if (duplicate && duplicate.receivedAt) {
      const dbDate = duplicate.receivedAt;
      const diffSeconds = Math.abs((dbDate.getTime() - txTime) / 1000);

      if (diffSeconds > 20) {
        console.warn(
          `[FUZZY MATCH] ${row.name} ($${row.amount}) found. ` +
            `Diff: ${diffSeconds.toFixed(1)}s. (CSV: ${row.date.toISOString()} vs DB: ${dbDate.toISOString()})`,
        );
      }
      skipped++;
      continue;
    }

    await prisma.donation.create({
      data: {
        id: createId(),
        provider: "twitch",
        providerUniqueId: `${row.campaignId}-${row.userId}-${row.date.toISOString()}`,
        amount: amountCents,
        donatedAt: row.date,
        receivedAt: row.date,
        note: "",
        donatedBy: {
          primary: "username",
          username: row.name,
        },
        tags: {
          twitchBroadcasterId: BROADCASTER_ID,
          twitchCharityCampaignId: row.campaignId,
        },
        providerMetadata: {
          twitchDonatorId: row.userId,
          twitchBroadcasterId: BROADCASTER_ID,
          twitchCharityCampaignId: row.campaignId,
          twitchDonatorDisplayName: row.name,
        },
      },
    });

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
