import { type Prisma, prisma } from "@alveusgg/database";

import type { Donation, Pixel } from "@alveusgg/donations-core";

export async function createDonations(input: Donation[]) {
  return prisma.donation.createMany({
    data: input,
  });
}

export async function getDonations(input: { take?: number; skip?: number }) {
  const results = await prisma.donation.findMany({
    take: input.take,
    skip: input.skip,
  });

  // Enrich underlying database json types with the core types
  // That can be baked into the database schema in the future
  // with prisma-json-types-generator.
  return results as Array<(typeof results)[number] & Donation>;
}

export async function createPixels(input: Omit<Pixel, "data">[]) {
  return prisma.pixel.createMany({
    data: input.map(
      (pixel) =>
        ({
          id: pixel.id,
          receivedAt: pixel.receivedAt,
          donationId: pixel.donationId,
          identifier: pixel.identifier,
          email: pixel.email,
          column: pixel.column,
          row: pixel.row,
        }) satisfies Prisma.PixelCreateManyInput,
    ),
  });
}
