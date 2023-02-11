import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { isValidCountryCode } from "../../../utils/countries";
import {
  type OutgoingWebhookType,
  triggerOutgoingWebhook,
} from "../../actions/outgoing-webhooks";
import { router, protectedProcedure } from "../trpc";

export const giveawayEntrySchema = z.object({
  giveawayId: z.string().cuid(),
  givenName: z.string().min(1),
  familyName: z.string().min(1),
  addressLine1: z.string().min(1),
  addressLine2: z.string(), // second address line may be empty
  postalCode: z.string().min(1),
  city: z.string().min(1),
  country: z.custom<string>(isValidCountryCode),
  state: z.string(), // state may be left empty
});

export const giveawaysRouter = router({
  enterGiveaway: protectedProcedure
    .input(giveawayEntrySchema)
    .mutation(async ({ ctx, input }) => {
      // Find giveaway
      const giveaway = await ctx.prisma.giveaway.findUnique({
        where: {
          id: input.giveawayId,
        },
      });

      const now = new Date();
      if (
        !giveaway ||
        // Check giveaway is still active:
        !giveaway.active ||
        giveaway.startAt > now ||
        (giveaway.endAt && giveaway.endAt < now)
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "giveaway not found",
        });
      }

      const userId = ctx.session.user.id;
      // Check use has not entered already
      const existingEntry = await ctx.prisma.giveawayEntry.findUnique({
        where: {
          giveawayId_userId: {
            giveawayId: giveaway.id,
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
      const entry = await ctx.prisma.giveawayEntry.create({
        include: {
          user: true,
        },
        data: {
          giveaway: { connect: { id: giveaway.id } },
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

      if (giveaway.outgoingWebhookUrl) {
        try {
          // Trigger webhook
          const webhook = await triggerOutgoingWebhook({
            url: giveaway.outgoingWebhookUrl,
            type: "giveaway-entry",
            userId,
            body: JSON.stringify({
              type: "giveaway-entry" as OutgoingWebhookType,
              data: {
                id: entry.id,
                giveawayId: entry.giveawayId,
                username: entry.user.name,
                email: entry.user.email,
                createdAt: entry.createdAt,
              },
            }),
          });

          // connect the outgoing webhook to the entry
          await ctx.prisma.giveawayEntry.update({
            where: { id: webhook.id },
            data: {
              outgoingWebhook: { connect: { id: webhook.id } },
            },
          });
        } catch (e) {
          // ignore failed outgoing webhooks for now
        }
      }
    }),
});
