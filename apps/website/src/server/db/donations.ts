import { type Prisma, prisma } from "@alveusgg/database";

import type { Donation, Donator, Pixel } from "@alveusgg/donations-core";

export async function createDonations(input: Donation[]) {
  return prisma.donation.createMany({
    data: input,
  });
}

export async function getPublicPixels(muralId?: string) {
  return prisma.pixel.findMany({
    where: { muralId: muralId },
    select: {
      identifier: true,
      email: true,
      receivedAt: true,
      column: true,
      row: true,
    },
  });
}

export type PublicPixel = Awaited<ReturnType<typeof getPublicPixels>>[number];

export async function getDonationFeed({
  take,
  cursor,
  onlyPixels = false,
}: {
  take?: number;
  cursor?: string;
  onlyPixels?: boolean;
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
        note: true,
        _count: {
          select: { pixels: true },
        },
      },
      take: take,
      cursor: cursor ? { id: cursor } : undefined,
      where: onlyPixels
        ? {
            pixels: {
              some: {},
            },
          }
        : undefined,
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
      pixels: donation._count.pixels,
      note: donation.note,
      tags: {
        campaign: tags.campaign,
        twitchBroadcasterId: tags.twitchBroadcasterId,
      },
    };
  });
}

export function getPixels(muralId: string) {
  return prisma.pixel.findMany({
    where: { muralId: muralId },
  });
}

export async function createPixels(input: Omit<Pixel, "data">[]) {
  return prisma.pixel.createMany({
    data: input.map(
      (pixel) =>
        ({
          id: pixel.id,
          muralId: pixel.muralId,
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
