import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { prisma } from "@alveusgg/database";

import type { BingoPlayData } from "@/utils/bingo";
import { assignCardToUser, bingoConfigSchema, bingoTypes } from "@/utils/bingo";
import { SLUG_REGEX, convertToSlug } from "@/utils/slugs";

export type BingoSchema = z.infer<typeof bingoSchema>;

export const bingoSchema = z.object({
  label: z.string(),
  type: z.literal([...bingoTypes]),
  slug: z.string().regex(SLUG_REGEX).optional(),
  config: bingoConfigSchema,
  startAt: z.date().optional(),
  endAt: z.date().optional(),
});

export const existingBingoSchema = bingoSchema.and(
  z.object({
    id: z.cuid(),
  }),
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const bingoEntrySchema = z.object({});

export async function findActiveBingo(bingoSlugOrId: string) {
  const now = new Date();
  return await prisma.bingo.findFirst({
    where: {
      active: true,
      startAt: { lt: now },
      AND: [
        { OR: [{ endAt: null }, { endAt: { gt: now } }] },
        { OR: [{ id: bingoSlugOrId }, { slug: bingoSlugOrId }] },
      ],
    },
  });
}

export async function getBingoEntry(userId: string, bingoId: string) {
  return prisma.bingoEntry.findUnique({
    where: {
      bingoId_userId: {
        bingoId,
        userId,
      },
    },
  });
}

export async function createEntry(
  userId: string,
  bingoId: string,
  input: z.infer<typeof bingoEntrySchema>,
  {
    numberOfCards = 50,
  }: {
    numberOfCards?: number;
  },
) {
  const permutation = await assignCardToUser(userId, numberOfCards, bingoId);

  return prisma.bingoEntry.create({
    select: {
      id: true,
      createdAt: true,
      user: true,
      permutation: true,
    },
    data: {
      permutation,
      bingo: { connect: { id: bingoId } },
      user: { connect: { id: userId } },
    },
  });
}

export async function getAllEntriesForBingo(bingoId: string) {
  return await prisma.bingoEntry.findMany({
    where: {
      bingoId: bingoId,
    },
    include: {
      user: true,
    },
  });
}

export async function createBingo(input: z.infer<typeof bingoSchema>) {
  const slug = convertToSlug(input.slug || input.label);
  const existingBingoWithSlug = await prisma.bingo.findFirst({
    where: { slug },
  });
  if (existingBingoWithSlug)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Slug already exists",
    });

  return await prisma.bingo.create({
    data: {
      ...input,
      slug,
      config: JSON.stringify(input.config),
      playData: JSON.stringify({ calledValues: [] } satisfies BingoPlayData),
    },
  });
}

export async function editBingo(input: z.infer<typeof existingBingoSchema>) {
  const slug = convertToSlug(input.slug || input.label);
  const existingBingoWithSlug = await prisma.bingo.findFirst({
    where: { slug, id: { not: input.id } },
  });
  if (existingBingoWithSlug)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Slug already exists",
    });

  const { id, config, ...data } = input;
  const [res] = await Promise.all([
    prisma.bingo.update({
      where: { id: id },
      data: { ...data, slug, config: JSON.stringify(config) },
    }),
    prisma.bingoEntry.updateMany({
      where: { bingoId: id },
      data: { claimedAt: null },
    }),
  ]);

  return res;
}
