import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { isValidCountryCode } from "../../../utils/countries";
import { router, protectedProcedure } from "../trpc";

export const raffleEntrySchema = z.object({
  raffleId: z.string().cuid(),
  givenName: z.string().min(1),
  familyName: z.string().min(1),
  addressLine1: z.string().min(1),
  addressLine2: z.string(), // second address line may be empty
  postalCode: z.string().min(1),
  city: z.string().min(1),
  country: z.custom<string>(isValidCountryCode),
  state: z.string(), // state may be left empty
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
          givenName: input.givenName,
          familyName: input.familyName,
          mailingAddress: {
            create: {
              addressLine1: input.addressLine1,
              addressLine2: input.addressLine2,
              city: input.city,
              state: input.state,
              postalCode: input.postalCode,
              country: input.country,
            },
          },
        },
      });

      // TODO: Call webhook
    }),
});
