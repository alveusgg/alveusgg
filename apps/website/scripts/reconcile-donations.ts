import { readFileSync } from "node:fs";

import { prisma } from "@alveusgg/database";

import {
  DonationManifest,
  DonationRecord,
  databaseTarget,
  onlyArgs,
  parseArgs,
  reconcileDonations,
  required,
  sha256,
  writePrivateJson,
} from "./lib/backfill";

let databaseUsed = false;

async function main() {
  const args = parseArgs();
  onlyArgs(args, ["manifest", "out", "help"]);
  if (args.has("help")) {
    console.log(
      "Read-only: --manifest=verified-donations.json --out=private-report.json",
    );
    return;
  }
  const bytes = readFileSync(required(args, "manifest"));
  const manifest = DonationManifest.parse(JSON.parse(bytes.toString("utf8")));
  const target = databaseTarget();
  databaseUsed = true;
  const rows = await prisma.donation.findMany({
    where: {
      OR: [
        {
          providerUniqueId: {
            in: manifest.donations.map((d) => d.providerUniqueId),
          },
        },
        { id: { in: manifest.donations.map((d) => d.id) } },
      ],
    },
  });
  const actual = rows.map((d) =>
    DonationRecord.parse(JSON.parse(JSON.stringify(d))),
  );
  const result = reconcileDonations(manifest.donations, actual);
  // Parameterized review SQL only. This command has no write mode and no worker API access.
  const reservationTimestamp = new Date().toISOString();
  const reservationReview = result.conflicts.length
    ? null
    : {
        sql:
          "INSERT INTO donations (provider, providerUniqueId, date) VALUES " +
          manifest.donations.map(() => "(?, ?, ?)").join(", ") +
          " ON CONFLICT(providerUniqueId) DO NOTHING",
        params: manifest.donations.flatMap((d) => [
          d.provider,
          d.providerUniqueId,
          reservationTimestamp,
        ]),
      };
  const report = {
    version: 1,
    mode: "read-only",
    target,
    manifestSha256: sha256(bytes),
    ...result,
    missingAmountCents: result.missing.reduce((sum, d) => sum + d.amount, 0),
    reservationReview,
  };
  writePrivateJson(required(args, "out"), report);
  console.log(
    JSON.stringify({
      matching: result.matching.length,
      missing: result.missing.length,
      conflicts: result.conflicts.length,
      manifestSha256: report.manifestSha256,
    }),
  );
  if (result.conflicts.length) process.exitCode = 1;
}

main()
  .catch(() => {
    // Provider records, database errors and validation errors can contain donor data.
    console.error(
      "Reconciliation failed. Check the manifest, database access and output path privately.",
    );
    process.exitCode = 1;
  })
  .finally(() => (databaseUsed ? prisma.$disconnect() : undefined));
