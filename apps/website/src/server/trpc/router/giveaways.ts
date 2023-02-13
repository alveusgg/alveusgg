import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { getTwitchConfig, type TwitchConfig } from "../../../config/twitch";
import { calcGiveawayConfig } from "../../../utils/giveaways";
import { getUserFollowsBroadcaster } from "../../../utils/twitch-api";
import { isValidCountryCode } from "../../../utils/countries";
import { prisma } from "../../db/client";
import {
  type OutgoingWebhookType,
  triggerOutgoingWebhook,
} from "../../actions/outgoing-webhooks";
import { router, protectedProcedure, publicProcedure } from "../trpc";

export const giveawayEntrySchema = z.object({
  giveawayId: z.string().cuid(),
  givenName: z.string().min(1),
  familyName: z.string().min(1),
  email: z.string().email(),
  addressLine1: z.string().min(1),
  addressLine2: z.string(), // second address line may be empty
  postalCode: z.string().min(1),
  city: z.string().min(1),
  country: z.custom<string>(isValidCountryCode),
  state: z.string(), // state may be left empty
});

async function checkFollowsChannel(
  channelConfig: TwitchConfig["channels"][string],
  twitchAccount: { access_token: string; providerAccountId: string }
) {
  const isFollowing = await getUserFollowsBroadcaster(
    twitchAccount.access_token,
    twitchAccount.providerAccountId,
    channelConfig.id
  );
  if (!isFollowing) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Your connected Twitch account does not follow ${channelConfig.label}!`,
    });
  }
}

async function findActiveGiveaway(giveawaySlugOrId: string) {
  const now = new Date();
  return await prisma.giveaway.findFirst({
    where: {
      active: true,
      startAt: { lt: now },
      AND: [
        { OR: [{ endAt: null }, { endAt: { gt: now } }] },
        { OR: [{ id: giveawaySlugOrId }, { slug: giveawaySlugOrId }] },
      ],
    },
  });
}

export const giveawaysRouter = router({
  getGiveaway: publicProcedure
    .input(
      z.object({
        giveawaySlugOrId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Find the giveaway
      const giveaway = await findActiveGiveaway(input.giveawaySlugOrId);
      if (!giveaway) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Require active session or redirect to log in
      let existingEntry = null;
      if (ctx.session?.user?.id) {
        existingEntry = await prisma.giveawayEntry.findUnique({
          where: {
            giveawayId_userId: {
              userId: ctx.session.user.id,
              giveawayId: giveaway.id,
            },
          },
        });
      }

      return { giveaway, existingEntry };
    }),

  enterGiveaway: protectedProcedure
    .input(giveawayEntrySchema)
    .mutation(async ({ ctx, input }) => {
      // Find giveaway
      const giveaway = await findActiveGiveaway(input.giveawayId);

      if (!giveaway) {
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

      // Check if twitch account is connected
      const twitchAccount = await ctx.prisma.account.findFirst({
        select: {
          providerAccountId: true,
          access_token: true,
        },
        where: {
          userId,
          provider: "twitch",
        },
      });
      const accessToken = twitchAccount?.access_token;
      if (!accessToken) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User is not connected to a Twitch account!",
        });
      }

      // Perform server side checks if required
      const config = calcGiveawayConfig(giveaway.config);
      if (config.checks) {
        // TODO: Make the giveaway config granular. Right now the channel follow check is hard-coded here:
        // NOTE: Does not work, twitch removed API access :(
        const channelConfig = (await getTwitchConfig()).channels
          .alveussanctuary;
        await checkFollowsChannel(channelConfig, {
          access_token: accessToken,
          providerAccountId: twitchAccount.providerAccountId,
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
          email: input.email,
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
            where: { id: entry.id },
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
