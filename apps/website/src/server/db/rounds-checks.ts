import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  type ActiveAmbassadorKey,
  isActiveAmbassadorKey,
} from "@alveusgg/data/build/ambassadors/filters";

import { prisma } from "@alveusgg/database";

import {
  checkAndFixUploadedImageFileStorageObject,
  deleteFileStorageObject,
} from "@/server/utils/file-storage";

import { SLUG_REGEX } from "@/utils/slugs";

const MAX_VISIBLE_ROUNDS_CHECKS = 12;

const roundsCheckSchemaBase = z.object({
  name: z.string().min(1),
  command: z.string().regex(SLUG_REGEX),
  hidden: z.boolean(),
});

const roundsCheckSchemaImage = z.union([
  z.object({
    ambassador: z.custom<ActiveAmbassadorKey>(
      (value) => typeof value === "string" && isActiveAmbassadorKey(value),
      "must be a valid active ambassador key",
    ),
    fileStorageObjectId: z.null(),
  }),
  z.object({
    ambassador: z.null(),
    fileStorageObjectId: z.cuid(),
  }),
]);

export const roundsCheckSchema = roundsCheckSchemaBase.and(
  roundsCheckSchemaImage,
);
export type RoundsCheckSchema = z.infer<typeof roundsCheckSchema>;

const existingRoundsCheckSchemaBase = z
  .object({
    id: z.cuid(),
  })
  .and(roundsCheckSchemaBase.partial());

export const existingRoundsCheckSchema = z.union([
  existingRoundsCheckSchemaBase.and(roundsCheckSchemaImage),
  existingRoundsCheckSchemaBase,
]);

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

  if (input.fileStorageObjectId) {
    const { error } = await checkAndFixUploadedImageFileStorageObject(
      input.fileStorageObjectId,
    );
    if (error) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Error checking file storage object: ${error}`,
      });
    }
  }

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
  const { id, ...data } = input;

  const existingRoundsCheck = await prisma.roundsCheck.findUnique({
    where: { id },
  });
  if (!existingRoundsCheck) throw new TRPCError({ code: "NOT_FOUND" });

  if (typeof data.command === "string") {
    const existingRoundsCheckWithCommand = await prisma.roundsCheck.findFirst({
      where: { command: data.command, id: { not: id } },
    });
    if (existingRoundsCheckWithCommand)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Command already exists",
      });
  }

  if (data.hidden === false) {
    const existingRoundsChecksVisible = await prisma.roundsCheck.aggregate({
      where: { hidden: false, id: { not: id } },
      _count: true,
    });
    if (existingRoundsChecksVisible._count >= MAX_VISIBLE_ROUNDS_CHECKS)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Maximum number of visible rounds checks reached",
      });
  }

  if ("fileStorageObjectId" in data) {
    // If there was previously a file storage object, and it has now changed,
    // we need to remove it from storage.
    if (
      existingRoundsCheck.fileStorageObjectId &&
      existingRoundsCheck.fileStorageObjectId !== data.fileStorageObjectId
    ) {
      await deleteFileStorageObject(existingRoundsCheck.fileStorageObjectId);
    }

    if (data.fileStorageObjectId) {
      const { error } = await checkAndFixUploadedImageFileStorageObject(
        data.fileStorageObjectId,
      );
      if (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Error checking file storage object: ${error}`,
        });
      }
    }
  }

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
