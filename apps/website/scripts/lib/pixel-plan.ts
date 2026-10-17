import { z } from "zod";

import { DonatorSchema } from "@alveusgg/donations-core";
import {
  determineNumberOfPixels,
  hashPixelIdentifier,
} from "@alveusgg/donations-core/pixels";

import { canonical, fingerprint } from "./backfill";

const DateValue = z.coerce.date();
export const PlannedPixel = z.strictObject({
  id: z.string().min(1),
  receivedAt: DateValue,
  renamedAt: DateValue.nullable(),
  donationId: z.string().min(1),
  identifier: z.string(),
  email: z.string().nullable(),
  muralId: z.string().min(1),
  column: z.number().int().nonnegative(),
  row: z.number().int().nonnegative(),
});
export type PlannedPixel = z.output<typeof PlannedPixel>;
export const PixelPlan = z.strictObject({
  version: z.literal(1),
  target: z.string().min(1),
  muralId: z.string().min(1),
  columns: z.number().int().positive().max(1000),
  rows: z.number().int().positive().max(1000),
  donations: z
    .array(
      z.strictObject({
        id: z.string().min(1),
        providerUniqueId: z.string().min(1),
        fingerprint: z.string().length(64),
        existingPixelsFingerprint: z.string().length(64),
        pixels: z.array(PlannedPixel),
      }),
    )
    .min(1),
});
export type PixelPlan = z.output<typeof PixelPlan>;

export interface PixelDonation {
  id: string;
  providerUniqueId: string;
  amount: number;
  receivedAt: Date;
  donatedBy: unknown;
  pixels: PlannedPixel[];
}

const coordinate = (p: Pick<PlannedPixel, "column" | "row">) =>
  `${p.column}:${p.row}`;
const pixelFingerprint = (pixels: PlannedPixel[]) =>
  fingerprint([...pixels].sort((a, b) => a.id.localeCompare(b.id)));
const donationFingerprint = ({ pixels: _pixels, ...donation }: PixelDonation) =>
  fingerprint(donation);

export async function pixelIdentity(donation: PixelDonation) {
  const donor = DonatorSchema.parse(donation.donatedBy);
  const identifier =
    donor.primary === "displayName"
      ? donor.displayName
      : donor.primary === "username"
        ? `@${donor.username}`
        : donor.firstName || "Anonymous";
  return {
    identifier,
    email: donor.email ? await hashPixelIdentifier(donor.email) : null,
  };
}

export async function makePixelPlan(
  donations: PixelDonation[],
  occupied: Pick<PlannedPixel, "column" | "row">[],
  config: Pick<PixelPlan, "target" | "muralId" | "columns" | "rows">,
): Promise<PixelPlan> {
  const used = new Set(occupied.map(coordinate));
  const plan: PixelPlan = { version: 1, ...config, donations: [] };
  const total = config.columns * config.rows;
  for (const donation of [...donations].sort((a, b) =>
    a.id.localeCompare(b.id),
  )) {
    const existing = donation.pixels.filter(
      (p) => p.muralId === config.muralId,
    );
    const needed = Math.max(
      0,
      determineNumberOfPixels(donation.amount / 100) - existing.length,
    );
    const pixels: PlannedPixel[] = [];
    const identity = await pixelIdentity(donation);
    for (let i = 0; i < needed; i++) {
      const seed = fingerprint([
        config.muralId,
        donation.id,
        existing.length + i,
      ]);
      const start = parseInt(seed.slice(0, 8), 16) % total;
      let free: { column: number; row: number } | undefined;
      for (let offset = 0; offset < total; offset++) {
        const n = (start + offset) % total;
        const candidate = {
          column: n % config.columns,
          row: Math.floor(n / config.columns),
        };
        if (!used.has(coordinate(candidate))) {
          free = candidate;
          break;
        }
      }
      if (!free) throw new Error("Mural has insufficient free coordinates");
      used.add(coordinate(free));
      pixels.push({
        id: `backfill-${seed}`,
        receivedAt: donation.receivedAt,
        renamedAt: null,
        donationId: donation.id,
        ...identity,
        muralId: config.muralId,
        ...free,
      });
    }
    plan.donations.push({
      id: donation.id,
      providerUniqueId: donation.providerUniqueId,
      fingerprint: donationFingerprint(donation),
      existingPixelsFingerprint: pixelFingerprint(existing),
      pixels,
    });
  }
  return plan;
}

export async function checkPixelPlan(
  plan: PixelPlan,
  donations: PixelDonation[],
  occupied: PlannedPixel[],
) {
  const missing: PlannedPixel[] = [];
  const ids = new Set<string>();
  const coordinates = new Set<string>();
  const donationIds = new Set<string>();
  if (plan.donations.length !== donations.length)
    throw new Error("Donation selection changed");
  for (const entry of plan.donations) {
    if (donationIds.has(entry.id))
      throw new Error("Duplicate donation in plan");
    donationIds.add(entry.id);
    const donation = donations.find((d) => d.id === entry.id);
    if (
      !donation ||
      donation.providerUniqueId !== entry.providerUniqueId ||
      donationFingerprint(donation) !== entry.fingerprint
    ) {
      throw new Error("Donation content changed; review a new plan");
    }
    const identity = await pixelIdentity(donation);
    const plannedIds = new Set(entry.pixels.map((p) => p.id));
    const baseline = donation.pixels.filter(
      (p) => p.muralId === plan.muralId && !plannedIds.has(p.id),
    );
    if (pixelFingerprint(baseline) !== entry.existingPixelsFingerprint)
      throw new Error("Existing pixels changed");
    const needed = Math.max(
      0,
      determineNumberOfPixels(donation.amount / 100) - baseline.length,
    );
    if (entry.pixels.length !== needed)
      throw new Error("Pixel entitlement does not match plan");
    for (const pixel of entry.pixels) {
      const key = coordinate(pixel);
      if (
        ids.has(pixel.id) ||
        coordinates.has(key) ||
        pixel.donationId !== donation.id ||
        pixel.muralId !== plan.muralId ||
        pixel.column >= plan.columns ||
        pixel.row >= plan.rows ||
        pixel.identifier !== identity.identifier ||
        pixel.email !== identity.email ||
        pixel.renamedAt !== null ||
        pixel.receivedAt.getTime() !== donation.receivedAt.getTime()
      )
        throw new Error("Invalid reviewed pixel");
      ids.add(pixel.id);
      coordinates.add(key);
      const existing = occupied.find((p) => p.id === pixel.id);
      const occupant = occupied.find(
        (p) => p.muralId === plan.muralId && coordinate(p) === key,
      );
      if (occupant && occupant.id !== pixel.id)
        throw new Error("Reviewed coordinate is occupied");
      if (existing && canonical(existing) !== canonical(pixel))
        throw new Error("Reviewed pixel changed");
      if (!existing) missing.push(pixel);
    }
  }
  return missing;
}
