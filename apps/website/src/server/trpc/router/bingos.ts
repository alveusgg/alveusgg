import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createEntry,
  findActiveBingo,
  getBingoEntry,
} from "@/server/db/bingos";
import { protectedProcedure, router } from "@/server/trpc/trpc";

import {
  calcBingoConfig,
  checkHasBingo,
  parseBingoPlayData,
} from "@/utils/bingo";

//  TODO: Do we want to send a webhook when a user enters a bingo and/or a bingo is claimed?
//import {
//  type OutgoingWebhookType,
//  triggerOutgoingWebhook,
//} from "@/server/outgoing-webhooks";
//
//if (bingo.outgoingWebhookUrl) {
//  try {
//    // Trigger webhook
//    const webhook = await triggerOutgoingWebhook({
//      url: bingo.outgoingWebhookUrl,
//      type: "bingo-entry",
//      userId,
//      body: JSON.stringify({
//        type: "bingo-entry" as OutgoingWebhookType,
//        data: {
//          id: entry.id,
//          bingoId: bingo.id,
//          username: entry.user.name,
//          email: entry.user.email,
//          createdAt: entry.createdAt,
//        },
//      }),
//    });
//
//    // connect the outgoing webhook to the entry
//    await ctx.prisma.bingoEntry.update({
//      where: { id: entry.id },
//      data: {
//        outgoingWebhook: { connect: { id: webhook.id } },
//      },
//    });
//  } catch (e) {
//    // ignore failed outgoing webhooks for now
//  }
//}

export const bingosRouter = router({
  getMyEntry: protectedProcedure
    .input(
      z.object({
        bingoId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const entry = await getBingoEntry(ctx.session.user.id, input.bingoId);
      if (!entry) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Entry not found" });
      }
      return entry;
    }),

  claimBingo: protectedProcedure
    .input(
      z.object({
        bingoId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const bingo = await findActiveBingo(input.bingoId);
      if (!bingo) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Bingo not found" });
      }

      const existingEntry = await getBingoEntry(userId, bingo.id);
      if (!existingEntry) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Entry not found",
        });
      }

      const config = calcBingoConfig(bingo.config);
      const card = config.cards[existingEntry.permutation];
      if (!card) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid permutation",
        });
      }

      const playData = parseBingoPlayData(bingo.playData);
      if (checkHasBingo(card, playData.calledValues, true)) {
        await ctx.prisma.bingoEntry.update({
          where: { id: existingEntry.id },
          data: { claimedAt: new Date() },
        });
      }
    }),

  enterBingo: protectedProcedure
    .input(
      z.object({
        bingoId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const bingo = await findActiveBingo(input.bingoId);
      if (!bingo) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Bingo not found" });
      }

      const config = calcBingoConfig(bingo.config);
      const publicBingo = {
        id: bingo.id,
        label: bingo.label,
        type: bingo.type,
        config,
      };

      const existingEntry = await getBingoEntry(userId, bingo.id);
      if (existingEntry) {
        return {
          entry: existingEntry,
          bingo: publicBingo,
        };
      }

      const entry = await createEntry(
        userId,
        bingo.id,
        {},
        { numberOfCards: config.numberOfCards },
      );

      return {
        bingo: publicBingo,
        entry,
      };
    }),
});
