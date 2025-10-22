import { type Prisma, prisma } from "@alveusgg/database";

import type { Donation, Donator, Pixel } from "@alveusgg/donations-core";

export async function createDonations(input: Donation[]) {
  return prisma.donation.createMany({
    data: input,
  });
}

export async function getPixels() {
  return prisma.pixel.findMany();
}

export async function getPublicDonations({
  take,
  cursor,
}: {
  take?: number;
  cursor?: string;
} = {}) {
  return (
    await prisma.donation.findMany({
      select: {
        id: true,
        provider: true,
        amount: true,
        receivedAt: true,
        donatedAt: true,
        donatedBy: true,
        tags: true,
        pixels: {
          select: { identifier: true, column: true, row: true },
        },
      },
      take: take,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        receivedAt: "desc",
      },
    })
  ).map((donation) => {
    // Enrich underlying database json types with the core types
    // That can be baked into the database schema in the future
    // with prisma-json-types-generator.
    const donatedBy = donation.donatedBy as Donator;
    const tags = (donation.tags || {}) as Record<string, string>;

    return {
      id: donation.id,
      identifier: donatedBy[donatedBy.primary] ?? "Anonymous",
      amount: donation.amount,
      donatedAt: donation.donatedAt ?? donation.receivedAt,
      provider: donation.provider,
      pixels: donation.pixels,
      tags: {
        campaign: tags.campaign,
        twitchBroadcasterId: tags.twitchBroadcasterId,
      },
    };
  });
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
