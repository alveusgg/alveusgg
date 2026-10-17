import { readFileSync } from "node:fs";

import { type Prisma, prisma } from "@alveusgg/database";

import { PIXEL_GRID_HEIGHT, PIXEL_GRID_WIDTH, isMuralId } from "@/data/murals";

import {
  databaseTarget,
  onlyArgs,
  parseArgs,
  readIds,
  required,
  sha256,
  writePrivateJson,
} from "./lib/backfill";
import {
  PixelPlan,
  PlannedPixel,
  checkPixelPlan,
  makePixelPlan,
} from "./lib/pixel-plan";

let databaseUsed = false;

async function getDonations(
  ids: string[],
  db: Prisma.TransactionClient = prisma,
) {
  databaseUsed = true;
  const rows = await db.donation.findMany({
    where: { providerUniqueId: { in: ids } },
    include: { pixels: true },
  });
  if (rows.length !== ids.length)
    throw new Error("Some selected donations are missing");
  return rows.map((d) => ({
    ...d,
    pixels: d.pixels
      .filter((p) => p.muralId !== null)
      .map((p) => PlannedPixel.parse(p)),
  }));
}

async function getOccupied(
  muralId: string,
  pixelIds: string[] = [],
  db: Prisma.TransactionClient = prisma,
) {
  return (
    await db.pixel.findMany({
      where: { OR: [{ muralId }, { id: { in: pixelIds } }] },
    })
  ).map((p) => PlannedPixel.parse(p));
}

async function main() {
  const args = parseArgs();
  onlyArgs(args, [
    "help",
    "dry-run",
    "apply",
    "provider-unique-ids",
    "mural",
    "plan-out",
    "plan",
    "confirm-sha",
    "confirm-target",
  ]);
  if (args.has("help")) {
    console.log(
      "Plan (read-only): --provider-unique-ids=ids.json --mural=two --plan-out=private-plan.json\nApply: --apply --plan=private-plan.json --confirm-sha=SHA256 --confirm-target=HOST/DATABASE",
    );
    return;
  }
  const target = databaseTarget();
  if (!args.has("apply")) {
    if (
      args.has("plan") ||
      args.has("confirm-sha") ||
      args.has("confirm-target")
    )
      throw new Error("Apply arguments require --apply");
    const ids = readIds(required(args, "provider-unique-ids"));
    const muralId = required(args, "mural");
    if (!isMuralId(muralId)) throw new Error("Unknown mural");
    const plan = await makePixelPlan(
      await getDonations(ids),
      await getOccupied(muralId),
      {
        target,
        muralId,
        columns: PIXEL_GRID_WIDTH,
        rows: PIXEL_GRID_HEIGHT,
      },
    );
    writePrivateJson(required(args, "plan-out"), plan);
    console.log(
      JSON.stringify({
        mode: "read-only",
        donations: plan.donations.length,
        pixels: plan.donations.reduce((n, d) => n + d.pixels.length, 0),
        sha256: sha256(readFileSync(required(args, "plan-out"))),
      }),
    );
    return;
  }
  if (
    args.get("apply") !== "true" ||
    ["dry-run", "provider-unique-ids", "mural", "plan-out"].some((k) =>
      args.has(k),
    )
  ) {
    throw new Error("Apply accepts only a reviewed plan and confirmations");
  }
  const bytes = readFileSync(required(args, "plan"));
  if (sha256(bytes) !== required(args, "confirm-sha"))
    throw new Error("Plan hash does not match");
  const plan = PixelPlan.parse(JSON.parse(bytes.toString("utf8")));
  if (
    plan.target !== target ||
    required(args, "confirm-target") !== target ||
    !isMuralId(plan.muralId) ||
    plan.columns !== PIXEL_GRID_WIDTH ||
    plan.rows !== PIXEL_GRID_HEIGHT
  )
    throw new Error("Plan target changed");
  const ids = plan.donations.map((d) => d.providerUniqueId);
  const pixelIds = plan.donations.flatMap((d) => d.pixels.map((p) => p.id));
  // Check and insert in one transaction; a collision rolls the entire batch back.
  // No notification APIs, queues, updates, deletes or skipDuplicates.
  databaseUsed = true;
  const inserted = await prisma.$transaction(
    async (tx) => {
      const missing = await checkPixelPlan(
        plan,
        await getDonations(ids, tx),
        await getOccupied(plan.muralId, pixelIds, tx),
      );
      if (missing.length) await tx.pixel.createMany({ data: missing });
      const remaining = await checkPixelPlan(
        plan,
        await getDonations(ids, tx),
        await getOccupied(plan.muralId, pixelIds, tx),
      );
      if (remaining.length) throw new Error("Pixel verification incomplete");
      return missing.length;
    },
    { isolationLevel: "Serializable" },
  );
  console.log(
    JSON.stringify({
      mode: "applied",
      inserted,
      verified: pixelIds.length,
      cacheRefreshRequired: true,
    }),
  );
}

main()
  .catch(() => {
    console.error(
      "Pixel backfill stopped. Check the private plan and database state; existing rows are never overwritten.",
    );
    process.exitCode = 1;
  })
  .finally(() => (databaseUsed ? prisma.$disconnect() : undefined));
