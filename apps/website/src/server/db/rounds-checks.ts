import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { prisma } from "@alveusgg/database";

import { SLUG_REGEX } from "@/utils/slugs";

export const MAX_ROUNDS_CHECKS = 12;

export const roundsCheckSchema = z.object({
  name: z.string().min(1),
  command: z.string().regex(SLUG_REGEX),
  ambassador: z.string(),
});

export type RoundsCheckSchema = z.infer<typeof roundsCheckSchema>;

export const existingRoundsCheckSchema = roundsCheckSchema.and(
  z.object({
    id: z.string().cuid(),
  }),
);

export async function createRoundsCheck(
  input: z.infer<typeof roundsCheckSchema>,
) {
  const existingRoundsCheckWithCommand = await prisma.roundsCheck.findFirst({
    where: { command: input.command },
  });
  if (existingRoundsCheckWithCommand)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Command already exists",
    });

  const existingRoundsChecksStats = await prisma.roundsCheck.aggregate({
    _count: true,
    _max: { order: true },
  });
  if (existingRoundsChecksStats._count >= MAX_ROUNDS_CHECKS)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Maximum number of rounds checks reached",
    });

  return await prisma.roundsCheck.create({
    data: {
      ...input,
      order: (existingRoundsChecksStats._max.order ?? 0) + 1,
    },
  });
}

export async function editRoundsCheck(
  input: z.infer<typeof existingRoundsCheckSchema>,
) {
  const existingRoundsCheckWithCommand = await prisma.roundsCheck.findFirst({
    where: { command: input.command, id: { not: input.id } },
  });
  if (existingRoundsCheckWithCommand)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Command already exists",
    });

  const { id, ...data } = input;
  return await prisma.roundsCheck.update({
    where: { id },
    data,
  });
}

export async function moveRoundsCheck(id: string, direction: "up" | "down") {
  const roundsCheck = await prisma.roundsCheck.findUnique({
    where: { id },
  });
  if (!roundsCheck) throw new TRPCError({ code: "NOT_FOUND" });

  const targetRoundsCheck = await prisma.roundsCheck.findFirst({
    where: {
      order: {
        [direction === "up" ? "lt" : "gt"]: roundsCheck.order,
      },
    },
    orderBy: { order: direction === "up" ? "desc" : "asc" },
  });
  if (!targetRoundsCheck)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Cannot move rounds check further ${direction}`,
    });

  await prisma.$transaction([
    prisma.roundsCheck.update({
      where: { id: roundsCheck.id },
      data: { order: targetRoundsCheck.order },
    }),
    prisma.roundsCheck.update({
      where: { id: targetRoundsCheck.id },
      data: { order: roundsCheck.order },
    }),
  ]);
}
