import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { prisma } from "@alveusgg/database";

import { SLUG_REGEX } from "@/utils/slugs";

export const MAX_VISIBLE_ROUNDS_CHECKS = 12;

export const roundsCheckSchema = z.object({
  name: z.string().min(1),
  command: z.string().regex(SLUG_REGEX),
  ambassador: z.string(),
  hidden: z.boolean(),
});

export type RoundsCheckSchema = z.infer<typeof roundsCheckSchema>;

export const existingRoundsCheckSchema = z
  .object({
    id: z.string().cuid(),
  })
  .merge(roundsCheckSchema.partial());

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

  if (input.hidden === false) {
    const existingRoundsChecksVisible = await prisma.roundsCheck.aggregate({
      where: { hidden: false },
      _count: true,
    });
    if (existingRoundsChecksVisible._count >= MAX_VISIBLE_ROUNDS_CHECKS)
      input.hidden = true;
  }

  const existingRoundsChecksOrder = await prisma.roundsCheck.aggregate({
    _max: { order: true },
  });
  return await prisma.roundsCheck.create({
    data: {
      ...input,
      order: (existingRoundsChecksOrder._max.order ?? 0) + 1,
    },
  });
}

export async function editRoundsCheck(
  input: z.infer<typeof existingRoundsCheckSchema>,
) {
  if (typeof input.command === "string") {
    const existingRoundsCheckWithCommand = await prisma.roundsCheck.findFirst({
      where: { command: input.command, id: { not: input.id } },
    });
    if (existingRoundsCheckWithCommand)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Command already exists",
      });
  }

  if (input.hidden === false) {
    const existingRoundsChecksVisible = await prisma.roundsCheck.aggregate({
      where: { hidden: false, id: { not: input.id } },
      _count: true,
    });
    if (existingRoundsChecksVisible._count >= MAX_VISIBLE_ROUNDS_CHECKS)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Maximum number of visible rounds checks reached",
      });
  }

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
