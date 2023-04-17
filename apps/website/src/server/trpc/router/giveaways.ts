import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { getTwitchConfig, type TwitchConfig } from "@/config/twitch";
import { calcGiveawayConfig } from "@/utils/giveaways";
import { getUserFollowsBroadcaster } from "@/server/utils/twitch-api";
import {
  type OutgoingWebhookType,
  triggerOutgoingWebhook,
} from "@/server/actions/outgoing-webhooks";
import { router, protectedProcedure } from "@/server/trpc/trpc";
import { createEntry, giveawayEntrySchema } from "@/server/db/giveaways";

export const createGiveawayEntrySchema = giveawayEntrySchema.and(
  z.object({
    giveawayId: z.string().cuid(),
    acceptRules: z.boolean().optional(),
    acceptPrivacy: z.boolean(),
  })
);

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

export const giveawaysRouter = router({
  enterGiveaway: protectedProcedure
    .input(createGiveawayEntrySchema)
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
          code: "NOT_FOUND",
          message: "giveaway not found",
        });
      }

      if (input.acceptPrivacy !== true) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "consent for privacy policy not given",
        });
      }

      const config = calcGiveawayConfig(giveaway.config);
      if (config.hasRules && input.acceptRules !== true) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "rules not accepted",
        });
      }

      const userId = ctx.session.user.id;
      // Check use has not entered already
      const existingEntry = await ctx.prisma.giveawayEntry.findUnique({
        select: {
          id: true,
        },
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
      const entry = await createEntry(userId, giveaway.id, input);

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
                giveawayId: giveaway.id,
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
