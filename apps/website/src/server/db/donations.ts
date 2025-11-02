import type { User } from "next-auth";

import { type Prisma, prisma } from "@alveusgg/database";

import type { Donation, Donator, Pixel } from "@alveusgg/donations-core";

import type { PayPalVerification } from "@/components/institute/EditPayPalPixels";

import { getTwitchUserId } from "./users";

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

export function getPixelLeaderboard(muralId: string, take: number = 10) {
  return prisma.pixel.groupBy({
    by: ["identifier", "email"],
    where: {
      muralId: muralId,
    },
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: "desc",
      },
    },
    take: take,
  });
}

function filterDonationByTwitchUserId<T extends string>(twitchUserId: T) {
  if (!twitchUserId) {
    throw new Error("Twitch user ID is required for Twitch donations filter");
  }

  return {
    provider: "twitch",
    providerMetadata: {
      path: "$.twitchDonatorId",
      equals: twitchUserId,
    },
  } as const satisfies Prisma.DonationWhereInput;
}

function filterDonationByPayPalEmail<T extends string>(emailAddress: T) {
  if (!emailAddress) {
    throw new Error("Email address is required for PayPal donations filter");
  }

  return {
    provider: "paypal",
    donatedBy: {
      path: "$.email",
      equals: emailAddress,
    },
  } as const satisfies Prisma.DonationWhereInput;
}

function filterDonationByPayPalVerification(verification: PayPalVerification) {
  return {
    AND: [
      { provider: "paypal" },
      {
        donatedBy: {
          path: "$.email",
          equals: verification.email,
        },
      },
      {
        donatedBy: {
          path: "$.lastName",
          equals: verification.lastName,
        },
      },
      {
        donatedBy: {
          path: "$.firstName",
          equals: verification.firstName,
        },
      },
    ],
  } as const satisfies Prisma.DonationWhereInput;
}

export type PixelWithDonation = Awaited<
  ReturnType<typeof getFilteredPixelsByDonation>
>[number];

async function getFilteredPixelsByDonation(
  muralId: string,
  filters: Prisma.DonationWhereInput[],
  pixelId?: string,
) {
  if (filters.length === 0) {
    return [];
  }

  return prisma.pixel.findMany({
    select: {
      id: true,
      identifier: true,
      column: true,
      row: true,
      renamedAt: true,
      donationId: true,
      receivedAt: true,
      muralId: true,
      donation: {
        select: {
          provider: true,
        },
      },
    },
    where: {
      muralId: muralId,
      ...(pixelId ? { id: pixelId } : undefined),
      donation: {
        OR: filters,
      },
    },
    orderBy: {
      receivedAt: "asc",
    },
  });
}

export async function getPayPalPixelsByVerification(
  muralId: string,
  verification: PayPalVerification,
  pixelId?: string,
) {
  return getFilteredPixelsByDonation(
    muralId,
    [filterDonationByPayPalVerification(verification)],
    pixelId,
  );
}

export async function getMyPixels(
  muralId: string,
  user: User,
  pixelId?: string,
) {
  const filters: Prisma.DonationWhereInput[] = [];

  const twitchUserId = await getTwitchUserId(user.id);
  if (twitchUserId) {
    filters.push(filterDonationByTwitchUserId(twitchUserId));
  }

  const emailAddress = user.email;
  if (emailAddress) {
    filters.push(filterDonationByPayPalEmail(emailAddress));
  }

  return getFilteredPixelsByDonation(muralId, filters, pixelId);
}

export async function renamePixel(id: string, identifier: string) {
  await prisma.pixel.update({
    select: { id: true },
    where: { id },
    data: {
      identifier,
      renamedAt: new Date(),
    },
  });
}
