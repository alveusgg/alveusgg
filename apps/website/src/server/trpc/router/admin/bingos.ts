import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { bingoSchema, createBingo, editBingo } from "@/server/db/bingos";
import {
  createCheckPermissionMiddleware,
  protectedProcedure,
  router,
} from "@/server/trpc/trpc";

import { permissions } from "@/data/permissions";

import type { BingoPlayData } from "@/utils/bingo";
import { bingoValueSchema, parseBingoPlayData } from "@/utils/bingo";

const permittedProcedure = protectedProcedure.use(
  createCheckPermissionMiddleware(permissions.manageBingos),
);

export const adminBingosRouter = router({
  createOrEditBingo: permittedProcedure
    .input(
      z
        .discriminatedUnion("action", [
          z.object({ action: z.literal("create") }),
          z.object({ action: z.literal("edit"), id: z.string().cuid() }),
        ])
        .and(bingoSchema),
    )
    .mutation(async ({ input }) => {
      switch (input.action) {
        case "create": {
          const { action: _, ...data } = input;
          await createBingo(data);
          break;
        }
        case "edit": {
          const { action: _, ...data } = input;
          await editBingo(data);
          break;
        }
      }
    }),

  callCell: permittedProcedure
    .input(
      z.object({
        bingoId: z.string().cuid(),
        value: bingoValueSchema,
        status: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const bingo = await ctx.prisma.bingo.findUnique({
        where: { id: input.bingoId },
        select: { playData: true },
      });
      if (!bingo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Bingo not found",
        });
      }

      const playData = parseBingoPlayData(bingo.playData) ?? {
        calledValues: [],
      };
      const values = new Set(playData.calledValues);

      if (input.status) {
        if (!values.has(input.value)) values.add(input.value);
      } else {
        if (values.has(input.value)) values.delete(input.value);
      }

      const newPlayData = {
        ...playData,
        calledValues: Array.from(values),
      } satisfies BingoPlayData;

      await ctx.prisma.bingo.update({
        where: { id: input.bingoId },
        data: {
          playData: JSON.stringify(newPlayData),
        },
      });
    }),

  resetCalledValues: permittedProcedure
    .input(z.string().cuid())
    .mutation(async ({ ctx, input: id }) => {
      const bingo = await ctx.prisma.bingo.findUnique({
        where: { id },
        select: { playData: true },
      });
      if (!bingo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Bingo not found",
        });
      }

      const playData = parseBingoPlayData(bingo.playData) ?? {
        calledValues: [],
      };

      await ctx.prisma.bingo.update({
        where: { id },
        data: {
          playData: JSON.stringify({
            ...playData,
            calledValues: [],
          } satisfies BingoPlayData),
        },
      });
    }),

  deleteBingo: permittedProcedure
    .input(z.string().cuid())
    .mutation(async ({ ctx, input: id }) =>
      ctx.prisma.bingo.delete({ where: { id } }),
    ),

  purgeBingoEntries: permittedProcedure
    .input(z.string().cuid())
    .mutation(async ({ ctx, input: id }) =>
      ctx.prisma.bingoEntry.deleteMany({
        where: {
          bingoId: id,
        },
      }),
    ),

  getBingo: permittedProcedure
    .input(z.string().cuid())
    .query(async ({ ctx, input: id }) =>
      ctx.prisma.bingo.findUnique({
        where: { id },
        include: {
          _count: {
            select: { entries: true },
          },
        },
      }),
    ),

  getBingos: permittedProcedure.query(async ({ ctx }) =>
    ctx.prisma.bingo.findMany({
      include: {
        _count: {
          select: { entries: true },
        },
      },
    }),
  ),

  toggleBingoStatus: permittedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        active: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.bingo.update({
        where: {
          id: input.id,
        },
        data: {
          active: input.active,
        },
      });
    }),

  updateBingoOutgoingWebhookUrl: permittedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        outgoingWebhookUrl: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await Promise.all([
        ctx.prisma.bingo.update({
          where: {
            id: input.id,
          },
          data: {
            outgoingWebhookUrl: input.outgoingWebhookUrl,
          },
        }),
        ctx.prisma.outgoingWebhook.updateMany({
          where: {
            type: "bingo-entry",
          },
          data: {
            url: input.outgoingWebhookUrl,
          },
        }),
      ]);
    }),
});
