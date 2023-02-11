import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export type RaffleEntry = z.infer<typeof raffleEntrySchema>;

export const raffleEntrySchema = z.object({
  raffleId: z.string(),
  givenName: z.string(),
  familyName: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string(),
  // country, state, postal code etc.
  // TODO: check if country is in country list?!
});

export const rafflesRouter = router({
  enterRaffle: protectedProcedure
    .input(raffleEntrySchema)
    .mutation(async ({ ctx, input }) => {
      // Find raffle
      const raffle = await ctx.prisma.raffle.findUnique({
        where: {
          id: input.raffleId,
        },
      });

      const now = new Date();
      if (
        !raffle ||
        // Check raffle is still active:
        !raffle.active ||
        raffle.startAt > now ||
        (raffle.endAt && raffle.endAt < now)
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "raffle not found",
        });
      }

      const userId = ctx.session.user.id;
      // Check use has not entered already
      const existingEntry = await ctx.prisma.raffleEntry.findUnique({
        where: {
          raffleId_userId: {
            raffleId: raffle.id,
            userId,
          },
        },
      });
      if (existingEntry) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "entry already submitted",
        });
      }

      // Insert entry
      await ctx.prisma.raffleEntry.create({
        data: {
          raffle: { connect: { id: raffle.id } },
          user: { connect: { id: userId } },
          mailingAddress: {
            create: {
              addressLine1: input.addressLine1,
              addressLine2: input.addressLine2,
              city: "Austin", // TODO
              state: "Texas", // TODO
              postalCode: "1234", // TODO
              country: "USA", // TODO
            },
          },
        },
      });

      // TODO: Call webhook
    }),
});
