import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

import { z } from "zod";

import {
  DonationSchema,
  DonatorSchema,
  Providers,
} from "@alveusgg/donations-core";

export function writePrivateJson(path: string, value: unknown) {
  // Never replace an existing review artifact, or follow an existing symlink.
  writeFileSync(path, JSON.stringify(value, null, 2) + "\n", {
    flag: "wx",
    mode: 0o600,
  });
}

export function sha256(value: string | Buffer) {
  return createHash("sha256").update(value).digest("hex");
}

export function canonical(value: unknown): string {
  if (value instanceof Date) return JSON.stringify(value.toISOString());
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value !== null && typeof value === "object") {
    return `{${Object.entries(value)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

export const fingerprint = (value: unknown) => sha256(canonical(value));

export function databaseTarget(connection = process.env.DATABASE_URL) {
  if (!connection) throw new Error("DATABASE_URL is required");
  const url = new URL(connection);
  // Never include passwords, usernames or URL query parameters in artifacts.
  return `${url.host}${url.pathname}`;
}

export function parseArgs(args = process.argv.slice(2)) {
  const values = new Map<string, string>();
  for (const arg of args) {
    const match = /^--([a-z-]+)(?:=(.*))?$/.exec(arg);
    if (!match?.[1] || values.has(match[1])) {
      throw new Error("Use unique --option=value arguments");
    }
    values.set(match[1], match[2] ?? "true");
  }
  return values;
}

export function required(args: Map<string, string>, name: string) {
  const value = args.get(name);
  if (!value || value === "true")
    throw new Error(`--${name}=value is required`);
  return value;
}

export function onlyArgs(args: Map<string, string>, names: string[]) {
  for (const name of args.keys()) {
    if (!names.includes(name)) throw new Error(`Unknown option --${name}`);
  }
}

export function readIds(path: string) {
  return z
    .array(z.string().min(1))
    .min(1)
    .refine((ids) => new Set(ids).size === ids.length)
    .parse(JSON.parse(readFileSync(path, "utf8")));
}

const IsoDate = z.iso.datetime({ offset: true }).transform((s) => new Date(s));
export const DonationRecord = z
  .strictObject({
    id: z.string().min(1),
    provider: Providers,
    providerUniqueId: z.string().min(1).max(500),
    amount: z.number().int().positive().max(2_147_483_647),
    donatedAt: IsoDate.nullable(),
    receivedAt: IsoDate,
    note: z.string().nullable(),
    donatedBy: DonatorSchema,
    tags: z.record(z.string(), z.string()),
    providerMetadata: z.record(z.string(), z.json()),
  })
  .superRefine((record, ctx) => {
    const valid = DonationSchema.safeParse({
      ...record,
      donatedAt: record.donatedAt ?? undefined,
      note: record.note ?? undefined,
    });
    if (!valid.success)
      ctx.addIssue({
        code: "custom",
        message: "Invalid provider donation metadata",
      });
  });
export type DonationRecord = z.output<typeof DonationRecord>;
export const DonationManifest = z
  .strictObject({
    version: z.literal(1),
    donations: z.array(DonationRecord).min(1).max(1000),
  })
  .superRefine(({ donations }, ctx) => {
    for (const field of ["id", "providerUniqueId"] as const) {
      if (new Set(donations.map((d) => d[field])).size !== donations.length) {
        ctx.addIssue({ code: "custom", message: `Duplicate ${field}` });
      }
    }
  });

// A different database id or receipt time can result from a normal live delivery.
// Compare all source facts, while preserving the row already in the database.
export function donationDifferences(
  expected: DonationRecord,
  actual: DonationRecord,
) {
  return (Object.keys(expected) as (keyof DonationRecord)[]).filter(
    (key) =>
      key !== "id" &&
      key !== "receivedAt" &&
      canonical(expected[key]) !== canonical(actual[key]),
  );
}

export function reconcileDonations(
  expected: DonationRecord[],
  actual: DonationRecord[],
) {
  const byUid = new Map(actual.map((d) => [d.providerUniqueId, d]));
  const byId = new Map(actual.map((d) => [d.id, d]));
  const missing: DonationRecord[] = [];
  const matching: string[] = [];
  const conflicts: { providerUniqueId: string; fields: string[] }[] = [];
  for (const donation of expected) {
    const idMatch = byId.get(donation.id);
    const uidMatch = byUid.get(donation.providerUniqueId);
    if (idMatch && idMatch.providerUniqueId !== donation.providerUniqueId) {
      conflicts.push({
        providerUniqueId: donation.providerUniqueId,
        fields: ["id"],
      });
    } else if (!uidMatch) {
      missing.push(donation);
    } else {
      const fields = donationDifferences(donation, uidMatch);
      if (fields.length)
        conflicts.push({ providerUniqueId: donation.providerUniqueId, fields });
      else matching.push(donation.providerUniqueId);
    }
  }
  return { missing, matching, conflicts };
}

export function importDryRun(args = process.argv.slice(2)) {
  if (args.includes("--apply") && args.includes("--dry-run")) {
    throw new Error("Choose --apply or --dry-run, not both");
  }
  return !args.includes("--apply");
}
