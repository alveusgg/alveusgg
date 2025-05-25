import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { prisma } from "@alveusgg/database";

import { SLUG_REGEX } from "@/utils/slugs";

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

  const existingRoundsCheckOrderMax = await prisma.roundsCheck.aggregate({
    _max: { order: true },
  });
  const order = existingRoundsCheckOrderMax._max.order ?? 0;

  return await prisma.roundsCheck.create({
    data: {
      ...input,
      order: order + 1,
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
